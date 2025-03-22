
import Card from "./Card";
import Link from "next/link";

export default async function VenueCatalog({venuesJson} : {venuesJson:Promise<VenueJson>}){
    const venueJsonReady = await venuesJson
    console.log(venueJsonReady)
    return (
        <>
        Explore {venueJsonReady.count} Venues in catalog
        <div className="m-5 flex flex-row content-around justify-around flex-wrap">
                    {
                        venueJsonReady.data.map((VenueItem:VenueItem)=>
                        <Link href={`/venue/${VenueItem.id}`} className="w-1/5" key={VenueItem.id}>
                        <Card venueName={VenueItem.name} imgSrc={'/img/logo.png'}/>
                        </Link>
                        )
                    }

                </div>
        </>
    )

}