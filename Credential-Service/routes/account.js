const middlewareController = require('../controllers/middlewareController');
const accountController = require('../controllers/accountController');

const router = require('express').Router();

// GET ALL ACCOUNTS
router.get(
    '/',
    middlewareController.verifyTokenAdminAuth,
    accountController.getAllAccounts
);

module.exports = router;
