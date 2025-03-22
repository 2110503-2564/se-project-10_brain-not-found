'use client'
import MuiRating from '@mui/material/Rating';
import { useState } from "react";

export function Rating( {shopName , onCompare}
    : {shopName: string  ,onCompare:Function}){

    const [rating, setRating] = useState<number | null>(0);

    return (
        <MuiRating
        name={shopName+" Rating"}
        id={shopName+" Rating"}
        data-testid={shopName+" Rating"}
        value={ (rating==undefined)? 0 : rating }
        onChange={(e, newValue) => {
            if(newValue!=null)
            setRating(newValue);
            onCompare(shopName, newValue);
        }}
        onClick={(e)=>e.stopPropagation()}
    />
    )
}