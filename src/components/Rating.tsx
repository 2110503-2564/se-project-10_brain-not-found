'use client'
import MuiRating from '@mui/material/Rating';
import { useState } from "react";

export function Rating( {venueName , onCompare}
    : {venueName: string  ,onCompare:Function}){

    const [rating, setRating] = useState<number | null>(0);

    return (
        <MuiRating
        name={venueName+" Rating"}
        id={venueName+" Rating"}
        data-testid={venueName+" Rating"}
        value={ (rating==undefined)? 0 : rating }
        onChange={(e, newValue) => {
            if(newValue!=null)
            setRating(newValue);
            onCompare(venueName, newValue);
        }}
        onClick={(e)=>e.stopPropagation()}
    />
    )
}