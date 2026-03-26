const db = require("../models");

const { CartItem, Course, CourseEnrollment } = db;

class CartController {
    addToCart = async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const { course_id } = req.body;

            if (!course_id) {
                return res.status(400).json({
                    message: "course_id là bắt buộc",
                });
            }

            const course = await Course.findByPk(course_id);
            if (!course) {
                return res.status(404).json({
                    message: "Không tìm thấy khóa học",
                });
            }

            if (course.is_published === false) {
                return res.status(400).json({
                    message: "Khóa học không khả dụng để mua",
                });
            }
            const existedEnrollment = await CourseEnrollment.findOne({
                where: { user_id, course_id },
            });

            if (existedEnrollment) {
                return res.status(400).json({
                    message: "Bạn đã sở hữu khóa học này",
                });
            }
            const existedCartItem = await CartItem.findOne({
                where: { user_id, course_id },
            });
            if (existedCartItem) {
                return res.status(400).json({
                    message: "Khóa học đã có trong giỏ hàng",
                });
            }
            const cartItem = await CartItem.create({
                user_id,
                course_id,
                added_at: new Date(),
            });
            return res.status(201).json({
                message: "Thêm khóa học vào giỏ hàng thành công",
                cartItem,
            });
        } catch (error) {
            console.error("addToCart error:", error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    getMyCart = async (req, res) => {
        try {
            const user_id = req.user.user_id;

            const cartItems = await CartItem.findAll({
                where: { user_id },
                include: [
                    {
                        model: Course,
                        as: "course",
                    },
                ],
                order: [["added_at", "DESC"]],
            });
            const total_amount = cartItems.reduce((sum, item) => {
                const course = item.course;
                if (!course) return sum;

                const price = Number(course.sale_price ?? course.price ?? 0);
                return sum + price;
            }, 0);
            return res.status(200).json({
                message: "Lấy giỏ hàng thành công",
                total_amount,
                total_items: cartItems.length,
                cartItems,
            });
        } catch (error) {
            console.error("getMyCart error:", error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };
    removeFromCart = async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const { cart_id } = req.params;

            const cartItem = await CartItem.findOne({
                where: { cart_id, user_id },
            });

            if (!cartItem) {
                return res.status(404).json({
                    message: "Không tìm thấy sản phẩm trong giỏ hàng",
                });
            }
            await cartItem.destroy();
            return res.status(200).json({
                message: "Xóa khóa học khỏi giỏ hàng thành công",
            });
        } catch (error) {
            console.error("removeFromCart error:", error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };

    clearCart = async (req, res) => {
        try {
            const user_id = req.user.user_id;

            await CartItem.destroy({
                where: { user_id },
            });

            return res.status(200).json({
                message: "Xóa giỏ hàng thành công",
            });
        } catch (error) {
            console.error("clearCart error:", error);
            return res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message,
            });
        }
    };
}

module.exports = new CartController();