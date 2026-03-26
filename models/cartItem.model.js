const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const CartItem = sequelize.define(
        "CartItem",
        {
            cart_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            course_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            IsActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            added_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "cart_items",
            timestamps: false,
        }
    );

    return CartItem;
};