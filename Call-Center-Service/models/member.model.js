import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            minLength: 7,
            maxLength: 11,
            unique: true
        },
        renewalDate: {
            type: String,
            required: true
        },
        expiryDate: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Member', memberSchema);
