require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = require('../Connect/dbConnect');
const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./user.model")(sequelize);
db.AIChatHistory = require("./aiChatHistory.model")(sequelize);
db.Notification = require("./notification.model")(sequelize);
db.Course = require("./course.model")(sequelize);
db.Lesson = require("./lesson.model")(sequelize);
db.Exam = require("./exam.model")(sequelize);
db.Question = require("./question.model")(sequelize);
db.Answer = require("./answer.model")(sequelize);
db.ExamAttempt = require("./examAttempt.model")(sequelize);
db.AttemptAnswer = require("./attemptAnswer.model")(sequelize);
db.LessonProgress = require("./lessonProgress.model")(sequelize);
db.CartItem = require("./cartItem.model")(sequelize);
db.CourseEnrollment = require("./courseEnrollment.model")(sequelize);
db.Order = require("./order.model")(sequelize);
db.OrderItem = require("./orderItem.model")(sequelize);
db.ExamQuestion = require("./ExamQuestion.model")(sequelize);
db.QuestionOption = require("./QuestionOption.model")(sequelize);

db.Chapter = require("./chapter.model")(sequelize);
db.LessonLink = require("./LessonLink.model")(sequelize);

const {
    User,
    AIChatHistory,
    Notification,
    Course,
    Chapter,
    Lesson,
    LessonLink,
    Exam,
    Question,
    Answer,
    ExamAttempt,
    AttemptAnswer,
    LessonProgress,
    CartItem,
    CourseEnrollment,
    Order,
    OrderItem,
    ExamQuestion,
    QuestionOption
} = db;

// User relations
User.hasMany(AIChatHistory, { foreignKey: "user_id" });
AIChatHistory.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Course, { foreignKey: "teacher_id", as: "teachingCourses" });
Course.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });

User.hasMany(Exam, { foreignKey: "creator_id", as: "createdExams" });
Exam.belongsTo(User, { foreignKey: "creator_id", as: "creator" });

User.hasMany(ExamAttempt, { foreignKey: "user_id" });
ExamAttempt.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(LessonProgress, { foreignKey: "user_id" });
LessonProgress.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(CartItem, { foreignKey: "user_id" });
CartItem.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(CourseEnrollment, { foreignKey: "user_id" });
CourseEnrollment.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

// Course relations
Course.hasMany(Lesson, { foreignKey: "course_id", as: "lessons" });
Lesson.belongsTo(Course, { foreignKey: "course_id", as: "course" });

Course.hasMany(Exam, { foreignKey: "course_id" });
Exam.belongsTo(Course, { foreignKey: "course_id" });

Course.hasMany(CartItem, { foreignKey: "course_id" });
CartItem.belongsTo(Course, { foreignKey: "course_id" });

Course.hasMany(CourseEnrollment, { foreignKey: "course_id" });
CourseEnrollment.belongsTo(Course, { foreignKey: "course_id" });

Course.hasMany(OrderItem, { foreignKey: "course_id" });
OrderItem.belongsTo(Course, { foreignKey: "course_id" });



// Chapter relations
Chapter.hasMany(Lesson, { foreignKey: "chapter_id", as: "lessons" });
Lesson.belongsTo(Chapter, { foreignKey: "chapter_id", as: "chapter" });

// Lesson relations
Lesson.hasMany(LessonProgress, { foreignKey: "lesson_id" });
LessonProgress.belongsTo(Lesson, { foreignKey: "lesson_id" });


Lesson.hasMany(LessonLink, { foreignKey: "lesson_id", as: "lessonLinks" });
LessonLink.belongsTo(Lesson, { foreignKey: "lesson_id", as: "lesson" });
// Exam relations
// Exam.hasMany(Question, { foreignKey: "exam_id" });
// Question.belongsTo(Exam, { foreignKey: "exam_id" });


Exam.belongsToMany(Question, {
    through: ExamQuestion,
    foreignKey: "exam_id",
    otherKey: "question_id",
    as: "questions",
});

Question.belongsToMany(Exam, {
    through: ExamQuestion,
    foreignKey: "question_id",
    otherKey: "exam_id",
    as: "exams",
});

QuestionOption.hasMany(AttemptAnswer, {
    foreignKey: "selected_option_id",
    sourceKey: "option_id",
    as: "selectedAnswers",
});

AttemptAnswer.belongsTo(QuestionOption, {
    foreignKey: "selected_option_id",
    targetKey: "option_id",
    as: "selectedOption",
});

Exam.hasMany(ExamQuestion, { foreignKey: "exam_id", as: "examQuestions" });
ExamQuestion.belongsTo(Exam, { foreignKey: "exam_id", as: "exam" });

Question.hasMany(ExamQuestion, { foreignKey: "question_id", as: "examQuestions" });
ExamQuestion.belongsTo(Question, { foreignKey: "question_id", as: "question" });

Exam.hasMany(ExamAttempt, { foreignKey: "exam_id", as: "attempts" });
ExamAttempt.belongsTo(Exam, { foreignKey: "exam_id", as: "exam" });

// Question relations
Question.hasMany(Answer, { foreignKey: "question_id" });
Answer.belongsTo(Question, { foreignKey: "question_id" });

Question.hasMany(AttemptAnswer, { foreignKey: "question_id", as: "attemptAnswers" });
AttemptAnswer.belongsTo(Question, { foreignKey: "question_id", as: "question" });

// Answer relations
Answer.hasMany(AttemptAnswer, { foreignKey: "answer_id" });
AttemptAnswer.belongsTo(Answer, { foreignKey: "answer_id" });

// ExamAttempt relations
ExamAttempt.hasMany(AttemptAnswer, { foreignKey: "attempt_id", as: "answers" });
AttemptAnswer.belongsTo(ExamAttempt, { foreignKey: "attempt_id", as: "attempt" });

// Order relations
Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

// cmt trong 1 khóc học thì có nhiều bài học và có thể upload

// Course.hasMany(LessonLink, { foreignKey: "course_id" });
// LessonLink.belongsTo(Course, { foreignKey: "course_id" });
// Course.hasMany(Question, { foreignKey: "course_id", as: "questions" });
// Question.belongsTo(Course, { foreignKey: "course_id", as: "course" });

db.Question.hasMany(db.QuestionOption, {
    foreignKey: "question_id",
    as: "options"
});

db.QuestionOption.belongsTo(db.Question, {
    foreignKey: "question_id",
    as: "question"
});
module.exports = db;