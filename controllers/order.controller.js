const db = require("../models");

const {
    sequelize,
    CartItem,
    Course,
    Order,
    OrderItem,
    CourseEnrollment,
} = db;

class OrderController {
    checkout = async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const user_id = req.user.user_id;
            const { payment_method = "manual" } = req.body;
            const cartItems = await CartItem.findAll({
                where: { user_id },
                include: [
                    {
                        model: Course,
                        as: "course",
                    },
                ],
                transaction,
                lock: true,
            });

            if (!cartItems || cartItems.length === 0) {
                await transaction.rollback();
                return res.status(400).json({
                    message: "Cart is empty",
                });
            }
            const validItems = [];
            let total_amount = 0;

            for (const cartItem of cartItems) {
                const course = cartItem.course;

                if (!course) continue;
                if (course.is_published === false) continue;

                const existedEnrollment = await CourseEnrollment.findOne({
                    where: {
                        user_id,
                        course_id: course.course_id,
                    },
                    transaction,
                });

                if (existedEnrollment) continue;

                const price = Number(course.sale_price ?? course.price ?? 0);

                validItems.push({
                    course_id: course.course_id,
                    price_at_purchase: price,
                    course_title_snapshot: course.title,
                });
                total_amount += price;
            }

            if (validItems.length === 0) {
                await transaction.rollback();
                return res.status(400).json({
                    message: "No valid courses to checkout",
                });
            }
            const order = await Order.create(
                {
                    user_id,
                    total_amount,
                    payment_method,
                    status: "pending",
                    created_at: new Date(),
                },
                { transaction }
            );
            for (const item of validItems) {
                await OrderItem.create(
                    {
                        order_id: order.order_id,
                        course_id: item.course_id,
                        price_at_purchase: item.price_at_purchase,
                        course_title_snapshot: item.course_title_snapshot,
                    },
                    { transaction }
                );
            }
            await transaction.commit();
            return res.status(201).json({
                message: "Checkout success",
                order,
            });
        } catch (error) {
            console.error("checkout error:", error);
            await transaction.rollback();
            console.error("checkout error:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    paymentSuccess = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const user_id = req.user.user_id;
            const { order_id } = req.params;
            const { transaction_id = null, payment_provider = null } = req.body;
            const order = await Order.findOne({
                where: { order_id, user_id },
                include: [
                    {
                        model: OrderItem,
                        as: "items",
                    },
                ],
                transaction,
                lock: true,
            });
            if (!order) {
                await transaction.rollback();
                return res.status(404).json({
                    message: "Order not found",
                });
            }
            if (order.status === "paid") {
                await transaction.rollback();
                return res.status(400).json({
                    message: "Order already paid",
                });
            }
            await order.update(
                {
                    status: "paid",
                    transaction_id,
                    payment_provider,
                    paid_at: new Date(),
                },
                { transaction }
            );
            for (const item of order.items) {
                const existedEnrollment = await CourseEnrollment.findOne({
                    where: {
                        user_id,
                        course_id: item.course_id,
                    },
                    transaction,
                });

                if (!existedEnrollment) {
                    await CourseEnrollment.create(
                        {
                            user_id,
                            course_id: item.course_id,
                            enrolled_at: new Date(),
                            status: "active",
                        },
                        { transaction }
                    );
                }
            }

            await CartItem.destroy({
                where: { user_id },
                transaction,
            });
            await transaction.commit();
            return res.status(200).json({
                message: "Payment success and enrollment created",
            });
        } catch (error) {
            await transaction.rollback();
            console.error("paymentSuccess error:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    paymentFail = async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const { order_id } = req.params;

            const order = await Order.findOne({
                where: { order_id, user_id },
            });

            if (!order) {
                return res.status(404).json({
                    message: "Order not found",
                });
            }

            if (order.status === "paid") {
                return res.status(400).json({
                    message: "Paid order cannot be marked failed",
                });
            }

            await order.update({
                status: "failed",
                failed_at: new Date(),
            });

            return res.status(200).json({
                message: "Payment failed",
            });
        } catch (error) {
            console.error("paymentFail error:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    cancelOrder = async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const { order_id } = req.params;

            const order = await Order.findOne({
                where: { order_id, user_id },
            });

            if (!order) {
                return res.status(404).json({
                    message: "Order not found",
                });
            }

            if (order.status === "paid") {
                return res.status(400).json({
                    message: "Cannot cancel a paid order",
                });
            }

            await order.update({
                status: "cancelled",
                cancelled_at: new Date(),
            });

            return res.status(200).json({
                message: "Order cancelled successfully",
            });
        } catch (error) {
            console.error("cancelOrder error:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    getMyOrders = async (req, res) => {
        try {
            const user_id = req.user.user_id;

            const orders = await Order.findAll({
                where: { user_id },
                include: [
                    {
                        model: OrderItem,
                        as: "items",
                        include: [
                            {
                                model: Course,
                                as: "course",
                            },
                        ],
                    },
                ],
                order: [["created_at", "DESC"]],
            });

            return res.status(200).json({
                message: "Get orders success",
                orders,
            });
        } catch (error) {
            console.error("getMyOrders error:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    getOrderDetail = async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const { order_id } = req.params;

            const order = await Order.findOne({
                where: { order_id, user_id },
                include: [
                    {
                        model: OrderItem,
                        as: "items",
                        include: [
                            {
                                model: Course,
                                as: "course",
                            },
                        ],
                    },
                ],
            });

            if (!order) {
                return res.status(404).json({
                    message: "Order not found",
                });
            }

            return res.status(200).json({
                message: "Get order detail success",
                order,
            });
        } catch (error) {
            console.error("getOrderDetail error:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };

    getMyPurchasedCourses = async (req, res) => {
        try {
            const user_id = req.user.user_id;

            const enrollments = await CourseEnrollment.findAll({
                where: {
                    user_id,
                    status: "active",
                },
                include: [
                    {
                        model: Course,
                        as: "course",
                    },
                ],
                order: [["enrolled_at", "DESC"]],
            });

            return res.status(200).json({
                message: "Get purchased courses success",
                enrollments,
            });
        } catch (error) {
            console.error("getMyPurchasedCourses error:", error);
            return res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    };
}

module.exports = new OrderController();