"use client";

import RadioButton from "@/components/RadioButton";
import TextInput from "@/components/TextInput";
import CallCenter from "@/constants/call-center.type";
import { formatDate, getExpiryStatus } from "@/utils/format-date";
import { useEffect, useState } from "react";

export default function Booking() {
    const [phone, setPhone] = useState("");
    const [debouncedPhone, setDebouncedPhone] = useState("");
    const [passengerName, setPassengerName] = useState("");
    const [homeNo, setHomeNo] = useState("");
    const [street, setStreet] = useState("");
    const [ward, setWard] = useState("");
    const [district, setDistrict] = useState("");
    const [taxiType, setTaxiType] = useState("4 Seats");
    const [historyAddress, setHistoryAddress] = useState<CallCenter | null>(
        null
    );

    const [isEmptyField, setIsEmptyField] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);

    const [recentAddressData, setRecentAddressData] = useState<CallCenter[]>(
        []
    );
    const [topAddressData, setTopAddressData] = useState<CallCenter[]>([]);

    const [isVip, setIsVip] = useState(false);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (debouncedPhone || isUpdated == true) {
                try {
                    const urls = [
                        `http://localhost:8001/v1/callcenter/phone/${debouncedPhone}`,
                        `http://localhost:8001/v1/callcenter/top5/${debouncedPhone}`,
                        `http://localhost:8001/v1/member/${debouncedPhone}`,
                    ];

                    const requests = urls.map((url) =>
                        fetch(url, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        })
                    );

                    const responses = await Promise.all(requests);
                    const data = await Promise.all(
                        responses.map((response) => response.json())
                    );

                    const [historyData, addressData, vipData] = data;

                    setRecentAddressData(historyData);
                    setTopAddressData(addressData);

                    if (
                        vipData?.expiryDate &&
                        getExpiryStatus(vipData) === "Active"
                    ) {
                        setIsVip(true);
                    } else {
                        setIsVip(false);
                    }

                    setDuration(0);
                } catch (error) {
                    console.log(error);

                    setRecentAddressData([]);
                    setTopAddressData([]);

                    setIsVip(false);

                    setDuration(0);
                }

                setIsUpdated(false);
            }
        };

        fetchData();
    }, [debouncedPhone, isUpdated]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedPhone(phone);
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [phone]);

    const handleInputChange = (item: CallCenter) => {
        const { passengerName, homeNo, street, ward, district } = item;
        console.log(item);

        setPassengerName(passengerName || "");
        setHomeNo(homeNo);
        setStreet(street);
        setWard(ward || "");
        setDistrict(district || "");
        setHistoryAddress(item);
    };

    const handleCoordinate = async () => {
        let latValue = null;
        let longValue = null;
        let pickupAddress = null;

        if (
            homeNo === historyAddress?.homeNo &&
            street === historyAddress?.street &&
            ward === historyAddress?.ward &&
            district === historyAddress?.district
        ) {
            latValue = historyAddress?.lat;
            longValue = historyAddress?.long;
            pickupAddress = historyAddress?.pickupAddress;
        }

        const data = {
            phone,
            passengerName: passengerName || "Passenger",
            homeNo,
            street,
            ward,
            district,
            taxiType,
            lat: latValue,
            long: longValue,
            pickupAddress,
            duration: duration * 60 * 1000, // convert to milliseconds
        };

        try {
            await fetch("http://localhost:8001/v1/callcenter/coordinate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            setIsUpdated(true);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="w-full h-full max-w-[1400px] mx-auto py-10 font-sans">
            {isEmptyField && (
                <div className="flex justify-center">
                    <p className="text-red-500">
                        Please fill in all the fields!
                    </p>
                </div>
            )}

            <div className="flex">
                {/* Form */}
                <div className="w-1/2">
                    <div className="flex py-2">
                        <TextInput
                            label="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />

                        <TextInput
                            label="Passenger Name"
                            value={passengerName}
                            onChange={(e) => setPassengerName(e.target.value)}
                        />
                    </div>
                    <div className="flex py-2">
                        <TextInput
                            label="Home No"
                            value={homeNo}
                            onChange={(e) => setHomeNo(e.target.value)}
                        />
                        <TextInput
                            label="Street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                        />
                    </div>
                    <div className="flex py-2">
                        <TextInput
                            label="Ward"
                            value={ward}
                            onChange={(e) => setWard(e.target.value)}
                        />
                        <TextInput
                            label="District"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                        />
                    </div>

                    <div className="py-2 flex">
                        <div className="w-1/2">
                            <p className="font-bold">Taxi Type</p>
                            <div className="flex justify-between pl-4 pr-12 py-2">
                                <RadioButton
                                    label="4 Seats"
                                    value="4 Seats"
                                    checked={taxiType === "4 Seats"}
                                    onChange={() => setTaxiType("4 Seats")}
                                />
                                <RadioButton
                                    label="7 Seats"
                                    value="7 Seats"
                                    checked={taxiType === "7 Seats"}
                                    onChange={() => setTaxiType("7 Seats")}
                                />
                                <RadioButton
                                    label="Any"
                                    value="Any"
                                    checked={taxiType === "Any"}
                                    onChange={() => setTaxiType("Any")}
                                />
                            </div>
                        </div>
                        <div className="w-1/2">
                            {/* Select time for VIP member */}
                            {isVip && (
                                <>
                                    <p className="font-bold">Timer minutes</p>
                                    {/* Input minute */}
                                    <input
                                        type="number"
                                        className="w-1/4 px-4 py-2 border-2 border-gray-400 rounded-md"
                                        value={duration}
                                        onChange={(e) =>
                                            setDuration(Number(e.target.value))
                                        }
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-1/2 pl-20 py-8">
                    <div className="max-h-[250px] h-[250px]">
                        <table className="table-auto w-full">
                            <thead>
                                <tr className="bg-[#000232] text-white">
                                    <th className="border-2 border-gray-400 p-2">
                                        Order
                                    </th>
                                    <th className="border-2 border-gray-400 p-2">
                                        Picking Address
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {topAddressData.length > 0 &&
                                    topAddressData.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-100 cursor-pointer text-center"
                                            onClick={() => {
                                                handleInputChange(item);
                                            }}
                                        >
                                            <td className="border-2 border-gray-400 p-2">
                                                {index + 1}
                                            </td>
                                            <td className="border-2 border-gray-400 p-2">
                                                {item?._id}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="py-4">
                <div className="max-h-[300px] h-[300px] overflow-y-auto">
                    <table className="table-auto w-full">
                        <thead className="sticky top-0">
                            <tr className="bg-[#000232] text-white">
                                <th className="border-2 border-gray-400 p-2">
                                    Order
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Phone
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Picking Address
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Taxi Type
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Time
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentAddressData.length > 0 ? (
                                recentAddressData.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-100 cursor-pointer text-center"
                                        onClick={() => {
                                            handleInputChange(item);
                                        }}
                                    >
                                        <td className="border-2 border-gray-400 p-2">
                                            {index + 1}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {item?.phone}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {item?.pickupAddress}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {item?.taxiType}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {formatDate(item?.createdAt)}
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

            <div className="flex justify-center py-4">
                <button
                    className="px-8 py-4 bg-[#1dbfaf] rounded-md font-semibold text-white"
                    onClick={(e) => {
                        e.preventDefault();

                        if (!phone || !homeNo || !street || !taxiType) {
                            setIsEmptyField(true);
                            return;
                        } else {
                            setIsEmptyField(false);
                        }

                        handleCoordinate();
                    }}
                >
                    Coordinate
                </button>
            </div>
        </div>
    );
}
