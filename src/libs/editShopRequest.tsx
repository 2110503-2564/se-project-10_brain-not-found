export default async function editShopRequest(token: string,updateRequestData: RequestItemToCreateShop, requestId: string)
 {

    const response = await fetch(
        `${process.env.BACKEND_URL}/api/v1/requests/${requestId}`,
        {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateRequestData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}