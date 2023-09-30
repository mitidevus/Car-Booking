import axios from 'axios';
import CallCenter from '../models/call-center.model.js';

export const findAddress = async(props) => {
    const { phone, homeNo, street, ward, district } = props;

    const callCenter = await CallCenter.findOne({
        phone,
        homeNo,
        street,
        ward,
        district
    });

    return callCenter;
};

export const generateAddress = (homeNo, street, ward, district) => {
    let address = `${homeNo} ${street}`;

    if (ward) {
        address += `, Phuong ${ward}`;
    }

    if (district) {
        address += `, Quan ${district}`;
    }

    return address;
};

export const getLocationFromAddress = async(address) => {
    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_API_KEY}`
        );
        const data = response.data;
        if (data.status === 'OK') {
            const result = data.results[0];
            const location = result.geometry.location;
            return location;
        }
    } catch (error) {
        console.error('Error getting location from address:', error);
    }
};