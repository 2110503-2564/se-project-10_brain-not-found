import { useState, useEffect } from 'react';


export function useWindowListener(evenType:string , listener:EventListener) {

    useEffect(() => {

        window.addEventListener(evenType, listener);

    return () => 
        window.removeEventListener(evenType, listener);
    }, [] );

}