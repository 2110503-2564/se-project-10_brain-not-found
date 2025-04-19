const loadBadWords = (): string[] => {
    const words = require("naughty-words");
    const words_en = words.en;
    const words_th = words.th;
    const words_en_th = words_en.concat(words_th);
    
    return words_en_th.map((word: string) => word.trim()).filter(Boolean);
};

export const analyzeBadWords = (input: string): { hasBadWord: boolean; badWordFound: string[] } => {
    const badWords = loadBadWords();
    const pattern = `\\b(${badWords.join("|")})\\b`;
    const regex = new RegExp(pattern, "gi");

    const matches = input.match(regex) || [];

    return {
        hasBadWord: matches.length > 0,
        badWordFound: matches,
    };
};
