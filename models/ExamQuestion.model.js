const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const ExamQuestion = sequelize.define(
        "ExamQuestion",
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            exam_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            question_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            sort_order: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            points: {
                type: DataTypes.DECIMAL(5, 2),
                defaultValue: 1,
            },
        },
        {
            tableName: "exam_questions",
            timestamps: false,
        }
    );

    return ExamQuestion;
};