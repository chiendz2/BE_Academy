const express = require("express");
const router = express.Router();

const examController = require("../controllers/exam.controller");
const Middleware = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Exam management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Exam:
 *       type: object
 *       properties:
 *         exam_id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         course_id:
 *           type: string
 *           format: uuid
 *           example: "111e8400-e29b-41d4-a716-446655440000"
 *         title:
 *           type: string
 *           example: "Midterm Exam"
 *         description:
 *           type: string
 *           example: "Exam for chapter 1 to 5"
 *         duration:
 *           type: integer
 *           example: 60
 *         total_marks:
 *           type: number
 *           example: 100
 *         passing_score:
 *           type: number
 *           example: 50
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateExamInput:
 *       type: object
 *       required:
 *         - course_id
 *         - title
 *       properties:
 *         course_id:
 *           type: string
 *           format: uuid
 *           example: "111e8400-e29b-41d4-a716-446655440000"
 *         title:
 *           type: string
 *           example: "Final Exam"
 *         description:
 *           type: string
 *           example: "Final test for the course"
 *         duration:
 *           type: integer
 *           example: 90
 *         total_marks:
 *           type: number
 *           example: 100
 *         passing_score:
 *           type: number
 *           example: 60
 *
 *     UpdateExamInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Updated Final Exam"
 *         description:
 *           type: string
 *           example: "Updated description"
 *         duration:
 *           type: integer
 *           example: 120
 *         total_marks:
 *           type: number
 *           example: 100
 *         passing_score:
 *           type: number
 *           example: 70
 *
 *     AddQuestionsInput:
 *       type: object
 *       required:
 *         - questionIds
 *       properties:
 *         questionIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           example:
 *             - "222e8400-e29b-41d4-a716-446655440000"
 *             - "333e8400-e29b-41d4-a716-446655440000"
 *
 *     SubmitExamInput:
 *       type: object
 *       required:
 *         - answers
 *       properties:
 *         answers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               question_id:
 *                 type: string
 *                 format: uuid
 *                 example: "222e8400-e29b-41d4-a716-446655440000"
 *               answer_id:
 *                 type: string
 *                 format: uuid
 *                 example: "444e8400-e29b-41d4-a716-446655440000"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /API/exams:
 *   get:
 *     summary: Get all exams
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exams
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/",
    Middleware.verifyToken,
    examController.getAllExams
);

/**
 * @swagger
 * /API/exams:
 *   post:
 *     summary: Create a new exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExamInput'
 *     responses:
 *       201:
 *         description: Exam created successfully
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
    examController.createExam
);

/**
 * @swagger
 * /API/exams/{id}:
 *   get:
 *     summary: Get exam by ID
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam detail
 *       404:
 *         description: Exam not found
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/:id",
    Middleware.verifyToken,
    examController.getExamById
);

/**
 * @swagger
 * /API/exams/{id}:
 *   put:
 *     summary: Update exam by ID
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExamInput'
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Exam not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
    "/:id",
    Middleware.verifyToken,
    Middleware.authorizeRoles("teacher", "admin"),
    examController.updateExam
);

/**
 * @swagger
 * /API/exams/{id}:
 *   delete:
 *     summary: Delete exam by ID
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 *       404:
 *         description: Exam not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
    "/:id",
    Middleware.verifyToken,
    Middleware.authorizeRoles("teacher", "admin"),
    examController.deleteExam
);

/**
 * @swagger
 * /API/exams/course/{courseId}:
 *   get:
 *     summary: Get exams by course ID
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course ID
 *     responses:
 *       200:
 *         description: List of exams for the course
 *       404:
 *         description: Course not found
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/course/:courseId",
    Middleware.verifyToken,
    examController.getExamsByCourseId
);

/**
 * @swagger
 * /API/exams/{id}/questions:
 *   post:
 *     summary: Add questions to an exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddQuestionsInput'
 *     responses:
 *       200:
 *         description: Questions added successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Exam or questions not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
    "/:id/questions",
    Middleware.verifyToken,
    Middleware.authorizeRoles("teacher", "admin"),
    examController.addQuestionsToExam
);

/**
 * @swagger
 * /API/exams/{id}/questions/{questionId}:
 *   delete:
 *     summary: Remove a question from an exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exam ID
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question removed successfully
 *       404:
 *         description: Exam or question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
    "/:id/questions/:questionId",
    Middleware.verifyToken,
    Middleware.authorizeRoles("teacher", "admin"),
    examController.removeQuestionFromExam
);

/**
 * @swagger
 * /API/exams/{id}/start:
 *   post:
 *     summary: Start an exam attempt
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam started successfully
 *       404:
 *         description: Exam not found
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/:id/start",
    Middleware.verifyToken,
    examController.startExam
);

/**
 * @swagger
 * /API/exams/{id}/submit:
 *   post:
 *     summary: Submit an exam attempt
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitExamInput'
 *     responses:
 *       200:
 *         description: Exam submitted successfully
 *       400:
 *         description: Invalid submission data
 *       404:
 *         description: Exam or attempt not found
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/:id/submit",
    Middleware.verifyToken,
    examController.submitExam
);

/**
 * @swagger
 * /API/exams/attempts/{attemptId}/result:
 *   get:
 *     summary: Get exam attempt result
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attempt ID
 *     responses:
 *       200:
 *         description: Exam attempt result
 *       404:
 *         description: Attempt not found
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/attempts/:attemptId/result",
    Middleware.verifyToken,
    examController.getAttemptResult
);

module.exports = router;