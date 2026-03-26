const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { randomInt, createHash } = require("crypto");
const { sendOtpMail } = require("../utils/sendEmail");

class AuthController {
    generateAccessToken(user) {
        return jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET || "91cb6488a778c0c4fbb477db88975aa7198ac21bd07da23794a0269e",
            {
                expiresIn: "7d",
            }
        );
    }

    generateOtp() {
        return String(randomInt(100000, 1000000)); // 6 số
    }

    hashOtp(otp) {
        return createHash("sha256").update(otp).digest("hex");
    }
    register = async (req, res) => {
        const transaction = await db.sequelize.transaction();
        try {
            const {
                username,
                email,
                password,
                full_name,
                phone,
                address,
                avatar,
                role,
            } = req.body;

            if (!username || !email || !password) {
                await transaction.rollback();
                return res.status(400).json({
                    message: "Tên người dùng, email và mật khẩu là bắt buộc",
                });
            }

            const existingUserByEmail = await db.User.findOne({
                where: { email },
            });

            if (existingUserByEmail) {
                await transaction.rollback();
                return res.status(400).json({
                    message: "Email đã tồn tại",
                });
            }

            const existingUserByUsername = await db.User.findOne({
                where: { username },
            });

            if (existingUserByUsername) {
                await transaction.rollback();
                return res.status(400).json({
                    message: "Tên người dùng đã tồn tại",
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const otp = this.generateOtp();
            const otpHash = this.hashOtp(otp);
            const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

            const user = await db.User.create({
                username,
                email,
                password: hashedPassword,
                full_name,
                phone,
                address,
                avatar,
                role: role || "student",
                status: "active",
                is_verified: false,
                otp_code: otpHash,
                otp_expires_at: otpExpiresAt,
            }, { transaction });

            await sendOtpMail(user.email, otp);

            await transaction.commit();

            return res.status(201).json({
                message: "Đăng ký thành công, vui lòng xác minh mã OTP được gửi đến email",
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    is_verified: user.is_verified,
                    full_name: user.full_name,
                    phone: user.phone,
                    address: user.address,
                    avatar: user.avatar,
                },
            });
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(error);
            return res.status(500).json({
                message: "server Error",
                error: error.message,
            });
        }
    };
    verifyOtp = async (req, res) => {
        try {
            const { email, otp } = req.body;

            if (!email || !otp) {
                return res.status(400).json({
                    message: "Email và mã OTP là bắt buộc",
                });
            }
            const user = await db.User.findOne({
                where: { email },
            });
            if (!user) {
                return res.status(404).json({
                    message: "Người dùng không tồn tại",
                });
            }
            if (user.is_verified) {
                return res.status(400).json({
                    message: "Tài khoản đã được xác minh",
                });
            }
            if (!user.otp_code || !user.otp_expires_at) {
                return res.status(400).json({
                    message: "Mã OTP không tìm thấy, vui lòng gửi lại mã OTP",
                });
            }
            if (new Date() > new Date(user.otp_expires_at)) {
                return res.status(400).json({
                    message: "Mã OTP đã hết hạn, vui lòng gửi lại mã OTP",
                });
            }
            const otpHash = this.hashOtp(otp);

            if (otpHash !== user.otp_code) {
                return res.status(400).json({
                    message: "Mã OTP không hợp lệ",
                });
            }

            await user.update({
                is_verified: true,
                otp_code: null,
                otp_expires_at: null,
            });

            const accessToken = this.generateAccessToken(user);

            return res.status(200).json({
                message: "Xác minh OTP thành công",
                accessToken,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    is_verified: user.is_verified,
                    full_name: user.full_name,
                    phone: user.phone,
                    address: user.address,
                    avatar: user.avatar,
                },
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    resendOtp = async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({
                    message: "Email là bắt buộc",
                });
            }
            const user = await db.User.findOne({
                where: { email },
            });
            if (!user) {
                return res.status(404).json({
                    message: "Người dùng không tồn tại",
                });
            }
            if (user.is_verified) {
                return res.status(400).json({
                    message: "Tài khoản đã được xác minh",
                });
            }
            const otp = this.generateOtp();
            const otpHash = this.hashOtp(otp);
            const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

            await user.update({
                otp_code: otpHash,
                otp_expires_at: otpExpiresAt,
            });

            await sendOtpMail(user.email, otp);

            return res.status(200).json({
                message: "Gửi lại mã OTP thành công",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: "Email và mật khẩu là bắt buộc",
                });
            }

            const user = await db.User.findOne({
                where: { email },
            });

            if (!user) {
                return res.status(400).json({
                    message: "Email hoặc mật khẩu không đúng",
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({
                    message: "Email hoặc mật khẩu không đúng",
                });
            }

            if (user.status !== "active") {
                return res.status(403).json({
                    message: "Tài khoản không hoạt động",
                });
            }

            if (!user.is_verified) {
                return res.status(403).json({
                    message: "Tài khoản chưa được xác minh, vui lòng xác minh OTP",
                });
            }

            const accessToken = this.generateAccessToken(user);

            return res.status(200).json({
                message: "Đăng nhập thành công",
                accessToken,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    is_verified: user.is_verified,
                    full_name: user.full_name,
                    phone: user.phone,
                    address: user.address,
                    avatar: user.avatar,
                },
            });
        } catch (error) {
            return res.status(500).json({
                message: "server Error",
                error: error.message,
            });
        }
    };

    getProfile = async (req, res) => {
        try {
            const user = await db.User.findByPk(req.user.user_id, {
                attributes: { exclude: ["password"] },
            });

            if (!user) {
                return res.status(404).json({
                    message: "user not found",
                });
            }

            return res.status(200).json({
                message: "get profile success",
                user,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "server Error",
                error: error.message,
            });
        }
    };
}
module.exports = new AuthController();