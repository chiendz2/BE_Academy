const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Answer = sequelize.define(
        "Answer",
        {
            answer_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            question_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            is_correct: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            tableName: "answers",
            timestamps: false,
        }
    );

    return Answer;
};