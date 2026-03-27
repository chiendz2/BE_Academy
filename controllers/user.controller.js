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
                    message: "không tìm thấy người dùng",
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
                is_verified,
                job_title,
                academic_degree,
                specialization,
                workplace,
                years_of_experience,
                introduction,
                education_history,
                work_experience,
                awards,
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

            let avatarUrl = null;

            if (req.file) {
                const uploadResult = await uploadToCloudinary(req.file.path || req.file.buffer);
                avatarUrl = uploadResult.secure_url;
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
                avatar: avatarUrl,
                is_verified: is_verified ?? true,

                job_title,
                academic_degree,
                specialization,
                workplace,
                years_of_experience,
                introduction,
                education_history,
                work_experience,
                awards,

                otp_code: null,
                otp_expires_at: null,
                created_at: new Date(),
                updated_at: new Date(),
            });

            const safeUser = await db.User.findByPk(user.user_id, {
                attributes: this.safeAttributes,
            });

            return res.status(201).json({
                message: "tạo người dùng thành công",
                user: safeUser,
            });
        } catch (error) {
            return res.status(500).json({
                message: "lỗi máy chủ",
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

                // thêm các trường hồ sơ giáo viên
                job_title,
                academic_degree,
                specialization,
                workplace,
                years_of_experience,
                introduction,
                education_history,
                work_experience,
                awards,
            } = req.body;

            const user = await db.User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    message: "không tìm thấy người dùng",
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
                        message: "email đã tồn tại",
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

            // thêm các trường còn thiếu
            if (job_title !== undefined) updateData.job_title = job_title;
            if (academic_degree !== undefined) updateData.academic_degree = academic_degree;
            if (specialization !== undefined) updateData.specialization = specialization;
            if (workplace !== undefined) updateData.workplace = workplace;
            if (years_of_experience !== undefined) updateData.years_of_experience = years_of_experience;
            if (introduction !== undefined) updateData.introduction = introduction;
            if (education_history !== undefined) updateData.education_history = education_history;
            if (work_experience !== undefined) updateData.work_experience = work_experience;
            if (awards !== undefined) updateData.awards = awards;

            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            await user.update(updateData);

            const updatedUser = await db.User.findByPk(id, {
                attributes: this.safeAttributes.exclude,
            });

            return res.status(200).json({
                message: "cập nhật người dùng thành công",
                user: updatedUser,
            });
        } catch (error) {
            return res.status(500).json({
                message: "lỗi máy chủ",
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
                    message: "không tìm thấy người dùng",
                });
            }

            await user.update({
                status: "blocked",
                updated_at: new Date(),
            });

            return res.status(200).json({
                message: "khóa người dùng thành công",
            });
        } catch (error) {
            return res.status(500).json({
                message: "lỗi máy chủ",
                error: error.message,
            });
        }
    };
}

module.exports = new UserController();