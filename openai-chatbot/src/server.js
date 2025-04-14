import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { chatWithGPT } from './chatbot.js';

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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});