import Image from "next/image"
import getVenue from "@/libs/getShop"
import Link from "next/link"

export default async function VenueDetailPage({params} :
    {params: {mid: string}}
){
    const venueDetail = await getVenue(params.mid)
    console.log(venueDetail.data.picture);

    return(
        <main className="text-center p-5">
                <h1 className=" text-3xl font-bold">Massage Shop Detail</h1>
                <div className="flex flex-row my-5">
                    <Image 
                        src={(venueDetail.data.picture)}
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

                        <Link href={`/booking/?shops=${params.mid}`}>
                        <button className="block bg-blue-500 text-white rounded-md px-8 py-3 
                            hover:bg-blue-600 shadow-2xl"
                            name="Book Venue">
                                Make Booking
                            </button>
                        </Link>
                        
                    </div>
                </div>
        </main>
    )
}
