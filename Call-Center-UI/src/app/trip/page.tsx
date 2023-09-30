"use client";

import TextInput from "@/components/TextInput";
import { Trip, TripDetail } from "@/constants/trip.type";
import { useEffect, useState } from "react";
import { formatDate } from "@/utils/format-date";

export default function Trip() {
    const [phone, setPhone] = useState("");
    const [debouncedPhone, setDebouncedPhone] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [trips, setTrips] = useState<Trip[]>([]);
    const [tripDetail, setTripDetail] = useState<TripDetail | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (debouncedPhone) {
                try {
                    const response = await fetch(
                        `http://localhost:8085/v1/user/guest-trips?phone=${debouncedPhone}`
                    );
                    const data = await response.json();

                    setTrips(data.data.items);
                } catch (error) {
                    console.log(error);
                }
            }
        };

        fetchData();
    }, [debouncedPhone]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedPhone(phone);
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [phone]);

    const showTripDetail = async (id: string) => {
        try {
            const response = await fetch(
                `http://localhost:8085/v1/user/trips/${id}`
            );
            const data = await response.json();

            setTripDetail(data.data);

            setIsModalOpen(true);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="w-full h-full max-w-[1400px] mx-auto py-10 font-sans">
            <div className="flex max-w-[700px]">
                <TextInput
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>

            <div className="pt-8 pb-4">
                <div className="max-h-[300px] h-[300px] overflow-y-auto">
                    <table className="table-auto w-full">
                        <thead className="sticky top-0">
                            <tr className="bg-[#000232] text-white">
                                <th className="border-2 border-gray-400 p-2">
                                    ID
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Phone
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Date
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Pickup Address
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Destination Address
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Price (VND)
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {trips.length > 0 ? (
                                trips.map((item) => (
                                    <tr
                                        key={item?._id}
                                        className="hover:bg-gray-100 cursor-pointer text-center"
                                        onClick={() => {
                                            showTripDetail(item?._id);
                                        }}
                                    >
                                        <td className="border-2 border-gray-400 p-2">
                                            {item?._id}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {item?.phone}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {formatDate(item?.createdAt)}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {item?.addressFrom}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {item?.addressTo}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {item?.price.toLocaleString(
                                                "vi-VN"
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        className="border-2 border-gray-400 p-2 text-center"
                                        colSpan={6}
                                    >
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg w-[700px] h-[600px] overflow-y-auto">
                        <div className="flex justify-between items-center border-b-2 border-gray-400 p-4">
                            <div className="font-bold text-xl">Trip Detail</div>
                            <button
                                className="text-white bg-[#FF6969] rounded-lg px-4 py-2"
                                onClick={() => setIsModalOpen(false)}
                            >
                                X
                            </button>
                        </div>

                        <div className="p-4 text-lg">
                            <div className="flex justify-between items-center pb-2">
                                <div className="font-bold">ID</div>
                                <div>{tripDetail?._id}</div>
                            </div>

                            <div className="flex justify-between items-center pb-2">
                                <div className="font-bold">Phone</div>
                                <div>{tripDetail?.phone}</div>
                            </div>

                            <div className="flex justify-between items-center pb-2">
                                <div className="font-bold">Pickup Address</div>
                                <div>{tripDetail?.addressFrom}</div>
                            </div>

                            <div className="flex justify-between items-center pb-2">
                                <div className="font-bold">
                                    Destination Address
                                </div>
                                <div>{tripDetail?.addressTo}</div>
                            </div>

                            <div className="flex justify-between items-center pb-2">
                                <div className="font-bold">Price</div>
                                <div>
                                    {tripDetail?.price.toLocaleString("vi-VN")}{" "}
                                    VND
                                </div>
                            </div>

                            <div className="font-bold pb-2">Trip History</div>
                            <table className="table-auto w-full">
                                <thead className="sticky top-0">
                                    <tr className="bg-[#000232] text-white">
                                        <th className="border-2 border-gray-400 p-2">
                                            Time
                                        </th>
                                        <th className="border-2 border-gray-400 p-2">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {tripDetail?.tripHistories?.map(
                                        (item, index) => (
                                            <tr
                                                key={item?._id}
                                                className={`text-center ${
                                                    index ===
                                                    tripDetail?.tripHistories
                                                        ?.length -
                                                        1
                                                        ? "text-green-500"
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                <td className="border-2 border-gray-400 p-2">
                                                    {formatDate(
                                                        item?.createdAt
                                                    )}
                                                </td>
                                                <td className="border-2 border-gray-400 p-2">
                                                    {item?.status}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
