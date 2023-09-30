import Image from "next/image";
import Link from "next/link";
import React from "react";

import Logo from "../../public/logo-app.svg";

function Navbar() {
    return (
        <div className="w-full h-[92px] px-[200px] flex justify-between items-center bg-[#000232] text-white">
            <div className="flex items-center">
                <Link href="/">
                    <Image
                        className="rounded"
                        src={Logo}
                        alt="Logo"
                        style={{ width: "50px", cursor: "pointer" }}
                    />
                </Link>
                <div className="ml-4">
                    <h1 className="text-white font-semibold text-lg">
                        CALL CENTER
                    </h1>
                </div>
            </div>

            <ul className="flex items-center font-semibold">
                <li>
                    <Link href="/" className="px-4 py-2">
                        Booking
                    </Link>
                </li>
                <li>
                    <Link href="/vip" className="px-4 py-2">
                        VIP
                    </Link>
                </li>
                <li>
                    <Link href="/trip" className="px-4 py-2">
                        Trip
                    </Link>
                </li>
                <li>
                    <Link href="/statistics" className="px-4 py-2">
                        Statistics
                    </Link>
                </li>
            </ul>
        </div>
    );
}

export default Navbar;
