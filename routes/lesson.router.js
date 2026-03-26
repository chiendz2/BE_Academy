const express = require("express");
const router = express.Router();

const lessonController = require("../controllers/lesson.controller");
const Middleware = require("../middleware/auth.middleware");
const uploadVideo = require("../utils/uploadVideo");
/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Lấy danh sách bài học
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách bài học
 *   post:
 *     summary: Tạo bài học kèm video
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - title
 *             properties:
 *               course_id:
 *                 type: string
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               title:
 *                 type: string
 *                 example: Bài học 1
 *               description:
 *                 type: string
 *                 example: Giới thiệu khóa học
 *               duration:
 *                 type: integer
 *                 example: 300
 *               sort_order:
 *                 type: integer
 *                 example: 1
 *               content:
 *                 type: string
 *                 example: Nội dung bài học
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tạo bài học thành công
 */
router.get("/", Middleware.verifyToken, lessonController.getAllLessons);
router.post(
    "/",
    Middleware.verifyToken,
    uploadVideo.single("video"),
    Middleware.authorizeRoles("teacher", "admin"),
    lessonController.createLesson
);

/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Lấy chi tiết bài học
 *     tags: [Lessons]
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
 *         description: Chi tiết bài học
 *   put:
 *     summary: Cập nhật bài học
 *     tags: [Lessons]
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
 *             $ref: '#/components/schemas/CreateLessonInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *   delete:
 *     summary: Xóa bài học
 *     tags: [Lessons]
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
router.get("/:id", Middleware.verifyToken, lessonController.getLessonById);
router.put("/:id", Middleware.verifyToken, Middleware.authorizeRoles("teacher", "admin"), lessonController.updateLesson);
router.delete("/:id", Middleware.verifyToken, Middleware.authorizeRoles("teacher", "admin"), lessonController.deleteLesson);

module.exports = router;