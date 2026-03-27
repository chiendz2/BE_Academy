const db = require("../models");
const { Lesson, Course, Chapter } = db;
const { uploadVideoToCloudinary } = require("../utils/uploadToCloudinary");

class LessonController {
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

    // [POST] /api/lessons
    createLesson = async (req, res) => {
        try {
            const {
                chapter_id,
                title,
                description,
                duration,
                sort_order,
                content,
                IsPreview,
            } = req.body;

            if (!chapter_id || !title) {
                return res.status(400).json({
                    message: "chapter_id và title là bắt buộc",
                });
            }

            const chapter = await Chapter.findOne({
                where: {
                    chapter_id,
                    IsActive: true,
                },
                include: [
                    {
                        model: Course,
                        as: "course",
                        required: true,
                        where: { IsActive: true },
                    },
                ],
            });

            if (!chapter) {
                return res.status(404).json({
                    message: "Chương không tồn tại hoặc khóa học đã bị vô hiệu hóa",
                });
            }

            let lesson_link = null;

            if (req.file) {
                const uploadResult = await uploadVideoToCloudinary(
                    req.file.buffer
                );
                lesson_link = uploadResult.secure_url;
            }

            const lesson = await Lesson.create({
                course_id: chapter.course_id,
                chapter_id,
                title,
                description,
                duration,
                lesson_link,
                sort_order: sort_order ?? 0,
                content,
                IsPreview: IsPreview ?? false,
            });

            return res.status(201).json({
                message: "Tạo bài học thành công",
                lesson,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server",
                error: error.message,
            });
        }
    };

    // [GET] /api/lessons?course_id=...&chapter_id=...
    getAllLessons = async (req, res) => {
        try {
            const { page, limit, offset } = this.parsePagination(req.query);
            const { course_id, chapter_id } = req.query;

            const where = { IsActive: true };
            if (chapter_id) where.chapter_id = chapter_id;
            if (course_id) where.course_id = course_id;

            const { count, rows } = await Lesson.findAndCountAll({
                where,
                include: [
                    {
                        model: Course,
                        as: "course",
                        required: false,
                    },
                    {
                        model: Chapter,
                        as: "chapter",
                        required: false,
                    },
                ],
                order: [["sort_order", "ASC"]],
                limit,
                offset,
            });

            return res.status(200).json({
                message: "Lấy danh sách bài học thành công",
                lessons: rows,
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

    // [GET] /api/lessons/:lessonId
    getLessonById = async (req, res) => {
        try {
            const { lessonId } = req.params;

            const lesson = await Lesson.findOne({
                where: {
                    lesson_id: lessonId,
                    IsActive: true,
                },
                include: [
                    {
                        model: Course,
                        as: "course",
                        required: false,
                    },
                    {
                        model: Chapter,
                        as: "chapter",
                        required: false,
                    },
                ],
            });

            if (!lesson) {
                return res.status(404).json({
                    message: "Bài học không tồn tại",
                });
            }

            return res.status(200).json({
                message: "Lấy chi tiết bài học thành công",
                lesson,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server",
                error: error.message,
            });
        }
    };

    // [GET] /api/chapters/:chapterId/lessons
    getLessonsByChapterId = async (req, res) => {
        try {
            const { chapterId } = req.params;

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

            const lessons = await Lesson.findAll({
                where: {
                    chapter_id: chapterId,
                    IsActive: true,
                },
                order: [["sort_order", "ASC"]],
            });

            return res.status(200).json({
                message: "Lấy danh sách bài học theo chương thành công",
                lessons,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server",
                error: error.message,
            });
        }
    };

    // [PUT] /api/lessons/:lessonId
    updateLesson = async (req, res) => {
        try {
            const { lessonId } = req.params;
            const {
                chapter_id,
                title,
                description,
                duration,
                sort_order,
                content,
                IsPreview,
            } = req.body;

            const lesson = await Lesson.findOne({
                where: {
                    lesson_id: lessonId,
                    IsActive: true,
                },
            });

            if (!lesson) {
                return res.status(404).json({
                    message: "Bài học không tồn tại",
                });
            }

            let nextCourseId = lesson.course_id;
            let nextChapterId = lesson.chapter_id;

            if (chapter_id) {
                const chapter = await Chapter.findOne({
                    where: {
                        chapter_id,
                        IsActive: true,
                    },
                    include: [
                        {
                            model: Course,
                            as: "course",
                            required: true,
                            where: { IsActive: true },
                        },
                    ],
                });

                if (!chapter) {
                    return res.status(404).json({
                        message: "Chương mới không tồn tại hoặc khóa học đã bị vô hiệu hóa",
                    });
                }

                nextChapterId = chapter.chapter_id;
                nextCourseId = chapter.course_id;
            }

            let lesson_link = lesson.lesson_link;

            if (req.file) {
                const uploadResult = await uploadVideoToCloudinary(
                    req.file.buffer
                );
                lesson_link = uploadResult.secure_url;
            }

            await lesson.update({
                chapter_id: nextChapterId,
                course_id: nextCourseId,
                title: title ?? lesson.title,
                description: description ?? lesson.description,
                duration: duration ?? lesson.duration,
                sort_order: sort_order ?? lesson.sort_order,
                content: content ?? lesson.content,
                IsPreview: IsPreview ?? lesson.IsPreview,
                lesson_link,
                updated_at: new Date(),
            });

            return res.status(200).json({
                message: "Cập nhật bài học thành công",
                lesson,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server",
                error: error.message,
            });
        }
    };

    // [DELETE] /api/lessons/:lessonId
    deleteLesson = async (req, res) => {
        try {
            const { lessonId } = req.params;

            const lesson = await Lesson.findOne({
                where: {
                    lesson_id: lessonId,
                    IsActive: true,
                },
            });

            if (!lesson) {
                return res.status(404).json({
                    message: "Bài học không tồn tại",
                });
            }

            await lesson.update({
                IsActive: false,
                updated_at: new Date(),
            });

            return res.status(200).json({
                message: "Xóa bài học thành công",
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi server",
                error: error.message,
            });
        }
    };
}

module.exports = new LessonController();