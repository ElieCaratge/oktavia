const { auth, upload, fileAccess } = require('../middlewares');
const { fileCtrl, userCtrl } = require('../controllers');
const express = require("express");
const fs = require('fs');

const router = express.Router();
const fileCast = (req, res, next) => {
    if (req.params.fileId){
        delete req.body.files;
        req.body.files = [req.params.fileId];
    } else if (!req.body.files) {
        req.body.files = [];
    }
    next();
};
const setSoft = (softParam) => {
    return (req, res, next) => {
        delete req.body.soft;
        req.body.soft = softParam;
        next();
    }
}

// middlewares specific to this router
router.use(function requestLog(req, res, next) {
    console.log(req.method, req.hostname + req.originalUrl, 'on', Date());
    next();
});

/*
* PUBLIC ROUTES
* */
/* Reminder :
* In ../app.js,
* app.use('/files', express.static(path.join(__dirname, 'files')));
* Enables access to every file.
* */
router.get('', auth, fileCtrl.getFilesByUser);
router.delete('', auth, fileCast, fileAccess.canReadMiddleware, setSoft(true), fileCtrl.deleteMany)
router.get('/get/:fileId', auth, fileCast, fileAccess.canReadMiddleware, fileCtrl.findOne);
router.delete('/delete/:fileId', auth, fileCast, fileAccess.canReadMiddleware, setSoft(true), fileCtrl.deleteOne);
router.post('/share', auth, fileAccess.canReadMiddleware, fileCtrl.share);
router.post('/upload', auth, upload.single('file'), fileCtrl.create);

/*
* PRIVATE ROUTES
* */
// TODO: Ajouter un middleware pour checker les droits administrateur.
router.get('/all', fileCtrl.findAll);
router.delete('/all', fileCtrl.deleteAll);

module.exports = router;
