
interface SingleVenueItem {
    success: boolean;
    data: VenueItem;
  }

export default async function getVenue(id:string): Promise<SingleVenueItem> {
    const response = await fetch(`http://localhost:5000/api/v1/shops/${id}`)

    if(!response.ok){
        throw new Error("Failed to fetch venue");
    }

    return await response.json();
}