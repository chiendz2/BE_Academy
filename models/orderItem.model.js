const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const OrderItem = sequelize.define(
        "OrderItem",
        {
            item_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            order_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            course_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            price_at_purchase: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            IsActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            tableName: "order_items",
            timestamps: false,
        }
    );

    return OrderItem;
};