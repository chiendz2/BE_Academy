const { DataTypes, DATE } = require("sequelize");

module.exports = (sequelize) => {
    const Order = sequelize.define(
        "Order",
        {
            order_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            total_amount: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            discount_code: {
                type: DataTypes.STRING(100),
            },
            payment_method: {
                type: DataTypes.STRING(50),
            },
            status: {
                type: DataTypes.STRING(50),
                defaultValue: "pending",
            },
            paid_at: {
                type: DataTypes.DATE,
                defaultValue: DATE.NOW,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            IsActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            tableName: "orders",
            timestamps: false,
        }
    );

    return Order;
};