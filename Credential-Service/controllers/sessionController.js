const Session = require('../models/Session');
const jwtDecode = require('jwt-decode');
const mongoose = require('mongoose');

const sessionController = {
    // CREATE SESSION
    createSession: async (account, refreshToken) => {
        try {
            const decoded = jwtDecode(refreshToken);
            const expiresAt = new Date(decoded.exp * 1000);

            const newSession = new Session({
                refreshToken: refreshToken,
                accountId: new mongoose.Types.ObjectId(account.id),
                expiresAt: expiresAt,
                clientIp: account?.clientIp || null,
                userAgent: account?.userAgent || null
            });

            await newSession.save();
        } catch (err) {
            console.log(err);
        }
    },
    // FIND SESSION BY REFRESH TOKEN
    findSessionByRefreshToken: async (refreshToken) => {
        try {
            const session = await Session.findOne({
                refreshToken: refreshToken
            });

            return session;
        } catch (err) {
            console.log(err);
        }
    },
    // DELETE SESSION BY REFRESH TOKEN
    deleteSessionByRefreshToken: async (refreshToken) => {
        try {
            await Session.deleteOne({
                refreshToken: refreshToken
            });
        } catch (err) {
            console.log(err);
        }
    }
};

module.exports = sessionController;
