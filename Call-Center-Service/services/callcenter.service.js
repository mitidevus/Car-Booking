import CallCenter from '../models/call-center.model.js';

export const saveCallCenter = async (data) => {
    // Save to database
    const callCenter = new CallCenter({
        phone: data?.phone,
        passengerName: data?.passengerName,
        homeNo: data?.homeNo,
        street: data?.street,
        ward: data?.ward,
        district: data?.district,
        taxiType: data?.taxiType,
        pickupAddress: data?.pickupAddress,
        lat: data?.lat,
        long: data?.long
    });

    try {
        const data = await callCenter.save();
        return data;
    } catch (err) {
        console.log(err);
    }
};
