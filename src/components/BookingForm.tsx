'use client'
import DateReserve from "@/components/DateReserve";
import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { AppDispatch } from "@/redux/store";
import createReservation from "@/libs/createReservation";
import { Session } from 'next-auth';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Snackbar from '@mui/material/Snackbar';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { green } from '@mui/material/colors';
import { useDispatch } from "react-redux";

dayjs.extend(utc);
dayjs.extend(timezone);

interface BookingFormProps {
    session: Session | null;
    shop: ShopItem;
}

export default function BookingForm({ session, shop }: BookingFormProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [reserveDate, setReserveDate] = useState<Dayjs | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [isLoginRequired, setIsLoginRequired] = useState(false);
    const router = useRouter();

    // ตรวจสอบ session ทุกครั้งที่ session หรือ isLoginRequired เปลี่ยนแปลง
    useEffect(() => {
        if (session && !session.user) {
            setIsLoginRequired(true);
            setSnackbarMessage('You need to be logged in to make a booking.');
            setOpenSnackbar(true);
        } else if (session && session.user) {
            setIsLoginRequired(false);
        }
    }, [session]);

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

    const makeBooking = async () => {
        if (session?.user) {
            if (reserveDate) {
                const reservationDateWithOffset = reserveDate.add(7, 'hour').toDate();
                const booking: Reservationbody = {
                    reservationDate: reservationDateWithOffset,
                    user: session.user._id,
                    shop: shop._id,
                    userName: session.user.name
                };
                try {
                    const result = await createReservation({ token: session.user.token as string, Data: booking });
                    setSnackbarMessage('Successful Reservation');
                    setOpenSnackbar(true);
                } catch (error) {
                    setSnackbarMessage('Error Reservation');
                    setOpenSnackbar(true);
                }
            } else {
                setSnackbarMessage('Please select a reservation date and time.');
                setOpenSnackbar(true);
            }
        } else {
            setIsLoginRequired(true); // useEffect จะจัดการ Snackbar ให้เอง
        }
    };
    

    const handleGoToLogin = () => {
        router.push('/api/auth/signin');
    };

    return (
        <div className="flex flex-col space-y-2">
            <div className="w-fit space-y-2">
                <div className="text-md text-left">Reserve Date and Location</div>
                <DateReserve
                    openTime={shop.openTime}
                    closeTime={shop.closeTime}
                    onDateChange={handleDateChange}
                />
            </div>

            <div className="w-full">
                <button
                    className={`block ${
                        session?.user ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
                    } text-white rounded-md px-8 py-3 shadow-2xl`}
                    onClick={makeBooking}
                    disabled={!session?.user || !reserveDate}
                >
                    Book this Massage Shop
                </button>
            </div>

            {/* ข้อความแจ้งเตือนแสดงตลอด ไม่ว่าจะล็อกอินหรือไม่ */}
            <div className="text-sm text-red-500 text-left flex items-center mt-2">
                {!session?.user && (
                    <p>You need to be logged in to make a booking.</p>
                )}
                {!session?.user && (
                    <button className="ml-2 text-blue-500 underline" onClick={handleGoToLogin}>
                        Login
                    </button>
                )}
            </div>


            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ backgroundColor: isLoginRequired ? 'red' : green[500] }}
            >
                <div className="flex justify-between items-center">
                    <h1 className="text-white text-center text-xl font-semibold shadow-md">
                        {snackbarMessage}
                    </h1>

                    <IconButton
                        size="small"
                        onClick={() => setOpenSnackbar(false)}
                        sx={{ color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {isLoginRequired ? (
                        <IconButton
                            size="small"
                            onClick={handleGoToLogin}
                            sx={{ color: 'white' }}
                        >
                            <ArrowForwardIcon />
                        </IconButton>
                    ) : (
                        <IconButton
                            size="small"
                            onClick={() => router.push('/mybooking')}
                            sx={{ color: 'white' }}
                        >
                            <ArrowForwardIcon />
                        </IconButton>
                    )}
                </div>
            </Snackbar>
        </div>
    );
}
