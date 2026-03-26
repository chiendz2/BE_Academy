const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dkaaom0zt', // Replace with your Cloud Name
    api_key: '442994845349673',       // Replace with your API Key
    api_secret: 'GuWWLF78SktZid-zvXcCFNIptTY'  // Replace with your API Secret
});

module.exports = cloudinary;