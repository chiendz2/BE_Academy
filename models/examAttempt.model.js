const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const ExamAttempt = sequelize.define(
        "ExamAttempt",
        {
            attempt_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            exam_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            start_time: {
                type: DataTypes.DATE,
            },
            submit_time: {
                type: DataTypes.DATE,
            },
            status: {
                type: DataTypes.STRING(50),
                defaultValue: "in_progress",
            },
            score: {
                type: DataTypes.DECIMAL(5, 2),
                defaultValue: 0,
            },
            correct_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            wrong_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
        },
        {
            tableName: "exam_attempts",
            timestamps: false,
        }
    );

    return ExamAttempt;
};