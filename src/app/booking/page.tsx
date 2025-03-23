import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import getShop from "@/libs/getShop";

export default async function Bookings ({ searchParams }: { searchParams: { shop: string } }){
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/api/auth/signin?callbackUrl=/booking'); // Redirect to sign-in if no session
      }

      const shopId = searchParams.shop;
      let shop;
    
      if (shopId) {
        shop = await getShop(shopId);
        if (!shop || !shop.data) {
          redirect('/shop');
        }
      }  else return;
      // else {
      //   shop = { data: null }
      // }

    return (
        <main className="w-[100%] flex flex-col items-center space-y-4 bg-slate-500 m-5 p-5 rounded-lg">
            <div className='text-xl font-medium'>Massagae Shop Reservaion</div>
             <BookingForm token={session.user.token} userId={session.user._id} shop={shop.data}/>
        </main>
    )
}