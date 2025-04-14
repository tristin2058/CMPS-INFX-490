# OpenAI Chatbot

This project implements a chatbot using the OpenAI API. It provides a simple interface to interact with the chatbot through an Express server.

## Project Structure

```
openai-chatbot
├── src
│   ├── chatbot.js       # Contains the implementation of the OpenAI chatbot functionality.
│   └── server.js        # Sets up the Express server to handle incoming requests.
├── package.json          # Configuration file for npm, listing dependencies and scripts.
├── .env                  # Contains environment variables, including the OpenAI API key.
└── README.md             # Documentation for the project.
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd openai-chatbot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## Usage

Once the server is running, you can interact with the chatbot by sending requests to the defined endpoints. Use tools like Postman or curl to test the API.

### Example Request

```bash
curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```

### Example Response

```json
{
  "response": "Hello! How can I assist you today?"
}
```

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.