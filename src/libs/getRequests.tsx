export default async function getRequests(token :string) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/requests` , {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        },
        next : {tags:[`requests`]}
    });

    if (!response.ok) {
      throw new Error("Failed to get all my request");
    }

    return await response.json();
}