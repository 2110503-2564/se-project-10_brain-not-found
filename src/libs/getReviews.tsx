export default async function getReviews(shopId: string, page: number) {

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/shops/${shopId}/reviews?page=${page}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }
    
    return data;

}