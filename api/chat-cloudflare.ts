import type { VercelRequest, VercelResponse } from '@vercel/node';

interface CFCredential { accountId: string; apiKey: string; }

let cfCredentials: CFCredential[] = [];
let currentCfIndex = 0;

function getCfCredentials(): CFCredential[] {
  if (cfCredentials.length > 0) return cfCredentials;
  
  if (process.env.VITE_CLOUDFLARE_CREDENTIALS) {
    try {
      const parsed = JSON.parse(process.env.VITE_CLOUDFLARE_CREDENTIALS);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cfCredentials = parsed;
        return cfCredentials;
      }
    } catch (e) {
      console.error(`\x1b[31m[AI BACKEND ERROR]\x1b[0m ❌ Gagal mem-parsing VITE_CLOUDFLARE_CREDENTIALS`);
    }
  }
  
  if (process.env.VITE_CLOUDFLARE_ACCOUNT_ID && process.env.VITE_CLOUDFLARE_API_KEY) {
    cfCredentials = [{
      accountId: process.env.VITE_CLOUDFLARE_ACCOUNT_ID,
      apiKey: process.env.VITE_CLOUDFLARE_API_KEY
    }];
  }
  return cfCredentials;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const creds = getCfCredentials();

  if (creds.length === 0) {
    return res.status(400).json({ error: "API Key Cloudflare belum diatur di .env" });
  }

  try {
    const { messages } = req.body || {};
    if (!messages) {
      return res.status(400).json({ error: "Messages tidak ditemukan." });
    }
    
    let cfResponse: any;
    let success = false;
    let attempt = 0;
    let lastErrorMsg = "";

    while (attempt < creds.length) {
      const cred = creds[currentCfIndex];
      const fetchUrl = `https://api.cloudflare.com/client/v4/accounts/${cred.accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
      
      cfResponse = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cred.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: messages, stream: true })
      });

      if (cfResponse.ok) {
        success = true;
        break;
      } else {
        const errorText = await cfResponse.text();
        lastErrorMsg = `[Akun ${currentCfIndex}] Status ${cfResponse.status}: ${errorText}`;
        console.warn(`\x1b[33m[AI BACKEND]\x1b[0m ⚠️ Kunci Chat ke-${currentCfIndex + 1} gagal (${cfResponse.status}). Merotasi kunci...`);
        currentCfIndex = (currentCfIndex + 1) % creds.length;
        attempt++;
      }
    }

    if (!success) {
      return res.status(cfResponse ? cfResponse.status : 500).send(lastErrorMsg);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (cfResponse.body) {
      // Vercel Serverless Function limits streaming time, but it should be enough for short chats
      const reader = cfResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error(`\x1b[31m[AI BACKEND ERROR]\x1b[0m ❌ Cloudflare Chat: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
}
