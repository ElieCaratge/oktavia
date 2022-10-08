const { auth, upload } = require('../middlewares');
const { fileCtrl } = require('../controllers');
const express = require("express");

const router = express.Router();

// middlewares specific to this router
router.use(function requestLog(req, res, next) {
    console.log(req.method, req.hostname);
    next();
});

router.post('/upload', auth, upload, fileCtrl.create);

module.exports = router;
