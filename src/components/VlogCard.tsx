'use client'
import { useState } from 'react'
import { VlogPlayer } from "./VlogPlayer"
import MuiRating from '@mui/material/Rating';

export default function VlogCard(){

    const [playing, setPlaying] = useState(true)
    const [rating, setRating] = useState<number | null>(0);

    return (
        <div className="w-[80%] shadow-lg mx-[10%] my-10 p-2
         rounded-lg bg-gray-500 flex flex-row">
            <VlogPlayer videoSrc="/video/city_tiny.mp4" isPlaying={playing}/>

            <div className='m-5'>Some Where Natural

            <button className="block bg-blue-500 text-white rounded-md px-8 py-3 hover:bg-blue-600 shadow-2xl"
                onClick={()=>{ setPlaying(!playing)}}>
                { playing? 'Pause' : 'Play'}
                </button>
                
                <MuiRating
                    value={ (rating==undefined)? 0 : rating }
                    onChange={(e, newValue) => {
                        if(newValue!=null)
                        setRating(newValue);
                    }}
                    onClick={(e)=>e.stopPropagation()}
                />

            </div>
        </div>
    )
}
