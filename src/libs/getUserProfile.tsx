
export default async function getUserProfile(token:string) {

    const response = await fetch("http://localhost:5000/api/v1/auth/me" , {
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