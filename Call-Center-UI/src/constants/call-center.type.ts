interface CallCenter {
    _id: string;
    phone: string;
    passengerName: string;
    homeNo: string;
    street: string;
    ward?: string;
    district?: string;
    pickupAddress: string;
    taxiType: string;
    createdAt: string;
    updatedAt: string;
    lat: number | null;
    long: number | null;
}

export default CallCenter;
