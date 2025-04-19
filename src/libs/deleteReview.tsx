export default async function deleteReview(
    { token, shopId, reviewId } : { token: string , shopId: string, reviewId:string}
) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/shop/${shopId}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Something went wrong in deleting the review: " + response.statusText);
    }

    return await response.json();
}