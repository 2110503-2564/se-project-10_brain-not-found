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
  openTime: string; // เช่น "09:00"
  closeTime: string; // เช่น "18:00"
}) {
  const [reserveDate, setReserveDate] = useState<Dayjs | null>(null);
    const open = dayjs(openTime, 'HH:mm');
    const close = dayjs(closeTime, 'HH:mm');

  const handleDateChange = (value: Dayjs | null) => {
    if (value) {
      // console.log("handleChange ::: "+ value.toDate());
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
            onChange={(value)=>handleDateChange(value)}
            disablePast
            ampm={false} // ใช้เวลาในรูปแบบ 24 ชั่วโมง
            views={['day', 'hours', 'minutes']} // แสดงวันที่, ชั่วโมง และนาที
            shouldDisableTime={(time, view) => {
              if (view === 'hours' || view === 'minutes') {
                // ถ้ายังไม่ได้เลือกวัน จะไม่จำกัดเวลา
                if (!reserveDate) return false;

                // สร้าง dayjs object สำหรับเวลาเลือกในวันนี้
                const selectedTimeToday = dayjs()
                  .set('hour', time.hour())
                  .set('minute', time.minute());

                // ตรวจสอบว่าเวลาเลือกนั้นอยู่ในช่วงที่กำหนดหรือไม่
                return selectedTimeToday.isBefore(open) || selectedTimeToday.isAfter(close);
              }
              return false;
            }}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
}
