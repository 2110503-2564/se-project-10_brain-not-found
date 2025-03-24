
import shopCatalog from "@/components/MassageCatalog";
import getShops from "@/libs/getShops";
import { Suspense } from "react";
import { LinearProgress } from "@mui/material";
import MassageCatalog from "@/components/MassageCatalog";
// import CardPanel from "@/components/CardPanel";

export default function shop(){
    
    const shops : Promise<ShopJson> = getShops();

    return(
        <main className="text-center p-5">
            <h1 className="text-xl font-bold">Massage Shops :</h1>
            <Suspense fallback={<p>Loading . . . <LinearProgress/></p>}>
                <MassageCatalog shopsJson={shops}/>
            </Suspense>

            {/* <h1>_________________________</h1> */}
            {/* <CardPanel/> */}

        </main>
    )
}