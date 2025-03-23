export default async function deleteReservation(
    { token, reservationId } : { token: string , reservationId: string}
) {
    const response = await fetch(`https://project-sd-fronted-sub-backend.vercel.app/api/v1/reservations/${reservationId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Something went wrong in deleting the reservation: " + response.statusText);
    }

    return await response.json();
}