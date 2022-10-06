const multer = require('multer');
const { storage, auth } = require('../middlewares');
const { fileCtrl } = require('../controllers');
const express = require("express");

const upload = multer(storage);

const router = express.Router();

// middlewares specific to this router
router.use(function requestLog(req, res, next) {
    console.log(req.method);
    next();
});

router.post('/upload', auth, upload.single('file'), fileCtrl.uploadSingle);

module.exports = router;
