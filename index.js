
// Import necessary packages
import express from 'express';
import fetch from 'node-fetch';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Endpoint to convert image URL to embedded vector
app.post('/convert-image', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required.' });
    }

    try {
        // Fetch the image from the URL
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const buffer = await response.buffer(); // Get binary data

        // Convert buffer to base64 string
        const base64String = buffer.toString('base64');

        // Create an SVG string from the base64 string
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
            <image href="data:image/png;base64,${base64String}" width="100" height="100" />
        </svg>`;

        // Parse the SVG string into an SVG DOM
        const domParser = new DOMParser();
        const doc = domParser.parseFromString(svgString, 'image/svg+xml');

        // Serialize the SVG XML to a string
        const xmlSerializer = new XMLSerializer();
        const svgSerialized = xmlSerializer.serializeToString(doc);

        // Encode the SVG string to base64 for embedding
        const embeddedVector = `data:image/svg+xml;base64,${Buffer.from(svgSerialized).toString('base64')}`;

        // Return the embedded vector
        res.json({ embeddedVector });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to convert image.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
