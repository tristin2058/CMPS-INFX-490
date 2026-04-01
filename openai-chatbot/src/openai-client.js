import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');

dotenv.config({ path: envPath });

const openaiApiKey = process.env.OPENAI_API_KEY;
console.log(`OpenAI API key loaded: ${Boolean(openaiApiKey)}`);
if (!openaiApiKey) {
  throw new Error(`Missing OPENAI_API_KEY in ${envPath}. Please add a valid key from https://platform.openai.com/account/api-keys`);
}

const openai = new OpenAI({ apiKey: openaiApiKey });
export default openai;
