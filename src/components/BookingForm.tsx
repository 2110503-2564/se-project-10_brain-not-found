'use client'
import DateReserve from "@/components/DateReserve";
import { TextField } from "@mui/material";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addBooking } from "@/redux/features/bookSlice";
import createReservation from "@/libs/createReservation";
import { getToken } from "next-auth/jwt";
import { revalidateTag } from "next/cache";
import { Session } from 'next-auth'; // Import Session type
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface BookingFormProps {
    session: Session | null;
    shop: ShopItem;
}

export default function BookingForm({ session , shop }: BookingFormProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [reserveDate, setReserveDate] = useState<Dayjs | null>(null);

    const handleDateChange = (value: Dayjs | null) => {
        setReserveDate(value);
    };

    const makeBooking = async () => {
        if (session?.user) {
            if(reserveDate){
                // Subtract 7 hours from the selected time (temporary workaround)
                const reservationDateWithOffset = reserveDate.add(7, 'hour').toDate();
                // const reservationDateWithOffset = reserveDate.subtract(7, 'hour').toDate();

                const booking: Reservationbody = {
                    reservationDate: reservationDateWithOffset,
                    user: session.user._id,
                    shop: shop._id
                };
                console.log("Booking Data (with -7 hour offset):", booking);
                try {
                    console.log(session?.user?.token)
                    const result = await createReservation({ token: session?.user?.token as string, Data: booking });
                    console.log("Booking Result:", result);
                    // dispatch(addBooking(booking));  // หากต้องการใช้ Redux
                } catch (error) {
                    console.error("Error creating booking:", error);
                }
            } else {
                alert("Please select a reservation date and time.");
            }
        } else {
            alert("Please Login First to make a booking.");
        }
    };

    return (
        <div className="flex flex-col space-y-2">
            <div className="w-fit space-y-2">
                <div className="text-md text-left">Reserve Date and Location</div>
                <DateReserve
                    openTime={shop.openTime}
                    closeTime={shop.closeTime}
                    onDateChange={(value: Dayjs | null) => {
                        if (value) {
                            console.log("onDateChange ===> " + value.toDate());
                            setReserveDate(value);
                        }
                    }}
                />
            </div>

            <button
                className="block bg-blue-500 text-white rounded-md px-8 py-3 hover:bg-blue-600 shadow-2xl"
                name="Book shop"
                onClick={makeBooking}
                disabled={!session?.user || !reserveDate}
            >
                {session?.user ? "Book this Massage Shop" : "Login to Book"}
            </button>
            {!session?.user && (
                <p className="text-sm text-gray-500 text-left">You need to be logged in to make a booking.</p>
            )}
        </div>
    );
}
