
export default async function getUserProfile(token:string) {

    const response = await fetch("https://project-sd-fronted-sub-backend.vercel.app/api/v1/auth/me" , {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if(!response){
        throw new Error("Something went wrong in getting user profile");
    }
    
    return await response.json();

}