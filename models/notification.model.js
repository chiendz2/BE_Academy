const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Notification = sequelize.define(
        "Notification",
        {
            noti_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
            },
            type: {
                type: DataTypes.STRING(50),
            },
            status: {
                type: DataTypes.STRING(50),
                defaultValue: "pending",
            },
            sent_at: {
                type: DataTypes.DATE,
            },
        },
        {
            tableName: "notifications",
            timestamps: false,
        }
    );

    return Notification;
};