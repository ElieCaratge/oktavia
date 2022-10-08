multer = require('multer');

const MIMETYPE = {
    "image/jpg": ".jpg",
    "image/jpeg": ".jpg",
    "image/png": ".png",
}

// https://www.npmjs.com/package/multer for more information.
const storage = new multer.diskStorage({
    // The folder to which the file has been saved
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, '..', 'files'));
    },
    // The name of the file within the destination
    filename: (req, file, callback) => {
        const uniqueSuffix = '_' + Date.now() + '-' + Math.round(Math.random() * 1E9);
        const name = file.originalname.split(' ').join('_').split('.')[0];
        const extension = MIMETYPE[file.mimetype];
        callback(null, name + uniqueSuffix + extension);
    }
})

module.exports = multer({ storage }).single('file');

