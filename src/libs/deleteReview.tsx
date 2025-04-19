// src/libs/deleteReview.tsx
export default async function deleteReview(
    { token, shopId, reviewId } : { token: string , shopId: string, reviewId:string}
) {
    // Corrected URL: Changed 'shop' to 'shops'
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/shops/${shopId}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        // Attempt to get more specific error from response body if possible
        let errorMessage = `Something went wrong in deleting the review: ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (e) {
            // Ignore if response body is not JSON or empty
        }
        throw new Error(errorMessage);
    }

    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
    } else {
        // Handle cases where DELETE might return no content (204 No Content)
        // or non-JSON content successfully
        return { success: true, message: "Review deleted successfully" }; // Or return null/void as appropriate
    }
}
