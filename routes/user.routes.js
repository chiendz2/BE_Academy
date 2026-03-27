const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const Middleware = require("../middleware/auth.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           example: admin
 *         status:
 *           type: string
 *           example: active
 *         full_name:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         avatar:
 *           type: string
 *         is_verified:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     CreateUserInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: admin01
 *         email:
 *           type: string
 *           example: admin01@gmail.com
 *         password:
 *           type: string
 *           example: 123456
 *         role:
 *           type: string
 *           example: admin
 *         status:
 *           type: string
 *           example: active
 *         full_name:
 *           type: string
 *           example: Nguyen Van A
 *         phone:
 *           type: string
 *           example: 0123456789
 *         address:
 *           type: string
 *           example: Ha Noi
 *         avatar:
 *           type: string
 *           example: https://example.com/avatar.png
 *         is_verified:
 *           type: boolean
 *           example: true
 *
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *         status:
 *           type: string
 *         full_name:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         avatar:
 *           type: string
 *         is_verified:
 *           type: boolean
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// chỉ admin được dùng
router.use(Middleware.verifyToken, Middleware.authorizeRoles("admin"));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         example: bang
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         example: admin
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         example: active
 *     responses:
 *       200:
 *         description: Lấy danh sách user thành công
 *       500:
 *         description: Server error
 */
router.get("/", userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy chi tiết user theo id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 2c1d7d86-1234-4567-890a-bcdef1234567
 *     responses:
 *       200:
 *         description: Lấy user thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User không tồn tại
 *       500:
 *         description: Server error
 */
router.get("/:id", userController.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Admin tạo user mới
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       201:
 *         description: Tạo user thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc email/username đã tồn tại
 *       500:
 *         description: Server error
 */
router.post("/", userController.createUserByAdmin);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Admin cập nhật user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 2c1d7d86-1234-4567-890a-bcdef1234567
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInput'
 *     responses:
 *       200:
 *         description: Cập nhật user thành công
 *       404:
 *         description: User không tồn tại
 *       500:
 *         description: Server error
 */
router.put("/:id", userController.updateUserByAdmin);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Admin chặn user bằng cách cập nhật status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 2c1d7d86-1234-4567-890a-bcdef1234567
 *     responses:
 *       200:
 *         description: Chặn user thành công
 *       404:
 *         description: User không tồn tại
 *       500:
 *         description: Server error
 */
router.delete("/:id", userController.deleteUserByAdmin);

module.exports = router;