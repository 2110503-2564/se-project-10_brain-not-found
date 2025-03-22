'use client'
import { DatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Select , MenuItem } from '@mui/material'
import { useState , useEffect} from 'react'
import { Dayjs } from 'dayjs'
import getVenues from "@/libs/getVenues";

export default function DateReserve( {onDateChange , onLocationChange , onLocationNameChange , defaultVenue}
    : { onDateChange:Function , onLocationChange:Function , onLocationNameChange:Function , defaultVenue:string|null}
 ){

    const [reserveDate , setReserveDate] = useState<Dayjs | null>(null);
    const [selectedVenue , setSelectedVenue] = useState(defaultVenue);
    const [venues, setVenues] = useState<VenueItem[]>([]);

    useEffect(() => {
        const fetchVenues = async () => {
          const data = await getVenues();
          setVenues(data.data);
        };
        fetchVenues();
      }, []);

      useEffect(() => {
        if(!defaultVenue){
        setSelectedVenue("");
        }
      }, []);

      const handleVenueChange = (event: any) => {
        setSelectedVenue(event.target.value);
        onLocationChange(event.target.value);
      };

    return(
        <div className="bg-slate-100 rounded-lg space-x-5 space-y-2
        w-fit px-10 py-5 flex flex-row justify-center shadow-md">

            <div className='text-black flex flex-col'>Rservaion Date
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
                        id='venue' 
                        className='h-[2em] w-[200px] rounded-md py-2 px-2 my-2'
                        value={selectedVenue}
                        onChange={ (e) => {handleVenueChange(e);}}
                    >
                        <MenuItem key={"default"} value={""} disabled>
                            Please select a Venue. </MenuItem>

                        {venues.map((venue) => (
                            <MenuItem key={venue.id} value={venue.id} onClick={ ()=>{ onLocationNameChange(venue.name); }}>
                                {venue.name}
                            </MenuItem>
                            ))}
                    </Select>
                </div> 
        </div>
    );
}