'use client'
import Image from "next/image";
import { useDispatch } from "react-redux";
import { removeBooking } from "@/redux/features/bookSlice";
import deleteReservation from "@/libs/deleteReservation";
import dayjs from "dayjs";
import Link from "next/link";
import { useState } from "react";

export default function BookingListClient({ token, bookings }: { token: string; bookings: ReservationItem[] }) {
    const dispatch = useDispatch();
    const [updatedBookings, setUpdatedBookings] = useState(bookings);  // ใช้ state เพื่อจัดการข้อมูล booking

    const deleteBooking = async (reservationId: string) => {
        try {
            const response = await deleteReservation({ token, reservationId });
            if (response.success) {
                dispatch(removeBooking(response));  // ลบข้อมูลจาก Redux

                // ลบรายการออกจาก state bookings
                setUpdatedBookings((prevBookings) => prevBookings.filter((item) => item._id !== reservationId));
            } else {
                console.error("Error: Failed to delete reservation");
            }
        } catch (error) {
            console.error("Error deleting reservation:", error);
        }
    };

    return (
        <div className="p-5">
            {updatedBookings.length === 0 ? (
                <div className="text-center text-lg text-orange-600">No Venue Booking</div>
            ) : (
                updatedBookings.map((item) => (
                    <div
                        className="bg-white border-2 border-orange-500 rounded-lg px-6 py-4 my-3 text-black shadow-md"
                        key={item._id}
                    >
                        <div className="flex flex-row items-center space-x-5">
                            <div>
                                <Image
                                    src={item.shop.picture ?? '/img/logo.png'}
                                    alt="Item Picture"
                                    width={120}
                                    height={120}
                                    className="object-cover rounded-lg border border-orange-300"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="text-lg font-semibold text-orange-600">{item.shop.name}</div>
                                <div className="text-sm">Booker ID: {item.user}</div>
                                <div className="text-sm">Reservation Holder: {item.userName}</div>
                                <div className="text-sm">Create At: {new Date(item.createAt).toDateString()}</div>
                                <div className="text-sm">Booking Date: {new Date(item.reservationDate).toDateString()}</div>
                                <div className="text-sm">Booking Time: {dayjs(item.reservationDate).subtract(7, 'hour').format('HH:mm')}</div>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    className="bg-orange-500 text-white rounded-md px-5 py-2 hover:bg-orange-600 shadow-lg"
                                    onClick={() => deleteBooking(item._id)}  // ลบข้อมูลเมื่อกด Cancel
                                >
                                    Cancel
                                </button>
                                
                                {/* ใช้ Link แทนการใช้ router.push() */}
                                <Link href={`/mybooking/${item._id}`}>
                                    <button className="bg-gray-500 text-white rounded-md px-5 py-2 hover:bg-gray-600 shadow-lg">
                                        Edit
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
