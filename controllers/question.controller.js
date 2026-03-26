const db = require("../models");

const { Course, Question, QuestionOption } = db;

class QuestionController {
    createQuestion = async (req, res) => {
        const t = await db.sequelize.transaction();

        try {
            const {
                course_id,
                content,
                question_type,
                explanation,
                options,
                exam_id
            } = req.body;

            if (!course_id || !content) {
                await t.rollback();
                return res.status(400).json({
                    message: "course_id and content are required",
                });
            }
            const course = await Course.findByPk(course_id, { transaction: t });
            if (!course) {
                await t.rollback();
                return res.status(404).json({
                    message: "Course not found",
                });
            }
            if (!Array.isArray(options) || options.length < 2) {
                await t.rollback();
                return res.status(400).json({
                    message: "Question must have at least 2 options",
                });
            }
            const correctCount = options.filter((x) => x.is_correct).length;
            if (correctCount < 1) {
                await t.rollback();
                return res.status(400).json({
                    message: "Question must have at least 1 correct option",
                });
            }
            const question = await Question.create(
                {
                    course_id,
                    content,
                    question_type: question_type ?? "single_choice",
                    explanation,
                    exam_id: exam_id ?? null,
                },
                { transaction: t }
            );
            const optionPayload = options.map((item) => ({
                question_id: question.question_id,
                content: item.content,
                is_correct: !!item.is_correct,
            }));
            await QuestionOption.bulkCreate(optionPayload, { transaction: t });
            await t.commit();
            const createdQuestion = await Question.findByPk(question.question_id, {
                include: [
                    {
                        model: QuestionOption,
                        as: "options",
                    },
                ],
            });
            return res.status(201).json({
                message: "Create question success",
                question: createdQuestion,
            });
        } catch (error) {

            console.error("Error creating question:", error);
            await t.rollback();
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    getAllQuestions = async (req, res) => {
        try {
            let { course_id, page = 1, limit = 10 } = req.query;

            page = parseInt(page);
            limit = parseInt(limit);

            if (isNaN(page) || page < 1) page = 1;
            if (isNaN(limit) || limit < 1) limit = 10;
            if (limit > 100) limit = 100;
            const offset = (page - 1) * limit;
            const where = {};
            if (course_id) where.course_id = course_id;
            const { count, rows: questions } = await Question.findAndCountAll({
                where,
                include: [
                    {
                        model: QuestionOption,
                        as: "options",
                    },
                ],
                order: [["created_at", "DESC"]],
                limit,
                offset,
                distinct: true,
            });

            return res.status(200).json({
                message: "Get questions success",
                questions,
                pagination: {
                    currentPage: page,
                    limit,
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                },
            });
        } catch (error) {
            console.error("Error fetching questions:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };


    searchQuestions = async (req, res) => {
        try {
            let {
                q,
                subject_type,
                question_type,
                difficulty_level,
                exam_id,
                is_active,
                page = 1,
                limit = 10,
                sort_by = "created_at",
                sort_order = "DESC",
            } = req.query;

            page = parseInt(page);
            limit = parseInt(limit);

            if (isNaN(page) || page < 1) page = 1;
            if (isNaN(limit) || limit < 1) limit = 10;
            if (limit > 100) limit = 100;

            const offset = (page - 1) * limit;

            const where = {};
            const include = [
                {
                    model: QuestionOption,
                    as: "options",
                    required: false,
                },
                {
                    model: Exam,
                    as: "exams",
                    through: {
                        attributes: ["sort_order", "points"],
                    },
                    attributes: ["exam_id", "title"],
                    required: false,
                },
            ];

            if (subject_type) {
                const subjectList = subject_type
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean);

                if (subjectList.length === 1) {
                    where.subject_type = subjectList[0];
                } else if (subjectList.length > 1) {
                    where.subject_type = {
                        [Op.in]: subjectList,
                    };
                }
            }

            if (question_type) {
                const questionTypeList = question_type
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean);

                if (questionTypeList.length === 1) {
                    where.question_type = questionTypeList[0];
                } else if (questionTypeList.length > 1) {
                    where.question_type = {
                        [Op.in]: questionTypeList,
                    };
                }
            }

            if (difficulty_level) {
                where.difficulty_level = difficulty_level;
            }

            if (typeof is_active !== "undefined") {
                where.IsActive = is_active === "true";
            }

            if (exam_id) {
                include[1].where = { exam_id };
                include[1].required = true;
            }

            if (q && q.trim()) {
                const keyword = `%${q.trim()}%`;

                where[Op.or] = [
                    { content: { [Op.like]: keyword } },
                    { explanation: { [Op.like]: keyword } },
                    { "$options.content$": { [Op.like]: keyword } },
                    { "$exams.title$": { [Op.like]: keyword } },
                ];
            }

            const allowedSortFields = [
                "created_at",
                "content",
                "subject_type",
                "question_type",
                "difficulty_level",
            ];

            if (!allowedSortFields.includes(sort_by)) {
                sort_by = "created_at";
            }

            sort_order = String(sort_order).toUpperCase() === "ASC" ? "ASC" : "DESC";

            const { count, rows } = await Question.findAndCountAll({
                where,
                include,
                order: [[sort_by, sort_order]],
                limit,
                offset,
                distinct: true,
                subQuery: false,
            });

            return res.status(200).json({
                message: "Search questions success",
                filters: {
                    q: q || null,
                    subject_type: subject_type || null,
                    question_type: question_type || null,
                    difficulty_level: difficulty_level || null,
                    exam_id: exam_id || null,
                    is_active:
                        typeof is_active !== "undefined" ? is_active === "true" : null,
                    sort_by,
                    sort_order,
                },
                questions: rows,
                pagination: {
                    currentPage: page,
                    limit,
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                },
            });
        } catch (error) {
            console.error("Error searching questions:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    getQuestionById = async (req, res) => {
        try {
            const { id } = req.params;
            const question = await Question.findByPk(id, {
                include: [
                    {
                        model: QuestionOption,
                        as: "options",
                    },
                ]
            });
            if (!question) {
                return res.status(404).json({
                    message: "Question not found",
                });
            }
            return res.status(200).json({
                message: "Get question success",
                question,
            });
        } catch (error) {
            console.error("Error fetching question by ID:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    updateQuestion = async (req, res) => {
        const t = await db.sequelize.transaction();
        try {
            const { id } = req.params;
            const {
                course_id,
                content,
                question_type,
                explanation,
                options,
            } = req.body;

            const question = await Question.findByPk(id, { transaction: t });
            if (!question) {
                await t.rollback();
                return res.status(404).json({
                    message: "Question not found",
                });
            }

            await question.update(
                {
                    course_id: course_id ?? question.course_id,
                    content: content ?? question.content,
                    question_type: question_type ?? question.question_type,
                    explanation: explanation ?? question.explanation,
                },
                { transaction: t }
            );

            if (Array.isArray(options) && options.length > 0) {
                const correctCount = options.filter((x) => x.is_correct).length;
                if (correctCount < 1) {
                    await t.rollback();
                    return res.status(400).json({
                        message: "Question must have at least 1 correct option",
                    });
                }

                await QuestionOption.destroy({
                    where: { question_id: question.question_id },
                    transaction: t,
                });

                const optionPayload = options.map((item) => ({
                    question_id: question.question_id,
                    content: item.content,
                    is_correct: !!item.is_correct,
                }));

                await QuestionOption.bulkCreate(optionPayload, { transaction: t });
            }

            await t.commit();

            const updatedQuestion = await Question.findByPk(id, {
                include: [
                    {
                        model: QuestionOption,
                        as: "options",
                    },
                ],
            });

            return res.status(200).json({
                message: "Update question success",
                question: updatedQuestion,
            });
        } catch (error) {
            await t.rollback();
            console.error("Error updating question:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    deleteQuestion = async (req, res) => {
        const t = await db.sequelize.transaction();

        try {
            const { id } = req.params;

            const question = await Question.findByPk(id, { transaction: t });
            if (!question) {
                await t.rollback();
                return res.status(404).json({
                    message: "Question not found",
                });
            }

            await QuestionOption.destroy({
                where: { question_id: id },
                transaction: t,
            });

            await question.destroy({ transaction: t });

            await t.commit();

            return res.status(200).json({
                message: "Delete question success",
            });
        } catch (error) {
            console.error("Error deleting question:", error);
            await t.rollback();
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };
}

module.exports = new QuestionController();