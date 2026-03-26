const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const LessonProgress = sequelize.define(
        "LessonProgress",
        {
            progress_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            lesson_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING(50),
                defaultValue: "not_started",
            },
            last_viewed_at: {
                type: DataTypes.DATE,
            },
            IsActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "lesson_progress",
            timestamps: false,
        }
    );

    return LessonProgress;
};