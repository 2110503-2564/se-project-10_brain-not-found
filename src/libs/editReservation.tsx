export default async function editReservation(
    reservationId: string,
    updateData: Partial<{
      reservationDate: Date;
      shop: string;
    }>,
    token: string
  ) {
    const response = await fetch(
      `https://project-sd-fronted-sub-backend.vercel.app/api/v1/reservations/${reservationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      }
    );
  
    if (!response.ok) {
      throw new Error("Something went wrong while updating the reservation");
    }
  
    return await response.json();
  }
  