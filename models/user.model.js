const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const User = sequelize.define(
        "User",
        {
            user_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            username: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            role: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: "student",
            },
            status: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: "active",
            },
            full_name: {
                type: DataTypes.STRING(150),
            },
            phone: {
                type: DataTypes.STRING(20),
            },
            address: {
                type: DataTypes.STRING(255),
            },
            avatar: {
                type: DataTypes.STRING(255),
            },

            // Thông tin hồ sơ giáo viên
            job_title: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            academic_degree: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            specialization: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            workplace: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            years_of_experience: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
            introduction: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            education_history: {
                type: DataTypes.TEXT("long"),
                allowNull: true,
            },
            work_experience: {
                type: DataTypes.TEXT("long"),
                allowNull: true,
            },
            awards: {
                type: DataTypes.TEXT("long"),
                allowNull: true,
            },

            is_verified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            otp_code: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            otp_expires_at: {
                type: DataTypes.DATE,
                allowNull: true,
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
            tableName: "users",
            timestamps: false,
        }
    );

    return User;
};