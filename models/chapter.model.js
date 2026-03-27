const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Chapter = sequelize.define(
        "Chapter",
        {
            chapter_id: {
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
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
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
            tableName: "chapters",
            timestamps: false,
        }
    );

    return Chapter;
};