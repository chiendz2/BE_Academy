const express = require("express");
const router = express.Router();
const authRoutes = require("./auth.routes");
const courseRouter = require("./course.router");
const lessonRouter = require("./lesson.router");
const examRoutes = require("./exam.routes");
const questionRoutes = require("./question.routes");
const userRoutes = require("./user.routes");
router.use("/auth", authRoutes);
router.use("/courses", courseRouter);
router.use("/lessons", lessonRouter);
router.use("/exams", examRoutes);
router.use("/questions", questionRoutes);
router.use("/users", userRoutes);


router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API is running"
    });
});

// đây là 1 số demo nhé
// router.use("/users", userRoutes);
// router.use("/auth", authRoutes);

module.exports = router;
