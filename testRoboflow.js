import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load API key manually since we don't have dotenv installed in node scripts here
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VITE_ROBOFLOW_API_KEY=([^\r\n]+)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1] : null;

if (!API_KEY) {
  console.error("VITE_ROBOFLOW_API_KEY not found in .env");
  process.exit(1);
}

// 1x1 transparent PNG base64 for smoke testing
const testBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function runTest() {
  console.log("Running Roboflow Smoke Test (Standard API)...");
  // Coba versi 1 atau 2
  const endpoint = "https://detect.roboflow.com/trash-s8fg7-zvihw/1";

  try {
    const response = await fetch(`${endpoint}?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: testBase64
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`HTTP Error: ${response.status} - ${err}`);
      process.exit(1);
    }

    const data = await response.json();
    console.log("Success! Response received:");
    console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

runTest();
