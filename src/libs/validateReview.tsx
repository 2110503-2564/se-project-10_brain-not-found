const loadBadWords = (): string[] => {

    var words = require("naughty-words");
    var words_en = words.en;
    var words_th = words.th;
    var words_en_th = words_en.concat(words_th);
    
    return words_en_th.split("\n").map((word: string) => word.trim());
};

// Check for bad words and return details
export const analyzeBadWords = (input: string): { hasBadWord: boolean; badWordFound: string[] } => {
    const badWords = loadBadWords();
    const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "gi");

    // Match any bad words in the input
    const matches = input.match(regex) || [];

    return {
        hasBadWord: matches.length > 0,
        badWordFound: matches, // List of bad words found in the input
    };
};
