const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const AIChatHistory = sequelize.define(
        "AIChatHistory",
        {
            chat_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            user_message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            ai_response: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "ai_chat_history",
            timestamps: false,
        }
    );

    return AIChatHistory;
};