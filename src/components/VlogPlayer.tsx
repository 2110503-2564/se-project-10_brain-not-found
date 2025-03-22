'use client'
import { useRef , useEffect, useState} from 'react'
// import { useWindowListener } from '@/hooks/useWindowListener'

export function VlogPlayer({videoSrc , isPlaying }:
    {videoSrc:string , isPlaying:boolean}){

    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(()=>{
    //    alert("useEffect called")
    if(isPlaying)videoRef.current?.play()
    else videoRef.current?.pause()
    }, [isPlaying])

    // useWindowListener('resize' , (e)=>{ alert("resize called"+ (e.target as Window).innerWidth)});

    return (
        <video className="w-[40%]" src={videoSrc}
        controls loop muted ref={videoRef}/>
    )
}

// built-in Hooks //
// useCallback  ,    //cache function ข้ามการ re-render
//  useContext ,     // similar useState but can pass value to all children in tee
//  usePathname ,    // get Current URL Path name
//   useMemo    //store Calculate Result