import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VITE_ROBOFLOW_API_KEY=([^\r\n]+)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1] : null;

async function testFetch() {
  const endpoint = `https://detect.roboflow.com/trash-s8fg7-zvihw/1?api_key=${API_KEY}`;
  
  // base64 image containing '+'
  const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: b64
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch(e) {
    console.error(e);
  }
}
testFetch();
