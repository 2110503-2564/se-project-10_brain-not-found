
export default async function CreateReservation(token:string) {

    const response = await fetch("https://project-sd-fronted-sub-backend.vercel.app/api/v1/reservations" , {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if(!response){
        throw new Error("Something went wrong in create the reservation.");
    }
    
    return await response.json();

}