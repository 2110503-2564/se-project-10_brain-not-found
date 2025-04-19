
export default async function createReservation(
    { token, Data }:{ token:string , Data: Reservationbody }
) {
    console.log(Data)
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/shops/${Data.shop}/reservations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            reservationDate: Data.reservationDate,
            userId: Data.user,
            userName: Data.userName,
        }),
    });
    console.log("Request Body:", {
        reservationDate: Data.reservationDate,
        userId: Data.user,
        userName: Data.userName,
    });
    if (!response.ok) {
        throw new Error("Something went wrong in creating the reservation. : " + response);
    }

    return await response.json();
}