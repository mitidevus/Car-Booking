"use client";

import TextInput from "@/components/TextInput";
import { Trip, TripDetail } from "@/constants/trip.type";
import { useEffect, useState } from "react";
import { formatDate } from "@/utils/format-date";
import Dropdown from "@/components/Dropdown";
import { Statistic } from "@/constants/statistic.type";

export default function Trip() {
    const [userType, setUserType] = useState("Guest");
    const [type, setType] = useState("Month");
    const [typeValue, setTypeValue] = useState("9");
    const [year, setYear] = useState("2023");
    const [statistics, setStatistics] = useState<Statistic[] | null>(null);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);

    console.log("statistic", statistics);

    useEffect(() => {
        const fetchData = async () => {
            if (userType && type && typeValue && year) {
                try {
                    const urls = [
                        `http://localhost:8085/v1/user/top-users?${type.toLowerCase()}=${typeValue}&year=${year}&userType=${userType.toLowerCase()}`,
                        `http://localhost:8085/v1/user/statistic-price?${type.toLowerCase()}=${typeValue}&year=${year}&userType=${userType.toLowerCase()}`,
                    ];

                    const response = await Promise.all(
                        urls.map((url) => fetch(url))
                    );

                    const data = await Promise.all(
                        response.map((res) => res.json())
                    );

                    console.log("response", data[0].data);

                    const statistics = data[0].data;
                    const totalRevenue = data[1].data.totalRevenue;
                    const totalProfit = data[1].data.totalProfit;

                    setStatistics(statistics);
                    setTotalRevenue(totalRevenue);
                    setTotalProfit(totalProfit);
                } catch (error) {
                    console.log(error);
                }
            }
        };

        fetchData();
    }, [userType, type, typeValue, year]);

    return (
        <div className="w-full h-full max-w-[1400px] mx-auto py-10 font-sans">
            <div className="flex">
                <div className="flex py-4 w-1/2">
                    <Dropdown
                        label="Type"
                        value={type}
                        data={["Month", "Quarter"]}
                        onChange={(e) => setType(e.target.value)}
                    />
                    <Dropdown
                        label="Value"
                        value={typeValue}
                        data={
                            type === "Month"
                                ? [
                                      "1",
                                      "2",
                                      "3",
                                      "4",
                                      "5",
                                      "6",
                                      "7",
                                      "8",
                                      "9",
                                      "10",
                                      "11",
                                      "12",
                                  ]
                                : ["1", "2", "3", "4"]
                        }
                        onChange={(e) => setTypeValue(e.target.value)}
                    />
                    <Dropdown
                        label="Year"
                        value={year}
                        data={["2021", "2022", "2023", "2024", "2025"]}
                        onChange={(e) => setYear(e.target.value)}
                    />

                    <Dropdown
                        label="User Type"
                        value={userType}
                        data={["Guest", "User", "Driver"]}
                        onChange={(e) => setUserType(e.target.value)}
                    />
                </div>
                <div className="w-1/2 flex justify-end items-center">
                    <div>
                        <div className="flex items-center justify-end">
                            <span className="font-bold">Total Revenue: </span>
                            <span className="text-[#000232] ml-2">
                                {totalRevenue.toLocaleString("vi-VN")} VND
                            </span>
                        </div>
                        <div className="flex items-center justify-end">
                            <span className="font-bold">
                                {"Total Profit (10%): "}
                            </span>
                            <span className="text-[#1dbfaf] ml-3">
                                {totalProfit.toLocaleString("vi-VN")} VND
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 pb-4">
                <div className="max-h-[300px] h-[300px] overflow-y-auto">
                    <table className="table-auto w-full">
                        <thead className="sticky top-0">
                            <tr className="bg-[#000232] text-white">
                                {userType != "Guest" && (
                                    <th className="border-2 border-gray-400 p-2">
                                        ID
                                    </th>
                                )}
                                <th className="border-2 border-gray-400 p-2">
                                    Phone
                                </th>

                                {userType === "User" && (
                                    <>
                                        <th className="border-2 border-gray-400 p-2">
                                            First Name
                                        </th>
                                        <th className="border-2 border-gray-400 p-2">
                                            Last Name
                                        </th>
                                    </>
                                )}

                                <th className="border-2 border-gray-400 p-2">
                                    Total Trips
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Total Cost (VND)
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {statistics && statistics.length > 0 ? (
                                statistics.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-100 cursor-pointer text-center"
                                    >
                                        {userType !== "Guest" && (
                                            <td className="border-2 border-gray-400 p-2">
                                                {item?.id}
                                            </td>
                                        )}
                                        <td className="border-2 border-gray-400 p-2">
                                            {item?.phone}
                                        </td>

                                        {item?.firstName && (
                                            <td className="border-2 border-gray-400 p-2">
                                                {item?.firstName}
                                            </td>
                                        )}

                                        {item?.lastName && (
                                            <td className="border-2 border-gray-400 p-2">
                                                {item?.lastName}
                                            </td>
                                        )}

                                        <td className="border-2 border-gray-400 p-2">
                                            {item?.totalTrip}
                                        </td>

                                        <td className="border-2 border-gray-400 p-2">
                                            {item?.totalPrice.toLocaleString(
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
        </div>
    );
}
