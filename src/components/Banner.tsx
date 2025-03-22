'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'
import { useSession } from 'next-auth/react';

export default function Banner () {
    const covers = ["/img/cover.jpg" , "/img/cover2.jpg","/img/cover3.jpg","/img/cover4.jpg" ];
    const [index,setIndex] = useState(0);
    const router = useRouter();

    const { data: session } = useSession();
    
    if (session && session.user) {
      console.log("Bannerrrrrrrr"+session.user.token);
  } else {
      console.log("No session or user data available.");
  }

    return (
        <div className="relative w-full h-[500px]  justify-center overflow-hidden" 
            onClick={()=>{setIndex((index+1)%4);}}>
            <Image src={covers[index]} 
             alt="Banner picture"
             fill={true}
             className='object-cover'
             />

             <div className="pt-20 relative text-white text-center z-10 flex flex-col items-center justify-center gap-2">
                <h1 className='italic text-5xl font-bold font-serif'>Relax and Rejuvenate with Our Massage Shop</h1>
                <h3 className='italic text-2xl font-serif'>Book Your Massage Shop Reservation Today!</h3>   
             </div>
            
             {
                session? <div className='text-cyan-300 border border-cyan-300
                font-semibold py-2 px-2 m-2 rounded z-30 absolute top-0 right-0'>Welcome {session.user?.name} </div>
                : null
             }

             <div className='bg-white text-cyan-600 border border-cyan-600
             font-semibold py-2 px-2 m-2 rounded z-30 absolute bottom-0 right-0
             hover:bg-cyan-600 hover:text-white'
             onClick={(e)=>{router.push('/shops'); e.stopPropagation();}}>
                select Massage Shop
             </div>
             <div className='text-cyan-600 border border-cyan-600
             font-semibold py-2 px-2 m-2 rounded z-30 absolute bottom-0'>
             index : {index}
             </div>
        </div>
        
    );

}