
import Request from "@/components/Request" 
import getRequests from "@/libs/getRequests"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import shop from "../(Shopinfo)/shops/page";
import { redirect } from "next/navigation";
export default async function MyRequestPage(){
    const session = await getServerSession(authOptions);
    if (!session || !session.user.token) redirect('/');
    // const request= await getRequests(session.user.token);
    return(
        <main>
            <Request />
        </main>
    )
}