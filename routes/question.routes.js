const express = require("express");
const router = express.Router();

const questionController = require("../controllers/question.controller");
const Middleware = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: Question management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         question_id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         course_id:
 *           type: string
 *           format: uuid
 *           example: "111e8400-e29b-41d4-a716-446655440000"
 *         content:
 *           type: string
 *           example: "What is the capital of France?"
 *         question_type:
 *           type: string
 *           example: "multiple_choice"
 *         marks:
 *           type: number
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateQuestionInput:
 *       type: object
 *       required:
 *         - course_id
 *         - content
 *       properties:
 *         course_id:
 *           type: string
 *           format: uuid
 *           example: "111e8400-e29b-41d4-a716-446655440000"
 *         content:
 *           type: string
 *           example: "What is the capital of France?"
 *         question_type:
 *           type: string
 *           example: "multiple_choice"
 *         marks:
 *           type: number
 *           example: 1
 *
 *     UpdateQuestionInput:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           example: "What is the capital city of France?"
 *         question_type:
 *           type: string
 *           example: "multiple_choice"
 *         marks:
 *           type: number
 *           example: 2
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /API/questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of questions
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/",
    Middleware.verifyToken,
    questionController.getAllQuestions
);

/**
 * @swagger
 * /API/questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestionInput'
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    "/",
    Middleware.verifyToken,
    Middleware.authorizeRoles("teacher", "admin"),
    questionController.createQuestion
);

/**
 * @swagger
 * /API/questions/{id}:
 *   get:
 *     summary: Get question by ID
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question detail
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/:id",
    Middleware.verifyToken,
    questionController.getQuestionById
);

/**
 * @swagger
 * /API/questions/{id}:
 *   put:
 *     summary: Update question by ID
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuestionInput'
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
    "/:id",
    Middleware.verifyToken,
    Middleware.authorizeRoles("teacher", "admin"),
    questionController.updateQuestion
);

/**
 * @swagger
 * /API/questions/{id}:
 *   delete:
 *     summary: Delete question by ID
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
    "/:id",
    Middleware.verifyToken,
    Middleware.authorizeRoles("teacher", "admin"),
    questionController.deleteQuestion
);

/**
 * @swagger
 * /api/questions/search:
 *   get:
 *     summary: Tìm kiếm tổng thể câu hỏi
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm trong content, explanation, option content, exam title
 *         example: đạo hàm
 *       - in: query
 *         name: subject_type
 *         schema:
 *           type: string
 *           enum: [math, literature, english, physics, chemistry, biology, history, geography, civics, it, other]
 *         description: Lọc theo môn học
 *         example: math
 *       - in: query
 *         name: question_type
 *         schema:
 *           type: string
 *           enum: [single_choice, multiple_choice, true_false, short_answer]
 *         description: Lọc theo loại câu hỏi
 *         example: single_choice
 *       - in: query
 *         name: difficulty_level
 *         schema:
 *           type: string
 *         description: Lọc theo độ khó
 *         example: easy
 *       - in: query
 *         name: exam_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc câu hỏi theo bài thi
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hoạt động
 *         example: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số bản ghi mỗi trang
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, content, subject_type, question_type, difficulty_level]
 *           default: created_at
 *         description: Trường sắp xếp
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Tìm kiếm câu hỏi thành công
 *       500:
 *         description: Lỗi server
 */
router.get(
    "/search",
    Middleware.verifyToken,
    questionController.searchQuestions
);

module.exports = router;