const express = require("express");
const router = express.Router();

const chapterController = require("../controllers/chapter.controller");
const Middleware = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/chapters:
 *   get:
 *     summary: Lấy danh sách chương
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo khóa học
 *     responses:
 *       200:
 *         description: Danh sách chương
 *   post:
 *     summary: Tạo chương mới cho khóa học
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - title
 *             properties:
 *               course_id:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               title:
 *                 type: string
 *                 example: Chương 1 - Nhập môn
 *               description:
 *                 type: string
 *                 example: Nội dung tổng quan của chương
 *               sort_order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Tạo chương thành công
 */
router.get("/", Middleware.verifyToken, chapterController.getAllChapters);

router.post(
    "/",
    Middleware.verifyToken,
    Middleware.authorizeRoles("teacher", "admin"),
    chapterController.createChapter
);

/**
 * @swagger
 * /api/chapters/{id}:
 *   get:
 *     summary: Lấy chi tiết một chương
 *     tags: [Chapters]
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
 *         description: Chi tiết chương
 *   put:
 *     summary: Cập nhật chương
 *     tags: [Chapters]
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
 *             type: object
 *             properties:
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật chương thành công
 *   delete:
 *     summary: Xóa chương
 *     tags: [Chapters]
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
 *         description: Xóa chương thành công
 */
router.get("/:id", Middleware.verifyToken, chapterController.getChapterById);

router.put(
    "/:id",
    Middleware.verifyToken,
    Middleware.authorizeRoles("teacher", "admin"),
    chapterController.updateChapter
);

router.delete(
    "/:id",
    Middleware.verifyToken,
    Middleware.authorizeRoles("teacher", "admin"),
    chapterController.deleteChapter
);

/**
 * @swagger
 * /api/courses/{courseId}/chapters:
 *   get:
 *     summary: Lấy danh sách chương theo khóa học
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Danh sách chương của khóa học
 */
router.get(
    "/course/by-course/:courseId",
    Middleware.verifyToken,
    chapterController.getChaptersByCourseId
);

module.exports = router;