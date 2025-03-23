import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import getReservations from "@/libs/getReservation";

export default async function About(){

    const session = await getServerSession(authOptions);

    const result = await getReservations(token: session?.user.token);
    
    return (
        <main>
            <div>Who am I ? ? ?</div>
            <div>ShadowException</div>
            <div>Rattapoom Phonyiam   6733220021</div>
            <div>Tananan Narkchuay   6733102721</div>
            <div>Teerattapon Ngampongpun   6733114221</div>
        </main>
    )
}