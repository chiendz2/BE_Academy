const db = require("../models");

const {
    Course,
    Exam,
    Question,
    QuestionOption,
    ExamQuestion,
    ExamAttempt,
    AttemptAnswer,
} = db;

class ExamController {
    createExam = async (req, res) => {
        try {
            const {
                course_id,
                title,
                description,
                exam_type,
                duration_minutes,
                status,
                IsActive,
                total_questions,
                pass_score,
                max_attempts,
                start_at,
                end_at,
                show_result,
            } = req.body;

            const creator_id = req.user.user_id;

            if (!course_id || !title) {
                return res.status(400).json({
                    message: "Mã khóa học (course_id) và tiêu đề (title) là bắt buộc.",
                });
            }

            const course = await Course.findByPk(course_id);
            if (!course) {
                return res.status(404).json({
                    message: "Khóa học không tìm thấy",
                });
            }

            if (start_at && end_at && new Date(start_at) > new Date(end_at)) {
                return res.status(400).json({
                    message: "Thời gian bắt đầu phải sớm hơn thời gian kết thúc",
                });
            }

            if (duration_minutes !== undefined && duration_minutes <= 0) {
                return res.status(400).json({
                    message: "Thời lượng thi phải lớn hơn 0",
                });
            }

            if (max_attempts !== undefined && max_attempts <= 0) {
                return res.status(400).json({
                    message: "Số lần thi tối đa phải lớn hơn 0",
                });
            }

            if (pass_score !== undefined && (pass_score < 0 || pass_score > 100)) {
                return res.status(400).json({
                    message: "Điểm qua phải nằm trong khoảng từ 0 đến 100",
                });
            }

            const exam = await Exam.create({
                course_id,
                creator_id,
                title,
                description,
                exam_type: exam_type ?? "practice",
                duration_minutes: duration_minutes ?? 60,
                status: status ?? "draft",
                IsActive: IsActive ?? true,
                total_questions: total_questions ?? 0,
                pass_score: pass_score ?? 0,
                max_attempts: max_attempts ?? 1,
                start_at: start_at ?? null,
                end_at: end_at ?? null,
                show_result: show_result ?? true,
            });

            return res.status(201).json({
                message: "Tạo đề thi thành công",
                exam,
            });
        } catch (error) {
            console.log("Error creating exam:", error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    getAllExams = async (req, res) => {
        try {
            let { course_id, page = 1, limit = 10 } = req.query;
            page = parseInt(page);
            limit = parseInt(limit);

            if (isNaN(page) || page < 1) page = 1;
            if (isNaN(limit) || limit < 1) limit = 10;
            if (limit > 100) limit = 100;

            const offset = (page - 1) * limit;

            const where = {
                IsActive: true,
            };
            if (course_id) where.course_id = course_id;

            const { count, rows: exams } = await Exam.findAndCountAll({
                where,
                include: [
                    {
                        model: Course,
                        as: "course",
                        attributes: ["course_id", "title"],
                    },
                ],
                order: [["created_at", "DESC"]],
                limit,
                offset,
            });

            return res.status(200).json({
                message: "Lấy đề thi thành công",
                exams,
                pagination: {
                    currentPage: page,
                    limit,
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                },
            });
        } catch (error) {
            console.log("Error fetching exams:", error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    getExamById = async (req, res) => {
        try {
            const { id } = req.params;

            const exam = await Exam.findByPk(id, {
                include: [
                    {
                        model: Course,
                        as: "course",
                        attributes: ["course_id", "title"],
                    },
                    {
                        model: Question,
                        as: "questions",
                        through: {
                            attributes: ["sort_order", "points"],
                        },
                        include: [
                            {
                                model: QuestionOption,
                                as: "options",
                                attributes: ["option_id", "content"],
                            },
                        ],
                    },
                ],
            });

            if (!exam) {
                return res.status(404).json({
                    message: "Đề thi không tìm thấy",
                });
            }

            return res.status(200).json({
                message: "Lấy đề thi thành công",
                exam,
            });
        } catch (error) {
            console.log("Error fetching exam by id:", error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    updateExam = async (req, res) => {
        try {
            const { id } = req.params;
            const exam = await Exam.findByPk(id);

            if (!exam) {
                return res.status(404).json({
                    message: "Đề thi không tìm thấy",
                });
            }

            const {
                title,
                description,
                exam_type,
                duration_minutes,
                status,
                IsActive,
            } = req.body;

            await exam.update({
                title: title ?? exam.title,
                description: description ?? exam.description,
                exam_type: exam_type ?? exam.exam_type,
                duration_minutes: duration_minutes ?? exam.duration_minutes,
                status: status ?? exam.status,
                IsActive: IsActive ?? exam.IsActive,
            });

            return res.status(200).json({
                message: "Cập nhật đề thi thành công",
                exam,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    deleteExam = async (req, res) => {
        const t = await db.sequelize.transaction();

        try {
            const { id } = req.params;
            const exam = await Exam.findOne({
                where: {
                    id,
                    IsActive: true,
                },
                transaction: t,
            });
            if (!exam) {
                await t.rollback();
                return res.status(404).json({
                    message: "Đề thi không tìm thấy",
                });
            }
            await exam.update(
                { IsActive: false },
                { transaction: t }
            );
            await t.commit();
            return res.status(200).json({
                message: "Xóa đề thi thành công",
            });
        } catch (error) {
            await t.rollback();
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    getExamsByCourseId = async (req, res) => {
        try {
            const { courseId } = req.params;

            const exams = await Exam.findAll({
                where: { course_id: courseId },
                order: [["created_at", "DESC"]],
            });

            return res.status(200).json({
                message: "Lấy đề thi theo khóa học thành công",
                exams,
            });
        } catch (error) {
            console.log("Error fetching exams by course id:", error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    addQuestionsToExam = async (req, res) => {
        const t = await db.sequelize.transaction();

        try {
            const { id } = req.params;
            const { questions } = req.body;

            const exam = await Exam.findByPk(id, { transaction: t });
            if (!exam) {
                await t.rollback();
                return res.status(404).json({
                    message: "Đề thi không tìm thấy",
                });
            }

            if (!Array.isArray(questions) || questions.length === 0) {
                await t.rollback();
                return res.status(400).json({
                    message: "Câu hỏi là bắt buộc",
                });
            }

            for (const item of questions) {
                const question = await Question.findByPk(item.question_id, {
                    transaction: t,
                });

                if (!question) {
                    await t.rollback();
                    return res.status(404).json({
                        message: `Câu hỏi không tìm thấy: ${item.question_id}`,
                    });
                }

                const existed = await ExamQuestion.findOne({
                    where: {
                        exam_id: id,
                        question_id: item.question_id,
                    },
                    transaction: t,
                });

                if (!existed) {
                    await ExamQuestion.create(
                        {
                            exam_id: id,
                            question_id: item.question_id,
                            sort_order: item.sort_order ?? 0,
                            points: item.points ?? 1,
                        },
                        { transaction: t }
                    );
                }
            }
            await t.commit();
            return res.status(200).json({
                message: "Thêm câu hỏi vào đề thi thành công",
            });
        } catch (error) {
            console.log("Error adding questions to exam:", error);
            await t.rollback();
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    removeQuestionFromExam = async (req, res) => {
        try {
            const { id, questionId } = req.params;

            const deleted = await ExamQuestion.destroy({
                where: {
                    exam_id: id,
                    question_id: questionId,
                },
            });

            if (!deleted) {
                return res.status(404).json({
                    message: "Câu hỏi không tìm thấy trong đề thi",
                });
            }

            return res.status(200).json({
                message: "Xóa câu hỏi khỏi đề thi thành công",
            });
        } catch (error) {
            console.log("Error removing question from exam:", error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    startExam = async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.user.user_id;

            const exam = await Exam.findByPk(id, {
                include: [
                    {
                        model: Question,
                        as: "questions",
                        through: {
                            attributes: ["sort_order", "points"],
                        },
                        include: [
                            {
                                model: QuestionOption,
                                as: "options",
                                attributes: ["option_id", "content"],
                            },
                        ],
                    },
                ],
            });

            if (!exam) {
                return res.status(404).json({
                    message: "Đề thi không tìm thấy",
                });
            }

            if (exam.IsActive === false) {
                return res.status(400).json({
                    message: "Đề thi không hoạt động",
                });
            }

            const attempt = await ExamAttempt.create({
                user_id,
                exam_id: id,
                start_time: new Date(),
                status: "in_progress",
                score: 0,
                correct_count: 0,
                wrong_count: 0,
            });

            return res.status(201).json({
                message: "Bắt đầu đề thi thành công",
                attempt,
                exam,
            });
        } catch (error) {
            console.error("Error starting exam:", error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    submitExam = async (req, res) => {
        const t = await db.sequelize.transaction();

        try {
            const { id } = req.params;
            const user_id = req.user.user_id;
            const { attempt_id, answers } = req.body;
            if (!attempt_id || !Array.isArray(answers)) {
                await t.rollback();
                return res.status(400).json({
                    message: "Câu trả lời là bắt buộc",
                });
            }
            const attempt = await ExamAttempt.findOne({
                where: {
                    attempt_id,
                    exam_id: id,
                    user_id,
                    status: "in_progress",
                },
                transaction: t,
            });

            if (!attempt) {
                await t.rollback();
                return res.status(404).json({
                    message: "Attempt không tìm thấy hoặc đã được gửi",
                });
            }
            await AttemptAnswer.destroy({
                where: { attempt_id },
                transaction: t,
            });

            const examQuestions = await ExamQuestion.findAll({
                where: { exam_id: id },
                transaction: t,
            });

            const pointMap = {};
            for (const eq of examQuestions) {
                pointMap[eq.question_id] = Number(eq.points || 1);
            }

            let correct_count = 0;
            let wrong_count = 0;
            let score = 0;

            for (const item of answers) {
                const correctOption = await QuestionOption.findOne({
                    where: {
                        question_id: item.question_id,
                        is_correct: true,
                    },
                    transaction: t,
                });

                const isCorrect =
                    !!correctOption &&
                    correctOption.option_id === item.selected_option_id;

                const earnedScore = isCorrect ? pointMap[item.question_id] || 1 : 0;
                await AttemptAnswer.create(
                    {
                        attempt_id,
                        question_id: item.question_id,
                        selected_option_id: item.selected_option_id,
                        is_correct: isCorrect,
                        score: earnedScore,
                    },
                    { transaction: t }
                );

                if (isCorrect) {
                    correct_count++;
                    score += earnedScore;
                } else {
                    wrong_count++;
                }
            }

            await attempt.update(
                {
                    submit_time: new Date(),
                    status: "submitted",
                    score,
                    correct_count,
                    wrong_count,
                },
                { transaction: t }
            );

            await t.commit();
            return res.status(200).json({
                message: "Submit exam thành công",
                result: {
                    attempt_id,
                    score,
                    correct_count,
                    wrong_count,
                },
            });
        } catch (error) {
            console.log("Error submitting exam:", error);
            await t.rollback();
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    getAttemptResult = async (req, res) => {
        try {
            const { attemptId } = req.params;
            const user_id = req.user.user_id;

            const attempt = await ExamAttempt.findOne({
                where: {
                    attempt_id: attemptId,
                    user_id,
                },
                include: [
                    {
                        model: Exam,
                        as: "exam",
                        attributes: ["exam_id", "title", "duration_minutes"],
                    },
                    {
                        model: AttemptAnswer,
                        as: "answers",
                        include: [
                            {
                                model: Question,
                                as: "question",
                                attributes: ["question_id", "content"],
                            },
                            {
                                model: QuestionOption,
                                as: "selectedOption",
                                attributes: ["option_id", "content"],
                            },
                        ],
                    },
                ],
            });

            if (!attempt) {
                return res.status(404).json({
                    message: "Không tìm thấy kết quả thi",
                });
            }

            return res.status(200).json({
                message: "Lấy kết quả thi thành công",
                attempt,
            });
        } catch (error) {
            console.error("Error fetching attempt result:", error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };
}

module.exports = new ExamController();