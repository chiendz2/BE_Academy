require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./utils/swagger");
// const sequelize = require('./Connect/dbConnect');
const db = require("./models");
const index = require('./models/index');
const app = express();
const PORT = process.env.PORT || 3001;

const apiRoutes = require("./routes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/API", apiRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

db.sequelize.sync({ alter: true }) // Sử dụng { force: true } để xóa và tạo lại bảng
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});