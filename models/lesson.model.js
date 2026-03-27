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
            chapter_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            title: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            lesson_link: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            duration: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            sort_order: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            content: {
                type: DataTypes.TEXT("long"),
                allowNull: true,
            },
            IsPreview: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            IsActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "lessons",
            timestamps: false,
        }
    );

    return Lesson;
};