const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Helper to fetch image as base64
async function urlToGenerativePart(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return {
        inlineData: {
            data: Buffer.from(response.data).toString("base64"),
            mimeType: response.headers['content-type'] || "image/jpeg",
        },
    };
}

const generateSeoData = async (imageUrl, productTitle) => {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            console.warn("GOOGLE_API_KEY missing. Skipping AI SEO generation.");
            return null;
        }

        if (!imageUrl) return null;

        // Use Gemini 1.5 Flash for fast, multimodal performance
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const imagePart = await urlToGenerativePart(imageUrl);

        const prompt = `
            Analyze this product image and the title "${productTitle}".
            Generate the following SEO data in valid JSON format:
            1. "altText": A descriptive alt text for accessibility (max 15 words).
            2. "metaDescription": A catchy, SEO-optimized meta description for an e-commerce listing (max 160 characters).
            3. "tags": An array of 5 relevant keywords.
            
            Return ONLY the JSON object. Do not include markdown formatting.
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("AI SEO Generation Error:", error.message);
        return null; // Fail gracefully
    }
};

module.exports = { generateSeoData };
