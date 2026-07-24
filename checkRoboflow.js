import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VITE_ROBOFLOW_API_KEY=([^\r\n]+)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1] : null;

async function checkProject() {
  const endpoint = `https://api.roboflow.com/namikaze-rainy/trash-s8fg7-zvihw?api_key=${API_KEY}`;
  
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}

checkProject();
