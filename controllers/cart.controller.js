const db = require("../models");

const { CartItem, Course, CourseEnrollment } = db;

class CartController {
    addToCart = async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const { course_id } = req.body;

            if (!course_id) {
                return res.status(400).json({
                    message: "course_id is required",
                });
            }

            const course = await Course.findByPk(course_id);
            if (!course) {
                return res.status(404).json({
                    message: "Course not found",
                });
            }

            if (course.is_published === false) {
                return res.status(400).json({
                    message: "Course is not available for purchase",
                });
            }
            const existedEnrollment = await CourseEnrollment.findOne({
                where: { user_id, course_id },
            });

            if (existedEnrollment) {
                return res.status(400).json({
                    message: "You already own this course",
                });
            }
            const existedCartItem = await CartItem.findOne({
                where: { user_id, course_id },
            });
            if (existedCartItem) {
                return res.status(400).json({
                    message: "Course already in cart",
                });
            }
            const cartItem = await CartItem.create({
                user_id,
                course_id,
                added_at: new Date(),
            });
            return res.status(201).json({
                message: "Add course to cart success",
                cartItem,
            });
        } catch (error) {
            console.error("addToCart error:", error);
            return res.status(500).json({
                message: "Server error",
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
                message: "Get cart success",
                total_amount,
                total_items: cartItems.length,
                cartItems,
            });
        } catch (error) {
            console.error("getMyCart error:", error);
            return res.status(500).json({
                message: "Server error",
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
                    message: "Cart item not found",
                });
            }
            await cartItem.destroy();
            return res.status(200).json({
                message: "Remove course from cart success",
            });
        } catch (error) {
            console.error("removeFromCart error:", error);
            return res.status(500).json({
                message: "Server error",
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
                message: "Clear cart success",
            });
        } catch (error) {
            console.error("clearCart error:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };
}

module.exports = new CartController();