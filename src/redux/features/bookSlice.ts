import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { BookingItem } from "../../../interfaces";

interface BookState {
    bookItems: ReservationItem[];
}

const initialState: BookState = {
    bookItems: [],
};

export const bookSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        addBooking: (state, action: PayloadAction<ReservationItem>) => {
            const { user, shop , reservationDate } = action.payload;
            const existingBookingIndex = state.bookItems.findIndex(
                (item : ReservationItem ) => item.user === user && item.shop === shop && item.reservationDate === reservationDate
            );

            if (existingBookingIndex !== -1) { //if found the same venue and bookDate | replace it
                state.bookItems[existingBookingIndex] = { ...action.payload };
            } else {
                state.bookItems.push(action.payload);
            }
        },
        removeBooking: (state, action: PayloadAction<ReservationItem>) => {
            const remainItems = state.bookItems.filter( (obj: ReservationItem) => {
                return !((obj.user === action.payload.user) 
                && (obj.shop === action.payload.shop) 
                && (obj.reservationDate === action.payload.reservationDate) 
                && (obj.createAt === action.payload.createAt))
            })
            state.bookItems = remainItems;
            // console.log(state.bookItems);
        },
    }
});

export const { addBooking , removeBooking} = bookSlice.actions;
export default bookSlice.reducer;
