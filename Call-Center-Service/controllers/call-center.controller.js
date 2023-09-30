import CallCenter from '../models/call-center.model.js';
import { saveCallCenter } from '../services/callcenter.service.js';
import { findAddress } from '../services/location.service.js';
import { sendToQueue } from '../services/rabbitmq.service.js';

export const createCallCenter = async (req, res) => {
    const callCenter = new CallCenter({
        phone: req.body.phone,
        passengerName: req.body.passengerName,
        homeNo: req.body.homeNo,
        street: req.body.street,
        ward: req.body.ward,
        district: req.body.district,
        pickupAddress: req.body.pickupAddress,
        taxiType: req.body.taxiType,
        lat: req.body.lat,
        long: req.body.long
    });

    try {
        const data = await callCenter.save();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllCallCenters = async (req, res) => {
    try {
        const callCenters = await CallCenter.find();
        res.status(200).json(callCenters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getCallCenterById = async (req, res) => {
    try {
        const callCenter = await CallCenter.findById(req.params.id);
        res.status(200).json(callCenter);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateCallCenterById = async (req, res) => {
    try {
        const callCenter = await CallCenter.findById(req.params.id);
        if (callCenter) {
            callCenter.phone = req.body.phone;
            callCenter.passengerName = req.body.passengerName;
            callCenter.homeNo = req.body.homeNo;
            callCenter.street = req.body.street;
            callCenter.ward = req.body.ward;
            callCenter.district = req.body.district;
            callCenter.pickupAddress = req.body.pickupAddress;
            callCenter.taxiType = req.body.taxiType;
            callCenter.lat = req.body.lat;
            callCenter.long = req.body.long;

            const data = await callCenter.save();
            res.status(200).json(data);
        } else {
            res.status(404).json({ message: 'Call center not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteCallCenterById = async (req, res) => {
    try {
        const callCenter = await CallCenter.findById(req.params.id);
        if (callCenter) {
            await callCenter.remove();
            res.status(200).json({ message: 'Call center deleted' });
        } else {
            res.status(404).json({ message: 'Call center not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getCallCentersByPhone = async (req, res) => {
    try {
        const callCenters = await CallCenter.find({
            phone: req.params.phone
        }).sort({ createdAt: -1 });
        res.status(200).json(callCenters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getTop5AddressesByPhone = async (req, res) => {
    try {
        const addresses = await CallCenter.aggregate([
            {
                $match: {
                    phone: req.params.phone
                }
            },
            {
                $group: {
                    _id: '$pickupAddress',
                    homeNo: { $first: '$homeNo' },
                    street: { $first: '$street' },
                    ward: { $first: '$ward' },
                    district: { $first: '$district' },
                    pickupAddress: { $first: '$pickupAddress' },
                    lat: { $first: '$lat' },
                    long: { $first: '$long' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);

        res.status(200).json(addresses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// S1
export const coordinate = async (req, res) => {
    const {
        phone,
        passengerName,
        homeNo,
        street,
        ward,
        district,
        pickupAddress,
        taxiType,
        lat,
        long,
        duration // Milliseconds
    } = req.body;

    try {
        if (lat && long) {
            console.log('Coordinate');
            const data = await saveCallCenter({
                phone,
                passengerName,
                homeNo,
                street,
                ward,
                district,
                pickupAddress,
                taxiType,
                lat,
                long
            });

            setTimeout(async () => {
                await sendToQueue(
                    'call_center_exchange',
                    'call_center_supply',
                    'supply_service',
                    data
                );
            }, duration);

            res.status(200).json({ message: 'Coordinate', data });
        } else {
            // Check address in database (will change to address in history)
            const callCenter = await findAddress({
                phone,
                homeNo,
                street,
                ward,
                district
            });

            if (callCenter) {
                console.log('Address is exist');
                console.log('Coordinate');
                const data = await saveCallCenter({
                    ...callCenter._doc,
                    passengerName,
                    taxiType
                });

                setTimeout(async () => {
                    await sendToQueue(
                        'call_center_exchange',
                        'call_center_supply',
                        'supply_service',
                        data
                    );
                }, duration);

                res.status(200).json({ message: 'Coordinate', data });
            } else {
                console.log('Address is not exist');
                console.log('Send to queue');

                await sendToQueue(
                    'call_center',
                    'address_queue',
                    'call_center_key',
                    {
                        phone,
                        passengerName,
                        homeNo,
                        street,
                        ward,
                        district,
                        taxiType
                    }
                );

                const data = await CallCenter.findOne({
                    phone,
                    homeNo,
                    street,
                    ward,
                    district
                });

                setTimeout(async () => {
                    await sendToQueue(
                        'call_center_exchange',
                        'call_center_supply',
                        'supply_service',
                        data
                    );
                }, duration);

                res.status(200).json({ message: 'Coordinate' });
            }
        }
    } catch (error) {
        console.error('Error sending message to queue:', error);
        res.status(500).json({ message: error.message });
    }
};
