const Account = require('../models/Account');

const accountController = {
    // GET ALL ACCOUNTS
    getAllAccounts: async (req, res) => {
        try {
            const accounts = await Account.find();
            res.status(200).json(accounts);
        } catch (err) {
            res.status(500).json(err);
        }
    }
};

module.exports = accountController;
