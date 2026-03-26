const jwt = require("jsonwebtoken");

class AuthMiddleware {
    verifyToken = (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({
                    message: "you are not authenticated",
                });
            }

            if (!authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    message: "Authorization header not in Bearer format",
                });
            }

            const token = authHeader.split(" ")[1];

            if (!token) {
                return res.status(401).json({
                    message: "Token does not exist",
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
                message: "Token has expired or is invalid",
                error: error.message,
            });
        }
    };

    authorizeRoles = (...roles) => {
        return (req, res, next) => {
            try {
                if (!req.user) {
                    return res.status(401).json({
                        message: "You are not authenticated",
                    });
                }

                if (!roles.includes(req.user.role)) {
                    return res.status(403).json({
                        message: "You are not authorized to access this resource",
                    });
                }

                next();
            } catch (error) {
                return res.status(500).json({
                    message: "Error occurred while authorizing roles",
                    error: error.message,
                });
            }
        };
    };
}

module.exports = new AuthMiddleware();