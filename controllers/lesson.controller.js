const db = require("../models");
const uploadVideoToCloudinary = require("../utils/uploadToCloudinary");
const { Lesson, Course } = db;

class LessonController {
    // [POST] /api/lessons
    createLesson = async (req, res) => {
        try {
            const {
                course_id,
                title,
                description,
                duration,
                sort_order,
                content,
            } = req.body;

            if (!course_id || !title) {
                return res.status(400).json({
                    message: "course_id and title are required",
                });
            }

            const course = await Course.findByPk(course_id);
            if (!course) {
                return res.status(404).json({
                    message: "Course not found",
                });
            }
            let lesson_link = null;

            if (req.file) {
                const uploadResult = await uploadVideoToCloudinary(req.file.buffer);
                lesson_link = uploadResult.secure_url;
            }

            const lesson = await Lesson.create({
                course_id,
                title,
                description,
                duration,
                lesson_link,
                sort_order: sort_order ?? 0,
                content,
            });

            return res.status(201).json({
                message: "Create lesson success",
                lesson,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    // [GET] /api/lessons
    getAllLessons = async (req, res) => {
        try {
            let { page = 1, limit = 10 } = req.query;
            page = parseInt(page);
            limit = parseInt(limit);
            if (isNaN(page) || page < 1) page = 1;
            if (isNaN(limit) || limit < 1) limit = 10;
            if (limit > 100) limit = 100;
            const offset = (page - 1) * limit;

            const { count, rows: lessons } = await Lesson.findAndCountAll({
                include: [
                    {
                        model: Course,
                        as: "course",
                    },
                ],
                order: [["sort_order", "ASC"]],
                limit,
                offset,
            });
            return res.status(200).json({
                message: "Get all lessons success",
                lessons,
                pagination: {
                    currentPage: page,
                    limit,
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                },
            });
        } catch (error) {
            console.log("Error getting all lessons:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    // [GET] /api/lessons/:id
    getLessonById = async (req, res) => {
        try {
            const { id } = req.params;

            const lesson = await Lesson.findByPk(id, {
                include: [
                    {
                        model: Course,
                        as: "course",
                    },
                ],
            });

            if (!lesson) {
                return res.status(404).json({
                    message: "Lesson not found",
                });
            }

            return res.status(200).json({
                message: "Get lesson success",
                lesson,
            });
        } catch (error) {
            console.log("Error fetching lesson by id:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    // [GET] /api/courses/:courseId/lessons
    getLessonsByCourseId = async (req, res) => {
        try {
            const { courseId } = req.params;

            const course = await Course.findByPk(courseId);
            if (!course) {
                return res.status(404).json({
                    message: "Course not found",
                });
            }
            const lessons = await Lesson.findAll({
                where: { course_id: courseId },
                order: [["sort_order", "ASC"]],
            });

            return res.status(200).json({
                message: "Get lessons by course success",
                lessons,
            });
        } catch (error) {
            console.log("Error fetching lessons by course id:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    // [PUT] /api/lessons/:id
    updateLesson = async (req, res) => {
        try {
            const { id } = req.params;
            const {
                course_id,
                title,
                description,
                duration,
                sort_order,
                content,
            } = req.body;

            const lesson = await Lesson.findByPk(id);
            if (!lesson) {
                return res.status(404).json({
                    message: "Lesson not found",
                });
            }
            if (course_id) {
                const course = await Course.findByPk(course_id);
                if (!course) {
                    return res.status(404).json({
                        message: "Course not found",
                    });
                }
            }
            await lesson.update({
                course_id: course_id ?? lesson.course_id,
                title: title ?? lesson.title,
                description: description ?? lesson.description,
                duration: duration ?? lesson.duration,
                sort_order: sort_order ?? lesson.sort_order,
                content: content ?? lesson.content,
                updated_at: new Date(),
            });

            return res.status(200).json({
                message: "Update lesson success",
                lesson,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    // [DELETE] /api/lessons/:id
    deleteLesson = async (req, res) => {
        try {
            const { id } = req.params;
            const lesson = await Lesson.findByPk(id);
            if (!lesson) {
                return res.status(404).json({
                    message: "Lesson not found",
                });
            }
            await lesson.update({ IsActive: false });
            return res.status(200).json({
                message: "Delete lesson success",
            });
        } catch (error) {
            console.log("Error deleting lesson:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };
}

module.exports = new LessonController();