import mongoose from 'mongoose';

const callCenterSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            minLength: 7,
            maxLength: 11
        },
        passengerName: {
            type: String,
            default: 'Passenger'
        },
        homeNo: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        ward: {
            type: String,
            default: ''
        },
        district: {
            type: String,
            default: ''
        },
        taxiType: {
            type: String,
            enum: ['4 Seats', '7 Seats', 'Any'],
            required: true
        },
        pickupAddress: {
            type: String,
            required: true
        },
        lat: {
            type: Number,
            required: true
        },
        long: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('CallCenter', callCenterSchema);
