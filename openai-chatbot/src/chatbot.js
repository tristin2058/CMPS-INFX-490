// Import environment variables and OpenAI library
import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';

// Initialize OpenAI client with the API key from the .env file
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to communicate with OpenAI's GPT model
export async function chatWithGPT(messageHistory) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Specify the model to use
            messages: messageHistory, // Pass the conversation history
        });

        // Return the chatbot's response
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        throw error; // Rethrow the error for handling in the server
    }
}
