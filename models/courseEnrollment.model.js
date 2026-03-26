const { DataTypes } = require("sequelize");
// cmt tại đây cái bảng này dùng để ghi nhận user đã mua những khóa học nào rồi
module.exports = (sequelize) => {
    const CourseEnrollment = sequelize.define(
        "CourseEnrollment",
        {
            enroll_id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            course_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            IsActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            status: {
                type: DataTypes.STRING(50),
                defaultValue: "active",
            },
            enrolled_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "course_enrollments",
            timestamps: false,
        }
    );

    return CourseEnrollment;
};