'use client';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

export default function DateReserve({
  onDateChange,
  openTime,
  closeTime,
}: {
  onDateChange: (value: Dayjs | null) => void;
  openTime: string; // เช่น "23:00"
  closeTime: string; // เช่น "03:00"
}) {
  const [reserveDate, setReserveDate] = useState<Dayjs | null>(null);

  const open = dayjs().set('hour', parseInt(openTime.split(':')[0])).set('minute', parseInt(openTime.split(':')[1]));
  const close = dayjs().set('hour', parseInt(closeTime.split(':')[0])).set('minute', parseInt(closeTime.split(':')[1]));

  // ตรวจสอบว่าร้านเปิดข้ามวันหรือไม่
  const isOvernight = close.isBefore(open);

  const handleDateChange = (value: Dayjs | null) => {
    if (value) {
      setReserveDate(value);
      onDateChange(value);
    }
  };

  return (
    <div className="bg-slate-100 rounded-lg space-x-5 space-y-2 w-fit px-10 py-5 flex flex-row justify-center shadow-md">
      <div className="text-black flex flex-col">
        Reservation Date
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Choose a date"
            value={reserveDate}
            onChange={handleDateChange}
            disablePast
            ampm={false}
            views={['day', 'hours', 'minutes']}
            shouldDisableTime={(time, view) => {
              if (view === 'hours' || view === 'minutes') {
                if (!reserveDate) return false;

                const selectedTime = dayjs()
                  .set('hour', time.hour())
                  .set('minute', time.minute());

                if (isOvernight) {
                  // กรณีเปิดข้ามวัน (เช่น 23:00 - 03:00)
                  return !(selectedTime.isAfter(open) || selectedTime.isBefore(close));
                } else {
                  // กรณีปกติ (เช่น 09:00 - 18:00)
                  return selectedTime.isBefore(open) || selectedTime.isAfter(close);
                }
              }
              return false;
            }}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
}
