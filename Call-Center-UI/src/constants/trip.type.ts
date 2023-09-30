export interface Trip {
    _id: string;
    phone: string;
    createdAt: string;
    addressFrom: string;
    addressTo: string;
    price: number;
}

interface TripHistory {
    _id: string;
    tripId: string;
    status: string;
    createdAt: string;
}

export interface TripDetail {
    _id: string;
    driverId: string;
    phone: string;
    addressFrom: string;
    addressTo: string;
    price: number;
    tripHistories: TripHistory[];
}
