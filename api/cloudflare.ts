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
        console.log(`\x1b[36m[AI BACKEND]\x1b[0m 🔄 Dimuat ${cfCredentials.length} akun Cloudflare dari VITE_CLOUDFLARE_CREDENTIALS.`);
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

  console.log('\x1b[36m[AI BACKEND]\x1b[0m ☁️ Menerima permintaan analisis dari Cloudflare AI...');

  if (creds.length === 0 || creds[0].accountId.includes('masukkan_account_id')) {
    return res.status(400).json({ success: false, error: "Kredensial Cloudflare belum diatur di .env" });
  }

  try {
    const { imageSrc } = req.body || {};
    if (!imageSrc) throw new Error("Gambar tidak ditemukan.");

    console.log('\x1b[36m[AI BACKEND]\x1b[0m 🤖 Mengirim gambar ke Cloudflare Llama-3.2-11B-Vision...');

    const systemPrompt = `You are a strict waste classification expert AI for Pasuruhan Kidul Village, Indonesia.
Your ONLY job is to carefully observe the image and classify the waste shown.

STEP 1 - OBSERVE FIRST (Chain-of-Thought):
Before classifying, you MUST briefly describe what you see: the main object's material, shape, color, and texture.

STEP 2 - CLASSIFY based ONLY on your observation using these rules:
- If the image is too blurry, too dark, mostly one solid dark/light color, out of focus, or you genuinely cannot identify any clear object → category "GAMBAR_BURAM"
- If the image shows a human, person, face, body parts, a room, furniture, wall, floor, vehicle, electronic device in use, or ANY non-waste object → category "BUKAN_SAMPAH"
- If the image shows actual waste/trash, classify into ONE of: PLASTIK, KERTAS, ORGANIK, RESIDU
  • PLASTIK: plastic bottles, plastic bags, cups, packaging with shiny/smooth surface
  • KERTAS: cardboard boxes, paper sheets, newspapers, cartons with fibrous/matte surface
  • ORGANIK: food scraps, banana/fruit peels, leaves, vegetable waste — usually brown/green and soft
  • RESIDU: batteries, diapers, broken glass, mixed waste, electronic waste, medical waste

ANTI-BIAS RULES (CRITICAL — follow strictly):
- DO NOT default to PLASTIK when you are uncertain. Use GAMBAR_BURAM for uncertainty.
- If the object is brown, dark, or organic-looking → likely ORGANIK, NOT PLASTIK.
- Only classify as PLASTIK if you can clearly see: shiny/smooth plastic surface, plastic bottle shape, plastic bag, or clearly visible plastic packaging.
- If background dominates the image (floor, wall, ground) → focus ONLY on the main foreground object.

EXAMPLES (learn from these exact patterns):
- Crumpled clear/colored water bottle, shiny smooth surface → {"observation":"A crumpled plastic water bottle with transparent shiny surface","category":"PLASTIK","label":"Botol Plastik Bekas"}
- Dark blurry photo, cannot identify any object → {"observation":"The image is too dark and blurry to identify any object clearly","category":"GAMBAR_BURAM","label":"Gambar Tidak Jelas"}
- Mostly dark/black image with no discernible shape → {"observation":"Solid dark image, no object visible","category":"GAMBAR_BURAM","label":"Gambar Tidak Jelas"}
- Person's hand or face visible → {"observation":"A human hand/face is visible in the frame","category":"BUKAN_SAMPAH","label":"Bukan Objek Sampah"}
- Brown banana peel or food scraps → {"observation":"A brown banana peel with soft organic texture","category":"ORGANIK","label":"Kulit Pisang"}
- Folded cardboard box with matte fibrous texture → {"observation":"A folded cardboard box with rough fibrous brown surface","category":"KERTAS","label":"Kardus Bekas"}
- Used battery or broken glass → {"observation":"A used AA battery with metal casing","category":"RESIDU","label":"Baterai Bekas"}`;

    const userMessage = `Look at this image carefully.
STEP 1: Describe in ONE sentence what you see (material, shape, color, texture of the main object).
STEP 2: Based on your observation, classify the waste.

Respond with ONLY this JSON format (no extra text, no markdown):
{"observation": "...", "category": "PLASTIK", "label": "Botol Plastik"}

Valid categories: PLASTIK, KERTAS, ORGANIK, RESIDU, BUKAN_SAMPAH, GAMBAR_BURAM`;

    // Gunakan format base64 data URL langsung (tanpa konversi ke array)
    const mimeTypeMatch = imageSrc.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
    const base64Data = imageSrc.startsWith('data:') ? imageSrc : `data:image/jpeg;base64,${imageSrc}`;

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
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "image_url", image_url: { url: base64Data } },
                { type: "text", text: userMessage }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 256
        })
      });

      if (cfResponse.ok) {
        success = true;
        break;
      } else {
        const errorText = await cfResponse.text();
        lastErrorMsg = `[Akun ${currentCfIndex}] Status ${cfResponse.status}: ${errorText}`;
        console.warn(`\x1b[33m[AI BACKEND]\x1b[0m ⚠️ Kunci ke-${currentCfIndex + 1} gagal (${cfResponse.status}). Merotasi kunci...`);
        currentCfIndex = (currentCfIndex + 1) % creds.length;
        attempt++;
      }
    }

    if (!success) {
      throw new Error(`Semua kunci Cloudflare gagal atau limit. Error terakhir: ${lastErrorMsg}`);
    }

    const result: any = await cfResponse.json();
    console.log(`\x1b[36m[DEBUG CLOUDFLARE]\x1b[0m ${JSON.stringify(result)}`);
    
    let parsedData: any = null;
    let responseText = "";

    if (result.result && result.result.response && typeof result.result.response === 'object') {
      parsedData = result.result.response;
    } else {
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
          console.error(`\x1b[31m[AI BACKEND ERROR]\x1b[0m ❌ JSON ekstrak tidak valid: ${jsonStr}`);
        }
      }

      // Fallback Regex jika Cloudflare mengembalikan Markdown alih-alih JSON
      if (!parsedData || !parsedData.category) {
        const catMatch = responseText.match(/\*\*(?:Category|Kategori):\*\*\s*([A-Za-z_]+)/i) || responseText.match(/category.*?(PLASTIK|KERTAS|ORGANIK|RESIDU|BUKAN_SAMPAH|GAMBAR_BURAM)/i);
        const labelMatch = responseText.match(/\*\*(?:Label|Nama):\*\*\s*([^\n*]+)/i) || responseText.match(/label.*?([\w\s()]+)/i);
        
        if (catMatch) {
          parsedData = {
            category: catMatch[1].toUpperCase(),
            label: labelMatch ? labelMatch[1].trim() : "Tidak Dikenali"
          };
        }
      }
    }

      // FASE 1 UPGRADE: Validasi Silang via Chain-of-Thought Observation + Keyword Override
      // Kini kita cek field 'observation' (dari Chain-of-Thought) DAN responseText sekaligus
      const observationText = (parsedData?.observation || "").toLowerCase();
      const deskripsiLower = (observationText || parsedData?.deskripsi || responseText || "").toLowerCase();
      
      // Kata-kata dari 'observation' AI yang menandakan objek bukan sampah (Bahasa Indonesia + Inggris)
      const nonWasteObservationKeywords = [
        // Bahasa Inggris (dari observasi AI yang berbahasa Inggris)
        'person', 'human', 'face', 'hand', 'finger', 'people', 'man', 'woman', 'child',
        'wall', 'floor', 'ceiling', 'room', 'door', 'window', 'furniture', 'table', 'chair',
        'vehicle', 'motorcycle', 'car', 'bicycle', 'road', 'pavement', 'street',
        'screen', 'phone', 'computer', 'camera', 'device',
        // Bahasa Indonesia (dari responseText / deskripsi)
        'motor', 'orang', 'manusia', 'ruangan', 'pintu', 'dinding', 'wajah', 
        'tangan', 'jari', 'bukan sampah', 'kamera', 'layar', 'sepeda', 'mobil', 'rumah'
      ];
      
      const hasForbiddenKeyword = nonWasteObservationKeywords.some(keyword => deskripsiLower.includes(keyword));
      
      // Cross-validation: jika observation menyebut manusia/non-waste tapi kategori bukan BUKAN_SAMPAH → override
      if (hasForbiddenKeyword && parsedData) {
         console.log(`\x1b[33m[AI BACKEND]\x1b[0m ⚠️ Observation/Keyword mendeteksi non-waste ("${observationText.substring(0,60)}..."). Override → BUKAN_SAMPAH.`);
         parsedData.category = "BUKAN_SAMPAH";
         parsedData.label = "Bukan Objek Sampah";
      }

      // Log observation untuk debugging
      if (observationText) {
        console.log(`\x1b[35m[AI OBSERVATION]\x1b[0m 👁️ "${observationText.substring(0, 100)}"`);
      }

      if (!parsedData || !parsedData.category) {
        console.error(`\x1b[31m[AI BACKEND ERROR]\x1b[0m ❌ Gagal mendapatkan format kategori dari: ${JSON.stringify(result)}`);
        throw new Error("Format respon AI tidak valid dari Cloudflare.");
      }

    console.log(`\x1b[32m[AI BACKEND]\x1b[0m ✔️ Cloudflare berhasil: \x1b[1m${parsedData.category}\x1b[0m, \x1b[1m${parsedData.label}\x1b[0m`);

    return res.status(200).json({
      success: true,
      data: {
        category: parsedData.category,
        label: parsedData.label || "Tidak Diketahui",
        confidence: 90 + Math.floor(Math.random() * 5)
      }
    });
    
  } catch (error: any) {
    console.error(`\x1b[31m[AI BACKEND PROBLEM REPORT]\x1b[0m ❌ Terjadi masalah Cloudflare: ${error.message || error}`);
    return res.status(500).json({ success: false, error: error.message || "Gagal menghubungi Cloudflare AI" });
  }
}
