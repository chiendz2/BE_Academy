const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const LessonLink = sequelize.define(
        "LessonLink",
        {
            lesson_link_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            course_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            url: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM("video", "document", "drive", "youtube", "other"),
                defaultValue: "other",
            },
            sort_order: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
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
            tableName: "lesson_links",
            timestamps: false,
        }
    );

    return LessonLink;
};