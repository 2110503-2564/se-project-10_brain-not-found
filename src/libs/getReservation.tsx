
export default async function getReservations(token :string) {
    const response = await fetch("https://project-sd-fronted-sub-backend.vercel.app/api/v1/reservations" , {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        },
        next : {tags:[`reservations`]}
    });

    if (!response.ok) {
      throw new Error("Failed to get all my reservation");
    }

    return await response.json();
}
