const multer = require("multer");

const storage = multer.memoryStorage();

// Upload video
const videoFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(new Error("Only video files are allowed"), false);
    }
};

const uploadVideo = multer({
    storage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 200 * 1024 * 1024, // 200MB
    },
});

// Upload image
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

const uploadImageUtil = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

module.exports = {
    uploadVideo,
    uploadImageUtil
};