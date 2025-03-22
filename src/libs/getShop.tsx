
interface SingleShopItem {
    success: boolean;
    data: ShopItem;
  }

export default async function getShop(id:string): Promise<SingleShopItem> {
    const response = await fetch(`https://project-sd-fronted-sub-backend.vercel.app/api/v1/shops/${id}`)

    if(!response.ok){
        throw new Error("Failed to fetch Shop");
    }

    return await response.json();
}