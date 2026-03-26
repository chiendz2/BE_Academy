const fs = require('fs').promises;
/**
     * Chuyển đổi file ảnh thành chuỗi Base64
     * @param {File} file - Đối tượng file nhận từ request (ví dụ: Multer)
     * @returns {Promise<string>} - Chuỗi Base64 của ảnh
     */
const imageToBase64 = async (imagefile) => {
    try {
        const Base64String = imagefile.buffer.toString('base64');
        return Base64String;
    } catch (error) {
        console.error('Lỗi khi chuyển ảnh sang Base64:', error);
        throw error;
    }
}

module.exports = imageToBase64;