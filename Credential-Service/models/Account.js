const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            minLength: 10,
            maxLength: 50,
            unique: true
        },
        password: {
            type: String,
            required: true,
            minLength: 6
        },
        phone: {
            type: String,
            required: true,
            minLength: 10,
            unique: true
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'driver'],
            default: 'user'
        },
        refId: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Account', accountSchema);
