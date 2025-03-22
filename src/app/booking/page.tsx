import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import getVenue from "@/libs/getVenue";

export default async function Bookings ({ searchParams }: { searchParams: { shop: string } }){
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/api/auth/signin?callbackUrl=/booking'); // Redirect to sign-in if no session
      }
    // console.log("Session : : : "+ session);

      const venueId = searchParams.shop;
      let venue ;
    
      if (venueId) {
        venue = await getVenue(venueId);
        if (!venue || !venue.data) {
          redirect('/venue');
        }
      } else {
        venue = { data: null }
        // const venues = await getVenues();
        // if (venues.data && venues.data.length > 0) {
        //   venue = { data: venues.data[0] };
        // } else {
        //   redirect('/venue');
        // }
      }

    return (
        <main className="w-[100%] flex flex-col items-center space-y-4 bg-slate-500 m-5 p-5 rounded-lg">
            <div className='text-xl font-medium'>Venue Booking</div>
             <BookingForm userId={session.user._id} venue={venue.data}/>
        </main>
    )
}