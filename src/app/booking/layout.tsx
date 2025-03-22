import ReservationMenu from "@/components/ReservationMenu";
import Image from 'next/image';

export default function ReservationLayout ( {children} : {children : React.ReactNode}){
    return (
      <main className="flex flex-row justify-between p-5">
        <div className="flex flex-col">
          <Image src={'/img/business_shiba.jpg'} 
          width={200}
          height={0}
          priority={true}
          alt="Product Picture"
          className='object-cover rounded-2xl'
          />
          <ReservationMenu />
          </div>
        {children}
      </main>  
    );
}