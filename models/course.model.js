const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Course = sequelize.define(
        "Course",
        {
            course_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            teacher_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            SalePrice: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            IsFree: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            status: {
                type: DataTypes.STRING(50),
                defaultValue: "draft",
            },
            access_duration_days: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: "Số ngày học được tính từ lúc mua. Null = không giới hạn",
            },
            ImageUrl: {
                type: DataTypes.STRING(255),
                allowNull: true,
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
            tableName: "courses",
            timestamps: false,
        }
    );

    return Course;
};