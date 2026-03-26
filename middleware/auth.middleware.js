const jwt = require("jsonwebtoken");

class AuthMiddleware {
    verifyToken = (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({
                    message: "Bạn chưa được xác thực",
                });
            }

            if (!authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    message: "Tiêu đề ủy quyền không ở định dạng",
                });
            }

            const token = authHeader.split(" ")[1];

            if (!token) {
                return res.status(401).json({
                    message: "Token không tồn tại",
                });
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "91cb6488a778c0c4fbb477db88975aa7198ac21bd07da23794a0269e"
            );

            req.user = decoded;
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({
                message: "Token đã hết hạn hoặc không hợp lệ",
                error: error.message,
            });
        }
    };

    authorizeRoles = (...roles) => {
        return (req, res, next) => {
            try {
                if (!req.user) {
                    return res.status(401).json({
                        message: "Bạn chưa được xác thực",
                    });
                }

                if (!roles.includes(req.user.role)) {
                    return res.status(403).json({
                        message: "Bạn không có quyền truy cập tài nguyên này",
                    });
                }

                next();
            } catch (error) {
                return res.status(500).json({
                    message: "Lỗi xảy ra trong khi ủy quyền vai trò",
                    error: error.message,
                });
            }
        };
    };
}

module.exports = new AuthMiddleware();