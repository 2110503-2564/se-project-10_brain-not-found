'use client'
import { DatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Select , MenuItem } from '@mui/material'
import { useState , useEffect} from 'react'
import { Dayjs } from 'dayjs'
import getShops from "@/libs/getShops";

export default function DateReserve( {onDateChange , onShopChange , onTimeChange , defaultShop}
    : { onDateChange:Function , onTimeChange:Function ,onShopChange:Function , defaultShop:string|null}
 ){

    const [reserveDate , setReserveDate] = useState<Dayjs | null>(null);
    const [selectedShop , setSelectedShop] = useState(defaultShop);
    const [shops, setShops] = useState<ShopItem[]>([]);
    const [timeService, setTimeService] = useState<string | null>("0");
    useEffect(() => {
        const fetchShops = async () => {
          const data = await getShops();
          setShops(data.data);
        };
        fetchShops();
      }, []);

      useEffect(() => {
        if(!defaultShop){
        setSelectedShop("");
        }
      }, []);

      const handleShopChange = (event: any) => {
        setSelectedShop(event.target.value);
      };

    return(
        <div className="bg-slate-100 rounded-lg space-x-5 space-y-2
        w-fit px-10 py-5 flex flex-row justify-center shadow-md">

            <div className='text-black flex flex-col'>Reservation Date
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker className='bg-red'
                        label="Choose a date"
                        value={reserveDate}
                        onChange={(value) => {setReserveDate(value); onDateChange(value)}}
                    />
                </LocalizationProvider>
            </div>
                <div className='text-black flex flex-col'>Location      
                    <Select
                        required
                        variant="standard" 
                        name='location'  
                        id='shop' 
                        className='h-[2em] w-[200px] rounded-md py-2 px-2 my-2'
                        value={selectedShop}
                        onChange={ (e) => {handleShopChange(e);}}
                    >
                        <MenuItem key={"default"} value={""} disabled>
                            Please select a shop. </MenuItem>

                        {shops.map((shop) => (
                            <MenuItem key={shop.id} value={shop.id} onClick={ ()=>{ onShopChange(shop.name); }}>
                                {shop.name}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
                <div className='text-black flex flex-col'>Time
                    <Select
                        required
                        variant="standard" 
                        name='location'  
                        id='shop' 
                        className='h-[2em] w-[200px] rounded-md py-2 px-2 my-2'
                        value={selectedShop}
                        onChange={ (e) => {handleShopChange(e);}}
                    >
                        <MenuItem key={"default"} value={""} disabled>
                            Please select a time to receive. </MenuItem>
                        {shops.((shop) => (
                            <MenuItem key={shop.id} value={shop.id} onClick={ ()=>{ onTimeChange(shop.name); }}>
                                {shop.name}
                            </MenuItem>
                        ))}
                    </Select>
                    
                </div> 
        </div>
    );
}