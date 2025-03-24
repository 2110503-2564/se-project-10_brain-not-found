import Image from 'next/image';
import InteractiveCard from './InteractiveCard';
import { Rating } from './Rating';

export default function Card( {shopName,desc, imgSrc, onCompare}
     : {shopName: string , imgSrc: string ,desc:string, onCompare?:Function}){

    return(
        <InteractiveCard contentName={shopName}>

            <div className='w-full h-[60%] relative rounded-t-lg'>
                <Image src={imgSrc}
                alt="Product Picture"
                fill={true}
                className='object-cover rounded-t-lg'
                />

            </div>
            <div className='w-full h-[20%] p-[10px]'>
                <h2 className="text-xl font-bold mb-2 text-black">{shopName}</h2>
                <p className="text-sm mb-2 text-black">{desc}</p>
            </div>

            {/* <Rating shopName={shopName.toString()} onCompare={onCompare}/> */}

            {
                onCompare?
                    <button className="block h-[10%] text-sm rounded-md bg-sky-600
                    hover:bg-indigo-600 mx-4 px-2 py-1 text-white"
                    onClick={(e)=>{e.stopPropagation(); e.preventDefault(); onCompare(shopName);} }
                    >Compare</button>
                : ''
            }
        </InteractiveCard>
    );
}
