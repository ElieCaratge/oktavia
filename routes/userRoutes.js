const express = require('express');
const { userCtrl } = require('../controllers/')
const { auth } = require('../middlewares');

const router = express.Router();

// middlewares specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.get('/:userId', auth, userCtrl.findOne);
router.get('/', auth, userCtrl.findAll);
router.put('/:userId', auth, userCtrl.update);
router.delete('/:userId', auth, userCtrl.deleteOne);
router.delete('/', auth, userCtrl.deleteAll);
router.post('/signup', userCtrl.signUp);
router.post('/signin', userCtrl.signIn);

module.exports = router;
