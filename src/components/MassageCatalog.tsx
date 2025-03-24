
import { revalidateTag } from "next/cache";
import Card from "./Card";
import Link from "next/link";


// const shopsJson : Promise<ShopJson> = getShops();

export default async function MassageCatalog({shopsJson} : {shopsJson:Promise<ShopJson>}){
    const shopJsonReady = await shopsJson
    console.log(shopJsonReady)
    revalidateTag('shops');
    return (
        <>
        Explore {shopJsonReady.count} Massage shop in catalog
        <div className="m-5 flex flex-row content-around justify-around flex-wrap">
                    {
                        shopJsonReady.data.map((ShopItem:ShopItem)=>
                        <Link href={`/shops/${ShopItem.id}`} 
                        className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8"
                         key={ShopItem.id}>
                        <Card shopName={ShopItem.name} imgSrc={ShopItem.picture??'/img/logo.png'} desc={ShopItem.desc}/>
                        </Link>
                        )
                    }

                </div>
        </>
    )

}
// https://drive.google.com/uc?export=view&id=
// https://drive.google.com/uc?export=view&id=1YromFFdLyvMox5vT0pxTG30WppFXKE9g