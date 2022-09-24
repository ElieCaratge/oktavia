const express = require('express');
const { userCtrl } = require('../controllers/')

const router = express.Router();

// middlewares specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.post('/',  userCtrl.create);
router.get('/:userId',  userCtrl.findOne);
router.get('/',  userCtrl.findAll);
router.put('/:userId',  userCtrl.update);
router.delete('/:userId',  userCtrl.delete);
router.delete('/', userCtrl.deleteAll);
router.post('/signup', userCtrl.signUp);
router.post('/signin', userCtrl.signIn);

module.exports = router;
