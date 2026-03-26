const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Question = sequelize.define(
        "Question",
        {
            question_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            course_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            subject_type: {
                type: DataTypes.ENUM(
                    "math",
                    "literature",
                    "english",
                    "physics",
                    "chemistry",
                    "biology",
                    "history",
                    "geography",
                    "civics",
                    "it",
                    "other"
                ),
                allowNull: false,
                defaultValue: "other",
            },
            question_type: {
                type: DataTypes.ENUM(
                    "single_choice",
                    "multiple_choice",
                    "true_false",
                    "short_answer"
                ),
                allowNull: false,
                defaultValue: "single_choice",
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            difficulty_level: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            explanation: {
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
        },
        {
            tableName: "questions",
            timestamps: false,
        }
    );

    return Question;
};