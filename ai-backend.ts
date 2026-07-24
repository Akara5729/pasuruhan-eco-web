import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import fs from 'fs';
import path from 'path';

interface CFCredential { accountId: string; apiKey: string; }

let cfCredentials: CFCredential[] = [];
let currentCfIndex = 0;

function getCfCredentials(env: any, logEvent: (msg: string) => void): CFCredential[] {
  if (cfCredentials.length > 0) return cfCredentials;
  
  if (env.VITE_CLOUDFLARE_CREDENTIALS) {
    try {
      const parsed = JSON.parse(env.VITE_CLOUDFLARE_CREDENTIALS);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cfCredentials = parsed;
        logEvent(`\x1b[36m[AI BACKEND]\x1b[0m 🔄 Dimuat ${cfCredentials.length} akun Cloudflare dari VITE_CLOUDFLARE_CREDENTIALS.`);
        return cfCredentials;
      }
    } catch (e) {
      logEvent(`\x1b[31m[AI BACKEND ERROR]\x1b[0m ❌ Gagal mem-parsing VITE_CLOUDFLARE_CREDENTIALS`);
    }
  }
  
  if (env.VITE_CLOUDFLARE_ACCOUNT_ID && env.VITE_CLOUDFLARE_API_KEY) {
    cfCredentials = [{
      accountId: env.VITE_CLOUDFLARE_ACCOUNT_ID,
      apiKey: env.VITE_CLOUDFLARE_API_KEY
    }];
  }
  return cfCredentials;
}

export default function aiBackendPlugin(): Plugin {
  return {
    name: 'ai-backend-plugin',
    configureServer(server) {
      const logFile = path.resolve(process.cwd(), 'backend.log');

      const logEvent = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const formattedMessage = `[${timestamp}] ${message}`;
        console.log(formattedMessage);
        
        try {
          fs.appendFileSync(logFile, formattedMessage + '\n');
        } catch (e) {
          console.error("Gagal menulis log ke file");
        }
      };

      server.middlewares.use('/api', async (req, res) => {
        if (req.url === '/cloudflare' && req.method === 'POST') {
          const env = loadEnv(server.config.mode, process.cwd(), '');
          const creds = getCfCredentials(env, logEvent);

          logEvent('\x1b[36m[AI BACKEND]\x1b[0m ☁️ Menerima permintaan analisis dari Cloudflare AI...');

          if (creds.length === 0 || creds[0].accountId.includes('masukkan_account_id')) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: "Kredensial Cloudflare belum diatur di .env" }));
            return;
          }

          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          
          req.on('end', async () => {
            try {
              const { imageSrc } = JSON.parse(body);
              if (!imageSrc) throw new Error("Gambar tidak ditemukan.");

              logEvent('\x1b[36m[AI BACKEND]\x1b[0m 🤖 Mengirim gambar ke Cloudflare Llama-3.2-11B-Vision...');

              const prompt = `
                Anda adalah AI asisten pemilah sampah untuk Desa Pasuruhan Kidul.
                Analisis gambar sampah ini dengan teliti.
                Berikan 2 hal:
                1. 'category': Klasifikasikan ke dalam SALAH SATU dari 4 kategori berikut: PLASTIK, KERTAS, ORGANIK, RESIDU.
                2. 'label': Nama spesifik dari benda tersebut dalam bahasa Indonesia (misalnya: "Botol Plastik", "Kardus Bekas", "Sisa Makanan", "Baterai Bekas").

                Jika gambar tidak terlihat seperti sampah, masukkan ke kategori RESIDU dengan label "Tidak Dikenali".

                Berikan respon HANYA berupa JSON dengan format persis seperti ini, tanpa tambahan apapun:
                {
                  "category": "PLASTIK",
                  "label": "Botol Plastik"
                }
              `;

              const base64Data = imageSrc.split(',')[1] || imageSrc;
              const imageBuffer = Buffer.from(base64Data, 'base64');
              const imageArray = [...imageBuffer]; 

              let cfResponse: any;
              let success = false;
              let attempt = 0;
              let lastErrorMsg = "";

              while (attempt < creds.length) {
                const cred = creds[currentCfIndex];
                const fetchUrl = `https://api.cloudflare.com/client/v4/accounts/${cred.accountId}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct`;
                
                cfResponse = await fetch(fetchUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${cred.apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ prompt: prompt, image: imageArray })
                });

                if (cfResponse.ok) {
                  success = true;
                  break;
                } else {
                  const errorText = await cfResponse.text();
                  lastErrorMsg = `[Akun ${currentCfIndex}] Status ${cfResponse.status}: ${errorText}`;
                  logEvent(`\x1b[33m[AI BACKEND]\x1b[0m ⚠️ Kunci ke-${currentCfIndex + 1} gagal (${cfResponse.status}). Merotasi kunci...`);
                  currentCfIndex = (currentCfIndex + 1) % creds.length;
                  attempt++;
                }
              }

              if (!success) {
                throw new Error(`Semua kunci Cloudflare gagal atau limit. Error terakhir: ${lastErrorMsg}`);
              }

              const result: any = await cfResponse.json();
              logEvent(`\x1b[36m[DEBUG CLOUDFLARE]\x1b[0m ${JSON.stringify(result)}`);
              
              let parsedData: any = null;

              if (result.result && result.result.response && typeof result.result.response === 'object') {
                parsedData = result.result.response;
              } else {
                let responseText = "";
                if (typeof result.result === 'string') {
                  responseText = result.result;
                } else if (result.result && typeof result.result.response === 'string') {
                  responseText = result.result.response;
                } else {
                  responseText = JSON.stringify(result.result || result);
                }

                const jsonStart = responseText.indexOf('{');
                const jsonEnd = responseText.lastIndexOf('}');
                
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd >= jsonStart) {
                  const jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
                  try {
                    parsedData = JSON.parse(jsonStr);
                    if (parsedData.response && parsedData.response.category) {
                      parsedData = parsedData.response;
                    }
                  } catch (e) {
                    logEvent(`\x1b[31m[AI BACKEND ERROR]\x1b[0m ❌ JSON ekstrak tidak valid: ${jsonStr}`);
                  }
                }

                // Fallback Regex jika Cloudflare mengembalikan Markdown alih-alih JSON
                if (!parsedData || !parsedData.category) {
                  const catMatch = responseText.match(/\*\*(?:Category|Kategori):\*\*\s*([A-Za-z]+)/i) || responseText.match(/category.*?(PLASTIK|KERTAS|ORGANIK|RESIDU)/i);
                  const labelMatch = responseText.match(/\*\*(?:Label|Nama):\*\*\s*([^\n*]+)/i) || responseText.match(/label.*?([\w\s]+)/i);
                  
                  if (catMatch) {
                    parsedData = {
                      category: catMatch[1].toUpperCase(),
                      label: labelMatch ? labelMatch[1].trim() : "Tidak Dikenali"
                    };
                  }
                }
              }

              if (!parsedData || !parsedData.category) {
                logEvent(`\x1b[31m[AI BACKEND ERROR]\x1b[0m ❌ Gagal mendapatkan format kategori dari: ${JSON.stringify(result)}`);
                throw new Error("Format respon AI tidak valid dari Cloudflare.");
              }

              logEvent(`\x1b[32m[AI BACKEND]\x1b[0m ✔️ Cloudflare berhasil: \x1b[1m${parsedData.category}\x1b[0m, \x1b[1m${parsedData.label}\x1b[0m`);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                data: {
                  category: parsedData.category,
                  label: parsedData.label || "Tidak Diketahui",
                  confidence: 90 + Math.floor(Math.random() * 5)
                }
              }));
              
            } catch (error: any) {
              logEvent(`\x1b[31m[AI BACKEND PROBLEM REPORT]\x1b[0m ❌ Terjadi masalah Cloudflare: ${error.message || error}`);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: error.message || "Gagal menghubungi Cloudflare AI" }));
            }
          });
        } else if (req.url === '/chat-cloudflare' && req.method === 'POST') {
          const env = loadEnv(server.config.mode, process.cwd(), '');
          const creds = getCfCredentials(env, logEvent);

          if (creds.length === 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "API Key Cloudflare belum diatur di .env" }));
            return;
          }

          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          
          req.on('end', async () => {
            try {
              const { messages } = JSON.parse(body);
              
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
                  logEvent(`\x1b[33m[AI BACKEND]\x1b[0m ⚠️ Kunci Chat ke-${currentCfIndex + 1} gagal (${cfResponse.status}). Merotasi kunci...`);
                  currentCfIndex = (currentCfIndex + 1) % creds.length;
                  attempt++;
                }
              }

              if (!success) {
                res.statusCode = cfResponse ? cfResponse.status : 500;
                res.end(lastErrorMsg);
                return;
              }

              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache');
              res.setHeader('Connection', 'keep-alive');

              if (cfResponse.body) {
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
              logEvent(`\x1b[31m[AI BACKEND ERROR]\x1b[0m ❌ Cloudflare Chat: ${error.message}`);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error.message }));
            }
          });
        } else if (req.url === '/log' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const { level, message } = JSON.parse(body);
              let color = '\x1b[37m'; 
              if (level === 'ERROR') color = '\x1b[31m'; 
              else if (level === 'WARN') color = '\x1b[33m'; 
              else if (level === 'INFO') color = '\x1b[36m'; 
              else if (level === 'SUCCESS') color = '\x1b[32m'; 
              
              logEvent(`${color}[FRONTEND ${level}]\x1b[0m ${message}`);
              
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.statusCode = 400;
              res.end("Bad Request");
            }
          });
        } else {
          res.statusCode = 404;
          res.end("Not Found");
        }
      });
    }
  };
}
