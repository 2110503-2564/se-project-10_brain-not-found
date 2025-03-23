'use client'
import { DateTimePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Select, MenuItem } from '@mui/material'
import { useState, useEffect } from 'react'
import { Dayjs } from 'dayjs'
import getShops from "@/libs/getShops";

export default function DateReserve({
    onDateChange
}: { onDateChange: Function }
) {

    const [reserveDate, setReserveDate] = useState<Dayjs | null>(null);

    return (
        <div className="bg-slate-100 rounded-lg space-x-5 space-y-2
        w-fit px-10 py-5 flex flex-row justify-center shadow-md">

            {/* วันที่ */}
            <div className='text-black flex flex-col'>
                Reservation Date
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                        label="Choose a date"
                        value={reserveDate}
                        onChange={(value) => { console.log(value); setReserveDate(value); onDateChange(value); }}
                    />
                </LocalizationProvider>
            </div>

        </div>
    );
}
