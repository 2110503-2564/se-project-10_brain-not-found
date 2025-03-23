"use client"
import DateReserve from "@/components/DateReserve";
import { TextField } from "@mui/material";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addBooking } from "@/redux/features/bookSlice";
import createReservation from "@/libs/createReservation";
import { getToken } from "next-auth/jwt";

interface BookingFormProps {
  token: string;
  userId: string;
  shop: ShopItem;
}

export default function BookingForm({ token , userId, shop }: BookingFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [reserveDate, setReserveDate] = useState<Dayjs | null>(null);
  
  const makeBooking = async () => {
    if (reserveDate && userId) {
      const booking: Reservationbody = {
        reservationDate: dayjs(reserveDate).toDate(),
        user: userId,
        shop: shop._id
      };

      try {
        const result = await createReservation({token , Data: booking});
        console.log("Booking Reult : " + result.toString());
        // console.log("Booking created:", result);
        // dispatch(addBooking(booking));
      } catch (error) {
        console.error("Error creating booking:", error);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="w-fit space-y-2">
        <div className="text-md text-left">Reserve Date and Location</div>
        <DateReserve
          onDateChange={(value: Dayjs) => {
            setReserveDate(value);
          }}
        />
      </div>

      <button
        className="block bg-blue-500 text-white rounded-md px-8 py-3 hover:bg-blue-600 shadow-2xl"
        name="Book shop"
        onClick={makeBooking}
      >
        Book this Massage Shop
      </button>
    </div>
  );
}
