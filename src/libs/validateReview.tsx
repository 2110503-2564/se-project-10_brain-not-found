import getReservation from "./getReservation"; // adjust the import path as needed

export interface ValidationResult {
    hasBadWord: boolean;
    badWordFound: string[];
    hasVisitedShop: boolean;
}

const loadBadWords = (): string[] => {
    // Using the "naughty-words" package for both English and Thai bad words
    const words = require("naughty-words");
    const words_en = words.en;
    const words_th = words.th;
    const words_en_th = words_en.concat(words_th);
    
    // The concatenated string is split by newline, trimmed, and filtered for non-empty values
    return words_en_th.split("\n").map((word: string) => word.trim()).filter(Boolean);
};

// Check for bad words and return details for a given input string.
export const analyzeBadWords = (input: string): { hasBadWord: boolean; badWordFound: string[] } => {
    const badWords = loadBadWords();
    // Create a regex that matches any of the bad words (case-insensitive, matching whole words only)
    const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "gi");

    // Match any bad words in the input
    const matches = input.match(regex) || [];

    return {
        hasBadWord: matches.length > 0,
        badWordFound: matches,
    };
};

/**
 * Validate a review by checking:
 *  1. The review header and comment for any inappropriate language.
 *  2. That the user has visited the shop, i.e. has a valid reservation where the booking time is in the past.
 *
 * @param token - The user's authentication token.
 * @param shopId - The shop ID being reviewed.
 * @param header - The review header text.
 * @param comment - The review comment text.
 * @returns An object with:
 *         - hasBadWord: true if any bad words are found.
 *         - badWordFound: an array of all detected bad words.
 *         - hasVisitedShop: true if the user has at least one reservation for the given shop and the reservation date has passed.
 */
export const validateReview = async(token: string, shopId: string, header: string, comment: string): Promise<ValidationResult> => {
    const headerAnalysis = analyzeBadWords(header);
    const commentAnalysis = analyzeBadWords(comment);

    // Combine detected bad words from header and comment.
    const combinedBadWords = [...headerAnalysis.badWordFound, ...commentAnalysis.badWordFound];
    const hasBadWord = combinedBadWords.length > 0;

    // Determine if the user has visited the shop by checking their reservations,
    // ensuring that the reservation time has occurred in the past.
    let hasVisitedShop = false;
    try {
        const reservationsResponse = await getReservation(token,shopId);
        if (reservationsResponse && Array.isArray(reservationsResponse.data)) {
        const now = new Date();
        hasVisitedShop = reservationsResponse.data.some((reservation: any) => {
            return (
                new Date(reservation.reservationDate) < now
            );
        });
        }
    } catch (error) {
        console.error("Error fetching reservations:", error);
        // In case of an error, assume the user hasn't visited the shop.
        hasVisitedShop = false;
    }

    return {
        hasBadWord,
        badWordFound: combinedBadWords,
        hasVisitedShop,
    };
};
