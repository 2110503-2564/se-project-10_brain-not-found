import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import getReservations from "@/libs/getReservation";
import getUserProfile from "@/libs/getUserProfile";
import UserProfile from "@/components/UserProfile";

export default async function About(){
    
    return (
        <main className="m-5">
            <div className="text-center text-bold text-4xl">Who am I ? ? ?</div>
            <UserProfile/>
            <div className="m-5">
                <div className="text-2xl">ShadowException</div>
                <div>Rattapoom Phonyiam   6733220021</div>
                <div>Tananan Narkchuay   6733102721</div>
                <div>Teerattapon Ngampongpun   6733114221</div>
            </div>
        </main>
    )
}