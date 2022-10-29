const { auth, upload, fileAccess} = require('../middlewares');
const { fileCtrl, userCtrl } = require('../controllers');
const express = require("express");
const fs = require('fs');

const router = express.Router();

// middlewares specific to this router
router.use(function requestLog(req, res, next) {

    console.log(req.method, req.hostname + req.originalUrl, 'on', Date());
    next();
});

// ------------------------------------------------
// TODO: Delete or protect these routes.
router.get('', fileCtrl.findAll);
// TODO: Faire la suppression du fichier serveur ici.
// TODO: Suppression de plusieurs fichiers avec un filtre.
router.delete('/:fileId', fileCtrl.deleteOne);
router.delete('', fileCtrl.deleteAll);
router.post('/upload', auth, upload.single('file'), fileCtrl.create);
/* Example of req.body pattern :
* {
*   users: ["634a9ba6cc7475cc12ba94ea", "634a9ba6cc7475cc12ba94ea"],
*   files: ["634a9ba6cc7475cc12ba94ea", "634a9ba6cc7475cc12ba94ea", "634a9ba6cc7475cc12ba94ea"],
* }
* */
router.post('/giveAccess', auth, fileCtrl.giveAccess);
// ------------------------------------------------

/* Reminder :
* In ../app.js,
* app.use('/files', express.static(path.join(__dirname, 'files')));
* Enables access to every file.
* */
// TODO: Vérifier cette route
router.get('/get', auth, userCtrl.getFilesByUser);
router.post('/share', auth, fileAccess.canReadMiddleware, (req, res, next) => {res.status(200).send({message: "Ouais c'est ok ouais !"})});

module.exports = router;
