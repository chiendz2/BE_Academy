const cloudinary = require("../Connect/cloudinaryConfig");
const streamifier = require("streamifier");

const uploadToCloudinary = (fileBuffer, folder = "lessons/videos") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "video",
                folder,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

const uploadImageToCloudinary = (fileBuffer, folder = "images") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(fileBuffer);
    });
};


module.exports = { uploadToCloudinary, uploadImageToCloudinary };