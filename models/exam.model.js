const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Exam = sequelize.define(
        "Exam",
        {
            exam_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            course_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            creator_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            exam_type: {
                type: DataTypes.STRING(50),
            },
            duration_minutes: {
                type: DataTypes.INTEGER,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.STRING(50),
                defaultValue: "draft",
            },
            IsActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            total_questions: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            pass_score: {
                type: DataTypes.DECIMAL(5, 2),
                defaultValue: 0,
            },
            max_attempts: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
            },
            start_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            end_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            show_result: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "exams",
            timestamps: false,
        }
    );

    return Exam;
};