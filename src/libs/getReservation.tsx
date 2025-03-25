
export default async function getReservation(token :string , id :string) {
    const response = await fetch(`https://project-sd-fronted-sub-backend.vercel.app/api/v1/reservations/${id}` , {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        },
        next : {tags:[`reservations`]}
    });

    if (!response.ok) {
      throw new Error("Failed to get my reservation");
    }

    return await response.json();
}
