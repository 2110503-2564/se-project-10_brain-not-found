
// interface RequestItem {
//     shop: ShopItem;
//   _id: string;
//   user: User; // Changed type to User
//   createdAt: Date;
//   reason: string;
//   status: string;
// }

export default async function createShopRequest(token: string,RequestData: RequestItemToCreateShop)
 {

    const response = await fetch(
        `${process.env.BACKEND_URL}/api/v1/requests`,
        {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(RequestData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}