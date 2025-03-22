import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { BookingItem } from "../../../interfaces";

interface BookState {
    bookItems: BookingItem[];
}

const initialState: BookState = {
    bookItems: [],
};

export const bookSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        addBooking: (state, action: PayloadAction<BookingItem>) => {
            const { userId, shopId , reservationDate } = action.payload;
            const existingBookingIndex = state.bookItems.findIndex(
                (item : BookingItem ) => item.userId === userId && item.shopId === shopId && item.reservationDate === reservationDate
            );

            if (existingBookingIndex !== -1) { //if found the same venue and bookDate | replace it
                state.bookItems[existingBookingIndex] = { ...action.payload };
            } else {
                state.bookItems.push(action.payload);
            }
        },
        removeBooking: (state, action: PayloadAction<BookingItem>) => {
            const remainItems = state.bookItems.filter( (obj: BookingItem) => {
                return !((obj.userId === action.payload.userId) 
                && (obj.shopId === action.payload.shopId) 
                && (obj.reservationDate === action.payload.reservationDate) 
                && (obj.createAt === action.payload.createAt) )
            })
            state.bookItems = remainItems;
            // console.log(state.bookItems);
        },
    }
});

export const { addBooking , removeBooking} = bookSlice.actions;
export default bookSlice.reducer;
