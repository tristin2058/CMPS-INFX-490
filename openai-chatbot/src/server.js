import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { chatWithGPT } from './chatbot.js';
import fs from 'fs/promises';
import pathModule from 'path';
import OpenAI from 'openai';

dotenv.config();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve the root directory (CMPS-INFX-490)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename), '../..'); // Go up to CMPS-INFX-490

// Serve static files from the root directory
app.use(express.static(__dirname));

// --- Simple local vector store for page code retrieval ---
const VECTOR_STORE_PATH = pathModule.join(__dirname, 'vector_store.json');
const EMBEDDING_MODEL = 'text-embedding-3-small';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
let VECTOR_STORE = null; // in-memory cache

async function fileListRecursive(dir, exts = ['.html', '.js', '.css']) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const ent of entries) {
        const full = pathModule.join(dir, ent.name);
        if (ent.isDirectory()) {
            if (ent.name === 'node_modules' || ent.name === '.git') continue;
            files.push(...await fileListRecursive(full, exts));
        } else {
            if (exts.includes(pathModule.extname(ent.name).toLowerCase())) files.push(full);
        }
    }
    return files;
}

function chunkText(text, maxChars = 1000) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        chunks.push(text.slice(start, start + maxChars));
        start += maxChars;
    }
    return chunks;
}

async function createEmbeddingsForFiles(rootDir) {
    // If vector store file exists, load and return
    try {
        const existing = await fs.readFile(VECTOR_STORE_PATH, 'utf8');
        VECTOR_STORE = JSON.parse(existing);
        console.log('Loaded existing vector store with', VECTOR_STORE.length, 'items');
        return;
    } catch (err) {
        // continue to create
    }

    const files = await fileListRecursive(rootDir);
    const store = [];
    for (const filePath of files) {
        try {
            const raw = await fs.readFile(filePath, 'utf8');
            const chunks = chunkText(raw, 1200);
            for (let i = 0; i < chunks.length; i++) {
                const text = `FILE: ${pathModule.relative(rootDir, filePath)}\nCHUNK_INDEX: ${i}\n` + chunks[i];
                // create embedding
                const resp = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: text });
                const embedding = resp.data[0].embedding;
                store.push({ id: `${filePath}#${i}`, file: pathModule.relative(rootDir, filePath), chunkIndex: i, text, embedding });
            }
        } catch (err) {
            console.warn('Failed reading/embedding', filePath, err.message);
        }
    }

    VECTOR_STORE = store;
    await fs.writeFile(VECTOR_STORE_PATH, JSON.stringify(VECTOR_STORE, null, 2), 'utf8');
    console.log('Created vector store with', VECTOR_STORE.length, 'items');
}

function cosineSim(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function retrieveRelevant(query, topK = 5) {
    if (!VECTOR_STORE || VECTOR_STORE.length === 0) return [];
    const embResp = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: query });
    const qEmb = embResp.data[0].embedding;
    const scored = VECTOR_STORE.map(item => ({ score: cosineSim(qEmb, item.embedding), item }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map(s => ({ score: s.score, text: s.item.text, file: s.item.file }));
}

// Start ingestion in background (root is two levels up from src)
createEmbeddingsForFiles(pathModule.resolve(__dirname, '..', '..')).catch(err => console.error('Ingest error', err));

// Helper to force re-ingestion (remove existing store and recreate)
async function reingestFiles(rootDir) {
    try {
        await fs.unlink(VECTOR_STORE_PATH).catch(() => {});
    } catch (e) {
        // ignore
    }
    await createEmbeddingsForFiles(rootDir);
}

// Reingest endpoint: POST /reingest
app.post('/reingest', async (req, res) => {
    try {
        await reingestFiles(pathModule.resolve(__dirname, '..', '..'));
        return res.json({ ok: true, items: VECTOR_STORE ? VECTOR_STORE.length : 0 });
    } catch (err) {
        console.error('Reingest error', err);
        return res.status(500).json({ error: err.message });
    }
});

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
        // Retrieve relevant page snippets and prepend as system context
        const lastUser = Array.isArray(messages) && messages.length ? messages[messages.length - 1].content : '';
        let retrieved = [];
        try { retrieved = await retrieveRelevant(lastUser, 6); } catch (e) { console.warn('Retrieval failed', e.message); }

        if (retrieved.length) {
            const snippets = retrieved.map(r => `--- ${r.file} (score: ${r.score.toFixed(3)})\n${r.text}`).join('\n\n');
            const systemMsg = { role: 'system', content: `The following page code snippets are relevant to this user query. Use them to inform answers.\n\n${snippets}` };
            const augmented = [systemMsg, ...messages];
            const response = await chatWithGPT(augmented);
            return res.json({ response });
        }

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