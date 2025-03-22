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
  shop: ShopItem | null;
}

export default function BookingForm({ userId, shop }: BookingFormProps) {
  const dispatch = useDispatch<AppDispatch>();

  const makeBooking = () => {
    console.log(reserveDate,"user : "+ userId,"shop : "+ selectedShop);
    if (reserveDate && userId && selectedShop &&selectedShopName) {
      const booking: BookingItem = {
        userId: userId,
        shopId: selectedShop,
        shopName: selectedShopName,
        reservationDate: dayjs(reserveDate).format("YYYY-MM-DD"),
        createAt: dayjs().format("YYYY-MM-DD"), // Use current date for creation
      };
      console.log("Booking:", booking);
      dispatch(addBooking(booking));
    }
  };

  const [reserveDate, setReserveDate] = useState<Dayjs | null>(null);
  const [selectedShop, setSelectedShop] = useState<string | null>(shop?._id || null);
  const [selectedShopName, setSelectedShopName] = useState<string | null>(shop?.name||null);
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
            setSelectedShop(value);
          }}
          onLocationNameChange={(value: string) => {
            setSelectedShopName(value);
          }}
          defaultShop={selectedShop??""}
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
