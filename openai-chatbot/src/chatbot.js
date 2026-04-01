import openai from './openai-client.js';

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
