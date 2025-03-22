"use client";
import DateReserve from "@/components/DateReserve";
import { TextField } from "@mui/material";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addBooking } from "@/redux/features/bookSlice";

interface BookingFormProps {
  userId: string;
  venue: VenueItem | null;
}

export default function BookingForm({ userId, venue }: BookingFormProps) {
  const dispatch = useDispatch<AppDispatch>();

  const makeBooking = () => {
    console.log(reserveDate,"user : "+ userId,"venue : "+ selectedVenue);
    if (reserveDate && userId && selectedVenue &&selectedVenueName) {
      const booking: BookingItem = {
        userId: userId,
        shopId: selectedVenue,
        shopName: selectedVenueName,
        reservationDate: dayjs(reserveDate).format("YYYY-MM-DD"),
        createAt: dayjs().format("YYYY-MM-DD"), // Use current date for creation
      };
      console.log("Booking:", booking);
      dispatch(addBooking(booking));
    }
  };

  const [reserveDate, setReserveDate] = useState<Dayjs | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(venue?._id || null);
  const [selectedVenueName, setSelectedVenueName] = useState<string | null>(venue?.name||null);
  return (
    <div className="flex flex-col space-y-2">
      {/* <TextField
        id="Name-Lastname"
        name="Name-Lastname"
        label="Name-Lastname"
        variant="standard"
        className="w-[250px] border-2 border-solid bg-white rounded-md"
        onChange={(e) => {
          setUserName(e.target.value);
        }}
      />
      Useless by now . I use User's infomation from their account.
      <TextField
        id="Contact-Number"
        name="Contact-Number"
        label="Contact-Number"
        variant="standard"
        className="w-[250px] border-2 border-solid bg-white rounded-md"
        onChange={(e) => {
          setUserContact(e.target.value);
        }}
      />Useless by now . I use User's infomation from their account. */}

      <div className="w-fit space-y-2">
        <div className="text-md text-left">Reserve Date and Location</div>
        <DateReserve
          onDateChange={(value: Dayjs) => {
            setReserveDate(value);
          }}
          onLocationChange={(value: string) => {
            setSelectedVenue(value);
          }}
          onLocationNameChange={(value: string) => {
            setSelectedVenueName(value);
          }}
          defaultVenue={selectedVenue??""}
        />
      </div>

      <button
        className="block bg-blue-500 text-white rounded-md px-8 py-3 hover:bg-blue-600 shadow-2xl"
        name="Book Venue"
        onClick={makeBooking}
      >
        Book this Venue
      </button>
    </div>
  );
}
