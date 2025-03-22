"use client"
import { useAppSelector , AppDispatch } from "@/redux/store"
import { useDispatch } from "react-redux";
import { removeBooking } from "@/redux/features/bookSlice";

export default function BookingList(){
    
    const bookingItems = useAppSelector( (state)=> state.bookSlice.bookItems );
    const dispatch = useDispatch<AppDispatch>();
    
    return(
        <>
            {   
                bookingItems.length == 0 ? (
                    <div className="text-center text-lg">No Venue Booking</div>
                ) : (
                bookingItems.map((item)=>
                    <div className="bg-slate-200 rounded px-5 mx-5 py-2 my-2 text-black" 
                    key={item.userId+item.shopId+item.reservationDate+item.createAt}>
                        <div className="text-xl">Location : {item.shopName}</div>
                        <div className="text-sm">Shop ID : {item.shopId}</div>
                        <div className="text-sm">Booker ID: {item.userId}</div>
                        <div className="text-sm">Create At : {item.createAt}</div>
                        <div className="text-sm">Booking Date : {item.reservationDate}</div>

                    <button className="m-2 block bg-blue-500 text-white rounded-md px-8 py-3 hover:bg-blue-600 shadow-2xl"
                    name="Book Venue" onClick={()=> dispatch(removeBooking(item))}>
                        cancel this Booking
                    </button>

                    </div>
                    )
                    
                )
            }
        </>
    )
}
