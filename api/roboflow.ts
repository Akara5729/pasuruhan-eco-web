import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─────────────────────────────────────────────────────────────
// Roboflow Serverless Workflow API Handler
// Bertugas mendeteksi LOKASI sampah (Bounding Box) dalam gambar.
// ─────────────────────────────────────────────────────────────

const ROBOFLOW_API_KEY = process.env.VITE_ROBOFLOW_API_KEY;
const ROBOFLOW_ENDPOINT = `https://serverless.roboflow.com/namikaze-rainy/workflows/trash-s8fg7-zvihw`;

interface RoboflowPrediction {
  x: number;         // center-X
  y: number;         // center-Y
  width: number;     // lebar kotak
  height: number;    // tinggi kotak
  confidence: number;
  class: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  className: string;
  imageWidth: number;
  imageHeight: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!ROBOFLOW_API_KEY) {
    console.error('[ROBOFLOW] API Key tidak dikonfigurasi.');
    return res.status(200).json({ success: true, boundingBox: null, message: 'API Key tidak ada.' });
  }

  const { image } = req.body;
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ success: false, error: 'Gambar tidak diterima.' });
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    console.log(`[ROBOFLOW] Mengirim gambar ke Workflow Endpoint...`);

    const response = await fetch(ROBOFLOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: ROBOFLOW_API_KEY,
        inputs: {
          image: { type: "base64", value: base64Data }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Roboflow API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Struktur respons Workflow: data.outputs[0].predictions.predictions
    const workflowOutputs = data.outputs?.[0]?.predictions;
    const predictions: RoboflowPrediction[] = workflowOutputs?.predictions || [];
    
    console.log(`[ROBOFLOW] Terdeteksi ${predictions.length} objek dari Workflow.`);

    if (predictions.length === 0) {
      return res.status(200).json({
        success: true,
        boundingBox: null,
        message: 'Tidak ada objek terdeteksi.',
      });
    }

    // Pilih prediksi dengan confidence TERTINGGI
    const best = predictions.reduce((prev, curr) =>
      curr.confidence > prev.confidence ? curr : prev
    );

    // Jika Roboflow Workflow mengembalikan image width null, asumsikan 640 (karena frontend ngirim segitu via canvas)
    // Atau lebih baik kita kembalikan koordinat apa adanya (asli dari Workflow) 
    // lalu biarkan frontend mengatur aspect ratio-nya.
    const PADDING_RATIO = 0.08;
    const imgW = workflowOutputs?.image?.width || 640; 
    const imgH = workflowOutputs?.image?.height || 640;

    const padX = best.width  * PADDING_RATIO;
    const padY = best.height * PADDING_RATIO;

    const boundingBox: BoundingBox = {
      x:          Math.max(0,    (best.x - best.width  / 2) - padX),
      y:          Math.max(0,    (best.y - best.height / 2) - padY),
      width:      Math.min(imgW, best.width  + padX * 2),
      height:     Math.min(imgH, best.height + padY * 2),
      confidence: Math.round(best.confidence * 100),
      className:  best.class,
      imageWidth:  imgW,
      imageHeight: imgH,
    };

    console.log(`[ROBOFLOW] ✅ Bounding Box terbaik: class="${best.class}", confidence=${boundingBox.confidence}%`);

    return res.status(200).json({ success: true, boundingBox });

  } catch (error: any) {
    console.error(`[ROBOFLOW ERROR] ${error.message}`);
    return res.status(200).json({
      success: true,
      boundingBox: null,
      message: `Roboflow error: ${error.message}`,
    });
  }
}

