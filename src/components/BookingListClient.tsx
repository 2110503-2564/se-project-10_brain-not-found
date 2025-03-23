"use client";

import { useAppSelector, AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeBooking } from "@/redux/features/bookSlice";
import deleteReservation from "@/libs/deleteReservation";

interface BookingListClientProps {
    token: string;
    bookings: ReservationItem[];
}
export default function BookingListClient({ token, bookings }: BookingListClientProps) {
    const dispatch = useDispatch();

    const deleteBooking = async (reservationId: string) => {
        try {
            // ฟังก์ชันลบการจอง
            const response = await deleteReservation({token , reservationId});  // ทำการลบการจอง (ใช้ฟังก์ชัน async)
            dispatch(removeBooking(reservationId));  // อัพเดต Redux state
        } catch (error) {
            console.error("Error deleting reservation:", error);
        }
    };
    
    return (
        <>
            {bookings.length === 0 ? (
                <div className="text-center text-lg">No Venue Booking</div>
            ) : (
                bookings.map((item) => (
                    <div className="bg-slate-200 rounded px-5 mx-5 py-2 my-2 text-black" key={item._id}>
                        <div className="text-sm">Shop Name: {item.shop.name}</div>
                        <div className="text-sm">Booker ID: {item.user}</div>
                        <div className="text-sm">Create At: {new Date(item.createAt).toDateString()}</div>
                        <div className="text-sm">Booking Date: {new Date(item.reservationDate).toDateString()}</div>

                        <button
                            className="m-2 block bg-blue-500 text-white rounded-md px-8 py-3 hover:bg-blue-600 shadow-2xl"
                            name="Book Venue"
                            onClick={() => {deleteBooking(item._id)}}
                        >
                            Cancel this Booking
                        </button>
                    </div>
                ))
            )}
        </>
    );
}


