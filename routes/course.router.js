const express = require("express");
const router = express.Router();

const courseController = require("../controllers/course.controller");
const lessonController = require("../controllers/lesson.controller");
const Middleware = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Lấy danh sách khóa học
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách khóa học
 *   post:
 *     summary: Tạo khóa học
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseInput'
 *     responses:
 *       201:
 *         description: Tạo khóa học thành công
 */
router.get("/", Middleware.verifyToken, courseController.getAllCourses);
router.post("/", Middleware.verifyToken, Middleware.authorizeRoles("teacher", "admin"), courseController.createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Lấy chi tiết khóa học
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Chi tiết khóa học
 *   put:
 *     summary: Cập nhật khóa học
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa khóa học
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.get("/:id", Middleware.verifyToken, courseController.getCourseById);
router.put("/:id", Middleware.verifyToken, Middleware.authorizeRoles("teacher", "admin"), courseController.updateCourse);
router.delete("/:id", Middleware.verifyToken, Middleware.authorizeRoles("teacher", "admin"), courseController.deleteCourse);

module.exports = router;