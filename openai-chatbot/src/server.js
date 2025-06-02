import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { chatWithGPT } from './chatbot.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve the root directory (CMPS-INFX-490)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename), '../..'); // Go up to CMPS-INFX-490

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve sign-in.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'sign-in.html'));
});

// Parse JSON request bodies
app.use(bodyParser.json());

// Chat endpoint
app.post('/chat', async (req, res) => {
    const { messages } = req.body;

    try {
        const response = await chatWithGPT(messages);
        res.json({ response });
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        res.status(500).json({ error: 'Failed to communicate with OpenAI' });
    }
});

// Proxy endpoint for API Ninjas exercise API
app.get('/api/exercises', async (req, res) => {
    const apiUrl = 'https://api.api-ninjas.com/v1/exercises';
    const params = new URLSearchParams(req.query).toString();
    const url = `${apiUrl}?${params}`;

    try {
        const response = await fetch(url, {
            headers: { 'X-Api-Key': process.env.API_NINJAS_KEY }
        });
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch exercises' });
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Server error fetching exercises' });
    }
});

// Proxy endpoint for USDA FoodData Central API
app.get('/api/foodsearch', async (req, res) => {
    const query = req.query.query;
    if (!query) return res.status(400).json({ error: "Missing query parameter" });

    const apiUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${process.env.USDA_API_KEY}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch food data' });
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error fetching USDA food data:", error);
        res.status(500).json({ error: "Failed to fetch food data" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});