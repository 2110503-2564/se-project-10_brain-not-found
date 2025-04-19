
interface SingleShopItem {
    success: boolean;
    data: ShopItem;
}

export default async function getShop(id:string): Promise<SingleShopItem> {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/shops/${id}`  , {next : {tags:[`shops`]}})

    if(!response.ok){
        throw new Error("Failed to fetch Shop");
    }

    return await response.json();
}