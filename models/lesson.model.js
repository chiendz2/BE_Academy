const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Lesson = sequelize.define(
        "Lesson",
        {
            lesson_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            course_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            title: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            lesson_link: {
                type: DataTypes.TEXT,
            },
            description: {
                type: DataTypes.TEXT,
            },
            duration: {
                type: DataTypes.INTEGER,
            },
            sort_order: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            IsActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            content: {
                type: DataTypes.TEXT("long"),
            },
        },
        {
            tableName: "lessons",
            timestamps: false,
        }
    );

    return Lesson;
};