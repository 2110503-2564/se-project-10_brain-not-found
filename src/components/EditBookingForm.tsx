'use client'
import DateReserve from "@/components/DateReserve";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { Session } from 'next-auth';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import editReservation from "@/libs/editReservation";
import Snackbar from '@mui/material/Snackbar'; // Import Snackbar
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

dayjs.extend(utc);
dayjs.extend(timezone);

interface BookingFormProps {
    session: Session | null;
    shop: ShopItem;
    reservationId: string | undefined; // Allow undefined
}

export default function EditBookingForm({ session, shop, reservationId }: BookingFormProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [reserveDate, setReserveDate] = useState<Dayjs | null>(null);
    const [isSuccessSnackbarOpen, setIsSuccessSnackbarOpen] = useState(false); // Snackbar open state
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog open state

    const handleDateChange = (value: Dayjs | null) => {
        if (!value) {
            setReserveDate(null);
            return;
        }
    
        const openHour = parseInt(shop.openTime.split(':')[0], 10);
        const closeHour = parseInt(shop.closeTime.split(':')[0], 10);
    
        // ตรวจสอบกรณีข้ามวัน
        if (closeHour < openHour) {
            const selectedHour = value.hour();
            
            if (selectedHour >= 0 && selectedHour < closeHour) {
                // ถ้าเลือกเวลาเป็นหลังเที่ยงคืน (00:00 - 02:59) ให้เลื่อนไปวันก่อนหน้า
                setReserveDate(value.subtract(1, 'day'));
            } else {
                setReserveDate(value);
            }
        } else {
            setReserveDate(value);
        }
    };

    const editBooking = () => {
        if (session?.user) {
            if (reserveDate) {
                if (reservationId) {
                    // Open the custom confirmation dialog instead of window.confirm
                    setIsDialogOpen(true);
                } else {
                    alert("Reservation ID is missing.");
                }
            } else {
                alert("Please select a reservation date and time.");
            }
        } else {
            alert("Please Login First to make a booking.");
        }
    };

    const confirmEditAction = async () => {
        if (session?.user && reserveDate && reservationId) {
            const reservationDateWithOffset = reserveDate.add(7, 'hour').format('YYYY-MM-DD HH:mm'); // Format the date as required by backend
            console.log("Change Date to:", reservationDateWithOffset);

            try {
                const result = await editReservation(reservationId, reservationDateWithOffset, session?.user?.token as string);
                console.log("Booking Result:", result);

                // Show success snackbar
                setIsSuccessSnackbarOpen(true);

                // Optionally hide the success snackbar after a few seconds
                setTimeout(() => {
                    setIsSuccessSnackbarOpen(false);
                }, 3000); // Hide success message after 3 seconds
            } catch (error) {
                console.error("Error creating booking:", error);
            }
        }
        setIsDialogOpen(false); // Close dialog after confirmation
    };

    const cancelEditAction = () => {
        setIsDialogOpen(false); // Close dialog if user cancels
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
                            const trueValue = value.subtract(7, 'hour'); // Always use Dayjs, no need to convert to Date
                            console.log("onDateChange ===> " + trueValue.toISOString());
                            setReserveDate(trueValue);
                        }
                    }}
                />
            </div>

            <button
                className="block bg-blue-500 text-white rounded-md px-8 py-3 hover:bg-blue-600 shadow-2xl"
                name="Edit shop"
                onClick={editBooking}
                disabled={!session?.user || !reserveDate}
            >
                {session?.user ? "Edit Massage Shop" : "Login to Book"}
            </button>

            {/* Success Snackbar */}
            <Snackbar
                open={isSuccessSnackbarOpen}
                autoHideDuration={3000} // Auto hide after 3 seconds
                onClose={() => setIsSuccessSnackbarOpen(false)}
                message="Your reservation has been successfully updated."
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Move snackbar to top
                sx={{
                    backgroundColor: 'green',  // Set background to green
                    color: 'white',  // Text color is white
                    borderRadius: '4px',
                    padding: '10px 20px',
                    '& .MuiSnackbarContent-message': {
                        color: 'white',  // Ensure the message text is white
                    },
                    '& .MuiSnackbarContent-root': {
                        backgroundColor: 'green',  // Set the background color of the snackbar to green
                    },
                }}
            />
            {/* Confirmation Dialog */}
            <Dialog open={isDialogOpen} onClose={cancelEditAction}>
                <DialogTitle>Confirm Reservation Edit</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to update the reservation?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelEditAction} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={confirmEditAction} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
