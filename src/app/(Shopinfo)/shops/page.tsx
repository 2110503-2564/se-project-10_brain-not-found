
import getShops from "@/libs/getShops";
import { Suspense } from "react";
import { LinearProgress } from "@mui/material";
import MassageCatalogServer from "@/components/MassageCatalogServer";
import Footer from "@/components/Footer";
// import CardPanel from "@/components/CardPanel";

export default function shop(){
    
    const shops : Promise<ShopJson> = getShops();

    return(
        <main className="text-center p-5">
            
            <Suspense fallback={<p>Loading . . . <LinearProgress/></p>}>
                <MassageCatalogServer shopsJson={shops}/>
            </Suspense>
            
            <div className="pt-[100px] text-center">
                <Footer />
            </div>
        </main>
    )
}