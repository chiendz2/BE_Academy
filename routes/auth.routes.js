const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /API/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john123
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: 0987654321
 *               address:
 *                 type: string
 *                 example: Ha Noi
 *               avatar:
 *                 type: string
 *                 example: https://example.com/avatar.png
 *               role:
 *                 type: string
 *                 example: student
 *     responses:
 *       201:
 *         description: Register success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: register success
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     username:
 *                       type: string
 *                       example: john123
 *                     email:
 *                       type: string
 *                       example: john@gmail.com
 *                     role:
 *                       type: string
 *                       example: student
 *                     status:
 *                       type: string
 *                       example: active
 *                     full_name:
 *                       type: string
 *                       example: John Doe
 *                     phone:
 *                       type: string
 *                       example: 0987654321
 *                     address:
 *                       type: string
 *                       example: Ha Noi
 *                     avatar:
 *                       type: string
 *                       example: https://example.com/avatar.png
 *       400:
 *         description: Validation error or duplicate user
 *       500:
 *         description: Server error
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /API/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /API/auth/profile:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.get("/profile", authMiddleware.verifyToken, authController.getProfile);

/**
 * @swagger
 * /API/auth/verify-otp:
 *   post:
 *     summary: Xác thực mã OTP đã gửi qua email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Xác thực OTP thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verify OTP success
 *       400:
 *         description: OTP không hợp lệ hoặc đã hết hạn
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Server error
 */
router.post("/verify-otp", authController.verifyOtp);
/**
 * @swagger
 * /API/auth/resend-otp:
 *   post:
 *     summary: Gửi lại mã OTP qua email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *     responses:
 *       200:
 *         description: Gửi lại OTP thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Resend OTP success
 *       400:
 *         description: Email không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Server error
 */
router.post("/resend-otp", authController.resendOtp);


module.exports = router;