const authController = require('../controllers/authController');
const middlewareController = require('../controllers/middlewareController');
const router = require('express').Router();

// REGISTER
router.post('/register', authController.registerAccount);

// LOGIN
router.post('/login', authController.loginAccount);

// REFRESH
router.post('/refresh', authController.requestRefreshToken);

// LOG OUT
router.post(
    '/logout',
    middlewareController.verifyToken,
    authController.logoutAccount
);

module.exports = router;
