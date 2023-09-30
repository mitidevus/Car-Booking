const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
    {
        refreshToken: {
            type: String,
            required: true,
            unique: true
        },
        accountId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        expiresAt: {
            type: Date
        },
        clientIp: {
            type: String
        },
        userAgent: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
