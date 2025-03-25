
import BookingListClient from "./BookingListClient";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth/next";
import getReservations from "@/libs/getReservations";
import { removeBooking } from "@/redux/features/bookSlice";
import deleteReservation from "@/libs/deleteReservation";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";

export default async function BookingList() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.token) return null;

    const bookingItems = await getReservations(session.user.token.toString());

    return (
        <>
            <BookingListClient
                token={session.user.token.toString()} 
                bookings={bookingItems.data}
            />
        </>
    );
}
