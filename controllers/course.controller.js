
const { where } = require("sequelize");
const db = require("../models");
const { Course, Lesson } = db;
const { uploadImageToCloudinary } = require("../utils/uploadToCloudinary");

class CourseController {
    // [POST] /api/courses

    createCourse = async (req, res) => {
        try {
            const { teacher_id, title, description, price, status, access_duration_days } = req.body;

            if (!teacher_id || !title) {
                return res.status(400).json({
                    message: "Mã giáo viên và chức danh là bắt buộc",
                });
            }

            let imageUrl = null;

            if (req.file) {
                const uploadResult = await uploadImageToCloudinary(
                    req.file.buffer,
                    "courses"
                );
                imageUrl = uploadResult.secure_url;
            }
            const course = await Course.create({
                teacher_id,
                title,
                description,
                price: price ?? 0,
                status: status ?? "draft",
                access_duration_days: access_duration_days ?? null,
                ImageUrl: imageUrl,
            });

            return res.status(201).json({
                message: "Create course success",
                course,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    // [GET] /api/courses
    getAllCourses = async (req, res) => {
        try {
            let { page = 1, limit = 10 } = req.query;

            page = parseInt(page);
            limit = parseInt(limit);

            if (isNaN(page) || page < 1) page = 1;
            if (isNaN(limit) || limit < 1) limit = 10;

            const offset = (page - 1) * limit;

            const { count, rows: courses } = await Course.findAndCountAll({
                order: [["created_at", "DESC"]],
                limit,
                offset,
                where: { IsActive: true },
            });

            return res.status(200).json({
                message: "Get all courses success",
                courses,
                pagination: {
                    currentPage: page,
                    limit,
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                },
            });
        } catch (error) {
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    // [GET] /api/courses/:id
    getCourseById = async (req, res) => {
        try {
            const { id } = req.params;

            const course = await Course.findByPk(id, {
                include: [
                    {
                        model: Lesson,
                        as: "lessons",
                        required: false,
                    },
                ],
                where: { IsActive: true },
                order: [[{ model: Lesson, as: "lessons" }, "sort_order", "ASC"]],
            });
            if (!course) {
                return res.status(404).json({
                    message: "Course not found",
                });
            }
            return res.status(200).json({
                message: "Get course success",
                course,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    // [PUT] /api/courses/:id
    updateCourse = async (req, res) => {
        try {
            const { id } = req.params;
            const { teacher_id, title, description, price, status } = req.body;

            const course = await Course.findByPk(id);

            if (!course) {
                return res.status(404).json({
                    message: "Course not found",
                });
            }
            await course.update({
                teacher_id: teacher_id ?? course.teacher_id,
                title: title ?? course.title,
                description: description ?? course.description,
                price: price ?? course.price,
                status: status ?? course.status,
                updated_at: new Date(),
            });
            return res.status(200).json({
                message: "Update course success",
                course,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    // [DELETE] /api/courses/:id
    deleteCourse = async (req, res) => {
        try {
            const { id } = req.params;
            const course = await Course.findByPk(id);
            if (!course) {
                return res.status(404).json({
                    message: "Course not found",
                });
            }
            await course.update({ IsActive: false });
            return res.status(200).json({
                message: "Delete course success",
            });
        } catch (error) {
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };
}

module.exports = new CourseController();