/**
 * Translates text using the MyMemory Translation API.
 * This is a free API that doesn't require a key for limited usage.
 */
export const translateText = async (text: string, to: string = 'bn'): Promise<string> => {
    try {
        if (!text) return '';

        // Encode the text properly
        const encodedText = encodeURIComponent(text);
        const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${to}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.responseStatus === 200) {
            return data.responseData.translatedText;
        } else {
            console.error('Translation API Error:', data.responseDetails);
            throw new Error(data.responseDetails || 'Translation failed');
        }
    } catch (error) {
        console.error('Translation service error:', error);
        throw error;
    }
};
