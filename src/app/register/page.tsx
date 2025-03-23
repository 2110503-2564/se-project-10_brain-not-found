"use client"
import { useState } from "react";
import userSignUp from "@/libs/userSignUp"; // Import ฟังก์ชันที่สร้างไว้

export default function RegisterPage() {
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userRole, setUserRole] = useState("user");
    const [userPassword, setUserPassword] = useState("");
    const [userTel, setUserTel] = useState("");

    const handleSignUp = async () => {
        try {
            const result = await userSignUp(
                userName,
                userEmail,
                userRole,
                userPassword,
                userTel,
            );
            alert("Signup Successful!");
            console.log(result)
        } catch (error) {
            alert("Signup Failed! " + (error as Error).message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Sign Up</h2>
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-blue-600">Name</h2>
                    <input
                        type="text"
                        placeholder="Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <h2 className="text-xl font-bold text-blue-600">Email</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setUserEmail(e.target.value)}
                    />
                    <h2 className="text-xl font-bold text-blue-600">Password</h2>
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setUserPassword(e.target.value)}
                    />
                    <h2 className="text-xl font-bold text-blue-600">Telephone Number</h2>
                    <input
                        type="text"
                        placeholder="Tel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setUserTel(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleSignUp}
                    className="w-full mt-6 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Register
                </button>
            </div>
        </div>
    );
}
