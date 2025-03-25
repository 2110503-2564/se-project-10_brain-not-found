import Image from "next/image"
import getVenue from "@/libs/getShop"
import Link from "next/link"
import BookingForm from "@/components/BookingForm";

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import getUserProfile from '@/libs/getUserProfile';
import dayjs from "dayjs";


export default async function ShopDetailPage({params} :
    {params: {mid: string}}
){

    const venueDetail = await getVenue(params.mid)
    const session = await getServerSession(authOptions);

    return(
        <main className="text-center p-5">
                <h1 className=" text-3xl font-bold">Massage Shop Detail</h1>
                <div className="flex flex-row my-5">
                    <Image 
                        src={(venueDetail.data.picture??'/img/logo.png')}
                        alt={venueDetail.data.name}
                        width={0} 
                        height={0} 
                        sizes="100vw"
                        className="roudned-lg w-[30%]"
                    />

                    <div className="text-md mx-5 block text-left ">
                        <div className="text-2xl font-bold">{venueDetail.data.name}</div>
            
                        <div>address : {venueDetail.data.address}</div>
                        <div>district : {venueDetail.data.district}</div>
                        <div>province : {venueDetail.data.province}</div>
                        <div>region : {venueDetail.data.region}</div>
                        <div>postal code : {venueDetail.data.postalcode}</div>
                        <div>tel : {venueDetail.data.tel}</div>
                        <div className="px-5 py-1">
                            <div> open time: {venueDetail.data.openTime}</div>
                            <div> close time: {venueDetail.data.closeTime}</div>
                         </div>
                        
                        <BookingForm session={ session } shop={venueDetail.data}></BookingForm>
                        
                    </div>
                </div>
        </main>
    )
}
