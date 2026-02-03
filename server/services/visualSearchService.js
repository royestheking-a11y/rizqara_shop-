const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const jpeg = require('jpeg-js');
const axios = require('axios');

let model = null;

// Load Model (Singleton)
const loadModel = async () => {
    if (!model) {
        console.log("Loading MobileNet model...");
        try {
            model = await mobilenet.load({ version: 2, alpha: 1.0 });
            console.log("MobileNet model loaded.");
        } catch (error) {
            console.error("Error loading MobileNet:", error);
        }
    }
    return model;
};

// Decode image from buffer/URL for Tensor
const decodeImage = async (imageSource) => {
    let buffer;

    if (Buffer.isBuffer(imageSource)) {
        buffer = imageSource;
    } else if (typeof imageSource === 'string' && imageSource.startsWith('http')) {
        // Fetch from URL
        const response = await axios.get(imageSource, { responseType: 'arraybuffer' });
        buffer = Buffer.from(response.data);
    } else {
        throw new Error("Invalid image source");
    }

    // Decode JPEG
    // Note: jpeg-js returns { width, height, data } where data is a Uint8Array [r, g, b, a, ...]
    const decoded = jpeg.decode(buffer, { useTArray: true });

    // Convert to Tensor 3D [height, width, channels]
    // We drop the alpha channel to get 3 channels (RGB) which MobileNet expects
    const numChannels = 3;
    const numPixels = decoded.width * decoded.height;
    const values = new Int32Array(numPixels * numChannels);

    for (let i = 0; i < numPixels; i++) {
        for (let c = 0; c < numChannels; c++) {
            values[i * numChannels + c] = decoded.data[i * 4 + c];
        }
    }

    return tf.tensor3d(values, [decoded.height, decoded.width, numChannels]);
};

// Generate Vector
const getVector = async (imageSource) => {
    const model = await loadModel();
    if (!model) return null;

    try {
        const tensor = await decodeImage(imageSource);
        const embeddings = await model.infer(tensor, true); // true = embedding mode (no classification)

        // Cleanup tensor to prevent memory leaks
        tensor.dispose();

        // Return plain array
        return embeddings.arraySync()[0];
    } catch (error) {
        console.error("Vector generation error:", error);
        return null;
    }
};

// Cosine Similarity
const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

module.exports = { getVector, cosineSimilarity };
