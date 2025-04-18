// Import the analyzeBadWords function
import { analyzeBadWords } from "./validateReview";

interface ReviewData {
    header: string;
    comment: string;
    rating: number;
}

interface ReviewResponse {
    success: boolean;
    data: any;
    message?: string;
}

export default async function createReview(token: string,shopId: string, reviewData: ReviewData): Promise<ReviewResponse | void> {
    // Analyze bad words in header and comment
    const headerAnalysis = analyzeBadWords(reviewData.header);
    const commentAnalysis = analyzeBadWords(reviewData.comment);

    if (headerAnalysis.hasBadWord || commentAnalysis.hasBadWord) {
        const badWordsList = [...headerAnalysis.badWordFound, ...commentAnalysis.badWordFound];
        alert(`Your review contains inappropriate language: ${badWordsList.join(", ")}. Please revise and try again.`);
        return; // Reject the submission
    }

    const response = await fetch(
        `${process.env.BACKEND_URL}/api/v1/shops/${shopId}/reviews/`,
        {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}