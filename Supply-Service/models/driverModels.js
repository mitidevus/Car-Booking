import mongoose from 'mongoose';
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const driverSchema = new mongoose.Schema({
    driverId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    destination: {
        type: { type: String, required: true },
        coordinates: []
    },
    vehicleType: {
        type: String,
        required: true,
    },
    driverType: {
        type: String,
        require: true,
    },
    vehiclePlate: {
        type: String,
        required: true,
    },
    driverAvatar: {
        type: String,
        required: true,
    },
    numberSeat: {
        type: Number,
        required: true,
    }
});
driverSchema.index({ destination: "2dsphere" })
export default mongoose.model("Driver", driverSchema);