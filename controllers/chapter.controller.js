const db = require("../models");
const { Chapter, Course, Lesson, sequelize } = db;

class ChapterController {
    parsePagination(query) {
        let { page = 1, limit = 10 } = query;

        page = parseInt(page, 10);
        limit = parseInt(limit, 10);

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;
        if (limit > 100) limit = 100;

        return {
            page,
            limit,
            offset: (page - 1) * limit,
        };
    }

    // [POST] /api/chapters
    createChapter = async (req, res) => {
        try {
            const { course_id, title, description, sort_order } = req.body;

            if (!course_id || !title) {
                return res.status(400).json({
                    message: "course_id và title là bắt buộc",
                });
            }

            const course = await Course.findOne({
                where: {
                    course_id,
                    IsActive: true,
                },
            });

            if (!course) {
                return res.status(404).json({
                    message: "Khóa học không tồn tại",
                });
            }

            const chapter = await Chapter.create({
                course_id,
                title,
                description,
                sort_order: sort_order ?? 0,
            });

            return res.status(201).json({
                message: "Tạo chương thành công",
                chapter,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server",
                error: error.message,
            });
        }
    };

    // [GET] /api/chapters
    getAllChapters = async (req, res) => {
        try {
            const { page, limit, offset } = this.parsePagination(req.query);
            const { course_id } = req.query;

            const where = { IsActive: true };
            if (course_id) where.course_id = course_id;

            const { count, rows } = await Chapter.findAndCountAll({
                where,
                include: [
                    {
                        model: Course,
                        as: "course",
                        required: false,
                    },
                ],
                order: [["sort_order", "ASC"]],
                limit,
                offset,
            });

            return res.status(200).json({
                message: "Lấy danh sách chương thành công",
                chapters: rows,
                pagination: {
                    currentPage: page,
                    limit,
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                },
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server",
                error: error.message,
            });
        }
    };

    // [GET] /api/chapters/:chapterId
    getChapterById = async (req, res) => {
        try {
            const { chapterId } = req.params;

            const chapter = await Chapter.findOne({
                where: {
                    chapter_id: chapterId,
                    IsActive: true,
                },
                include: [
                    {
                        model: Course,
                        as: "course",
                        required: false,
                    },
                    {
                        model: Lesson,
                        as: "lessons",
                        required: false,
                        where: { IsActive: true },
                    },
                ],
                order: [[{ model: Lesson, as: "lessons" }, "sort_order", "ASC"]],
            });

            if (!chapter) {
                return res.status(404).json({
                    message: "Chương không tồn tại",
                });
            }

            return res.status(200).json({
                message: "Lấy chi tiết chương thành công",
                chapter,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server",
                error: error.message,
            });
        }
    };

    // [GET] /api/courses/:courseId/chapters
    getChaptersByCourseId = async (req, res) => {
        try {
            const { courseId } = req.params;

            const course = await Course.findOne({
                where: {
                    course_id: courseId,
                    IsActive: true,
                },
            });

            if (!course) {
                return res.status(404).json({
                    message: "Khóa học không tồn tại",
                });
            }

            const chapters = await Chapter.findAll({
                where: {
                    course_id: courseId,
                    IsActive: true,
                },
                include: [
                    {
                        model: Lesson,
                        as: "lessons",
                        required: false,
                        where: { IsActive: true },
                    },
                ],
                order: [
                    ["sort_order", "ASC"],
                    [{ model: Lesson, as: "lessons" }, "sort_order", "ASC"],
                ],
            });

            return res.status(200).json({
                message: "Lấy danh sách chương theo khóa học thành công",
                chapters,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server",
                error: error.message,
            });
        }
    };

    // [PUT] /api/chapters/:chapterId
    updateChapter = async (req, res) => {
        try {
            const { chapterId } = req.params;
            const { course_id, title, description, sort_order } = req.body;

            const chapter = await Chapter.findOne({
                where: {
                    chapter_id: chapterId,
                    IsActive: true,
                },
            });

            if (!chapter) {
                return res.status(404).json({
                    message: "Chương không tồn tại",
                });
            }

            if (course_id) {
                const course = await Course.findOne({
                    where: {
                        course_id,
                        IsActive: true,
                    },
                });

                if (!course) {
                    return res.status(404).json({
                        message: "Khóa học không tồn tại",
                    });
                }
            }

            await chapter.update({
                course_id: course_id ?? chapter.course_id,
                title: title ?? chapter.title,
                description: description ?? chapter.description,
                sort_order: sort_order ?? chapter.sort_order,
                updated_at: new Date(),
            });

            return res.status(200).json({
                message: "Cập nhật chương thành công",
                chapter,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server",
                error: error.message,
            });
        }
    };

    // [DELETE] /api/chapters/:chapterId
    deleteChapter = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { chapterId } = req.params;

            const chapter = await Chapter.findOne({
                where: {
                    chapter_id: chapterId,
                    IsActive: true,
                },
                transaction,
            });

            if (!chapter) {
                await transaction.rollback();
                return res.status(404).json({
                    message: "Chương không tồn tại",
                });
            }

            await chapter.update(
                {
                    IsActive: false,
                    updated_at: new Date(),
                },
                { transaction }
            );

            await Lesson.update(
                {
                    IsActive: false,
                    updated_at: new Date(),
                },
                {
                    where: { chapter_id: chapterId },
                    transaction,
                }
            );

            await transaction.commit();

            return res.status(200).json({
                message: "Xóa chương thành công",
            });
        } catch (error) {
            await transaction.rollback();
            return res.status(500).json({
                message: "Lỗi server",
                error: error.message,
            });
        }
    };
}

module.exports = new ChapterController();