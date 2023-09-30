"use client";

import RadioButton from "@/components/RadioButton";
import TextInput from "@/components/TextInput";
import { Member } from "@/constants/member.type";
import {
    formatDate,
    getExpiryStatus,
    getRemainingDays,
} from "@/utils/format-date";
import { useEffect, useState } from "react";

export default function Vip() {
    const [phone, setPhone] = useState("");
    const [debouncedPhone, setDebouncedPhone] = useState("");
    const [duration, setDuration] = useState(30);
    const [members, setMembers] = useState<Member[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (debouncedPhone) {
                try {
                    const member = await fetch(
                        `http://localhost:8001/v1/member/${debouncedPhone}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    if (member.status === 404) {
                        setMembers([]);
                        setDuration(30);
                        return;
                    }

                    const data = await member.json();

                    setMembers([data]);

                    setDuration(30);
                } catch (error) {
                    console.log(error);
                }
            } else {
                const members = await fetch("http://localhost:8001/v1/member", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await members.json();
                console.log(data);

                setMembers(data);

                setDuration(30);
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

    const handleExtend = async () => {
        try {
            console.log({
                phone,
                duration,
            });

            const member = await fetch(
                `http://localhost:8001/v1/member/extend/${phone}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        duration,
                    }),
                }
            );

            const data = await member.json();

            setMembers([data]);

            alert("Member extended successfully");

            return data;
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="w-full h-full max-w-[1400px] mx-auto py-10 font-sans">
            <div className="flex">
                <div className="w-1/3">
                    <div className="flex justify-between items-end py-2">
                        <TextInput
                            label="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />

                        <TextInput
                            label="Days"
                            value={duration.toString()}
                            onChange={(e) => setDuration(+e.target.value)}
                        />

                        <button
                            className="h-[45px] px-4 bg-[#1dbfaf] rounded-md font-semibold text-white"
                            onClick={(e) => {
                                e.preventDefault();

                                if (!phone) {
                                    alert("Please enter phone number");
                                    return;
                                }

                                if (!duration || duration < 1) {
                                    alert("Please enter valid duration");
                                    return;
                                }

                                handleExtend();
                            }}
                        >
                            Extend
                        </button>
                    </div>

                    <div className="py-2">
                        <p className="font-bold">Duration</p>
                        <div className="flex justify-between pt-2">
                            <RadioButton
                                label="1 Month"
                                value="30"
                                checked={duration === 30}
                                onChange={() => setDuration(30)}
                            />
                            <RadioButton
                                label="3 Month"
                                value="90"
                                checked={duration === 90}
                                onChange={() => setDuration(90)}
                            />
                            <RadioButton
                                label="6 Month"
                                value="180"
                                checked={duration === 180}
                                onChange={() => setDuration(180)}
                            />
                            <RadioButton
                                label="12 Month"
                                value="365"
                                checked={duration === 365}
                                onChange={() => setDuration(365)}
                            />
                        </div>
                    </div>

                    <div className="flex "></div>
                </div>
            </div>

            <div className="py-4">
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
                                    Renewal Date
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Expired Date
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Remaining Days
                                </th>
                                <th className="border-2 border-gray-400 p-2">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {members && members.length > 0 ? (
                                members.map((member) => (
                                    <tr
                                        key={member?._id}
                                        className="hover:bg-gray-100 cursor-pointer text-center"
                                        onClick={() => setPhone(member?.phone)}
                                    >
                                        <td className="border-2 border-gray-400 p-2">
                                            {member?._id}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {member?.phone}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {formatDate(member?.renewalDate)}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {formatDate(member?.expiryDate)}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            {getRemainingDays(
                                                member?.expiryDate
                                            )}
                                        </td>
                                        <td className="border-2 border-gray-400 p-2">
                                            <span
                                                className={`px-4 py-2 rounded-md text-white ${
                                                    getExpiryStatus(
                                                        member?.expiryDate
                                                    ) === "Expired"
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                            >
                                                {getExpiryStatus(
                                                    member?.expiryDate
                                                )}
                                            </span>
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
