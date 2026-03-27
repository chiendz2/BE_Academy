const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const db = require("../models");

class UserController {
    safeAttributes = {
        exclude: ["password", "otp_code"],
    };

    getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, keyword = "", role, status } = req.query;

        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = Math.max(parseInt(limit) || 10, 1);
        const offset = (pageNumber - 1) * limitNumber;

        const where = {};

        if (keyword) {
            where[Op.or] = [
                { username: { [Op.like]: `%${keyword}%` } },
                { email: { [Op.like]: `%${keyword}%` } },
                { full_name: { [Op.like]: `%${keyword}%` } },
                { phone: { [Op.like]: `%${keyword}%` } },
            ];
        }

        if (role) where.role = role;
        if (status) where.status = status;

        const { count, rows } = await db.User.findAndCountAll({
            where,
            attributes: this.safeAttributes, 
            order: [["created_at", "DESC"]],
            limit: limitNumber,
            offset,
        });

        return res.status(200).json({
            message: "get users success",
            total: count,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(count / limitNumber),
            users: rows,
        });
    } catch (error) {
        return res.status(500).json({
            message: "server Error",
            error: error.message,
        });
    }
};

    getUserById = async (req, res) => {
        try {
            const { id } = req.params;

            const user = await db.User.findByPk(id, {
                attributes: this.safeAttributes.exclude,
            });

            if (!user) {
                return res.status(404).json({
                    message: "user not found",
                });
            }

            return res.status(200).json({
                message: "get user success",
                user,
            });
        } catch (error) {
            return res.status(500).json({
                message: "server Error",
                error: error.message,
            });
        }
    };

    createUserByAdmin = async (req, res) => {
        try {
            const {
                username,
                email,
                password,
                role,
                status,
                full_name,
                phone,
                address,
                avatar,
                is_verified,
            } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({
                    message: "username, email and password are required",
                });
            }

            const existingUserByEmail = await db.User.findOne({
                where: { email },
            });

            if (existingUserByEmail) {
                return res.status(400).json({
                    message: "Email already exists",
                });
            }

            const existingUserByUsername = await db.User.findOne({
                where: { username },
            });

            if (existingUserByUsername) {
                return res.status(400).json({
                    message: "Username already exists",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await db.User.create({
                username,
                email,
                password: hashedPassword,
                role: role || "student",
                status: status || "active",
                full_name,
                phone,
                address,
                avatar,
                is_verified: is_verified ?? true,
                otp_code: null,
                otp_expires_at: null,
                created_at: new Date(),
                updated_at: new Date(),
            });

            const safeUser = await db.User.findByPk(user.user_id, {
                attributes: this.safeAttributes.exclude,
            });

            return res.status(201).json({
                message: "create user success",
                user: safeUser,
            });
        } catch (error) {
            return res.status(500).json({
                message: "server Error",
                error: error.message,
            });
        }
    };

    updateUserByAdmin = async (req, res) => {
        try {
            const { id } = req.params;
            const {
                username,
                email,
                password,
                role,
                status,
                full_name,
                phone,
                address,
                avatar,
                is_verified,
            } = req.body;

            const user = await db.User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    message: "user not found",
                });
            }
            if (email && email !== user.email) {
                const existingUserByEmail = await db.User.findOne({
                    where: {
                        email,
                        user_id: { [Op.ne]: id },
                    },
                });
                if (existingUserByEmail) {
                    return res.status(400).json({
                        message: "Email already exists",
                    });
                }
            }
            if (username && username !== user.username) {
                const existingUserByUsername = await db.User.findOne({
                    where: {
                        username,
                        user_id: { [Op.ne]: id },
                    },
                });

                if (existingUserByUsername) {
                    return res.status(400).json({
                        message: "Username already exists",
                    });
                }
            }
            const updateData = {
                updated_at: new Date(),
            };
            if (username !== undefined) updateData.username = username;
            if (email !== undefined) updateData.email = email;
            if (role !== undefined) updateData.role = role;
            if (status !== undefined) updateData.status = status;
            if (full_name !== undefined) updateData.full_name = full_name;
            if (phone !== undefined) updateData.phone = phone;
            if (address !== undefined) updateData.address = address;
            if (avatar !== undefined) updateData.avatar = avatar;
            if (is_verified !== undefined) updateData.is_verified = is_verified;

            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            await user.update(updateData);

            const updatedUser = await db.User.findByPk(id, {
                attributes: this.safeAttributes.exclude,
            });

            return res.status(200).json({
                message: "update user success",
                user: updatedUser,
            });
        } catch (error) {
            return res.status(500).json({
                message: "server Error",
                error: error.message,
            });
        }
    };

    deleteUserByAdmin = async (req, res) => {
        try {
            const { id } = req.params;

            const user = await db.User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    message: "user not found",
                });
            }

            await user.update({
                status: "blocked",
                updated_at: new Date(),
            });

            return res.status(200).json({
                message: "block user success",
            });
        } catch (error) {
            return res.status(500).json({
                message: "server Error",
                error: error.message,
            });
        }
    };
}

module.exports = new UserController();