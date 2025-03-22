
import VenueCatalog from "@/components/VenueCatalog";
import getVenues from "@/libs/getVenues";
import { Suspense } from "react";
import { LinearProgress } from "@mui/material";
// import CardPanel from "@/components/CardPanel";

export default function Venue(){
    
    const venues : Promise<VenueJson> = getVenues();

    return(
        <main className="text-center p-5">
            <h1 className="text-xl font-bold">Venue :)</h1>
            <Suspense fallback={<p>Loading . . . <LinearProgress/></p>}>
                <VenueCatalog venuesJson={venues}/>
            </Suspense>

            {/* <h1>_________________________</h1> */}
            {/* <CardPanel/> */}

        </main>
    )
}