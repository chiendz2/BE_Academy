const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const AttemptAnswer = sequelize.define(
        "AttemptAnswer",
        {
            answer_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            attempt_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            question_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            selected_option_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            is_correct: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            score: {
                type: DataTypes.DECIMAL(5, 2),
                defaultValue: 0,
            },
        },
        {
            tableName: "attempt_answers",
            timestamps: false,
        }
    );

    return AttemptAnswer;
};