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