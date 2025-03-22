import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import  getUserProfile  from "@/libs/getUserProfile"

export default async function DashboardPage(){

    const session = await getServerSession(authOptions);
    if(!session || !session.user.token)return null;
    
    const profile = await getUserProfile(session.user.token);
    if(!profile)return null;

    var createdAt = new Date(profile.data.createdAt);
  

    return(
        <main className="bg-slate-500 m-5 p-5 rounded-lg">
            <div>
                {/* <h1 className="text-lg font-semibold text-red-500 mt-4">
                    {profile.data.name}</h1> */}
                <table className="table-auto border-separate border-spacing-2">
                    <tbody>
                        <tr>
                            <td>Name</td>
                            <td>{profile.data.name}</td>
                        </tr>
                        <tr>
                            <td>Email</td>
                            <td>{profile.data.email}</td>
                        </tr>
                        <tr>
                            <td>Tel.</td>
                            <td>{profile.data.tel}</td>
                        </tr>
                        <tr>
                            <td>Member Since</td>
                            <td>{createdAt.toString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    )
}