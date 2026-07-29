import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─────────────────────────────────────────────────────────────
// Roboflow Object Detection API Handler
// Bertugas mendeteksi LOKASI sampah (Bounding Box) dalam gambar.
// BUKAN mengklasifikasikan jenisnya — itu tugas Cloudflare Llama.
// ─────────────────────────────────────────────────────────────

const ROBOFLOW_API_KEY = process.env.VITE_ROBOFLOW_API_KEY;
const ROBOFLOW_PROJECT  = 'trash-s8fg7-zvihw-1-yolo11n-t1';
const ROBOFLOW_VERSION  = '1';
const ROBOFLOW_ENDPOINT = `https://detect.roboflow.com/${ROBOFLOW_PROJECT}/${ROBOFLOW_VERSION}`;

interface RoboflowPrediction {
  x: number;         // center-X dalam gambar yang diproses Roboflow
  y: number;         // center-Y
  width: number;     // lebar kotak
  height: number;    // tinggi kotak
  confidence: number;
  class: string;     // label dari model (misal: "plastic_bottle", "cardboard")
}

interface RoboflowResponse {
  predictions: RoboflowPrediction[];
  image: { width: number; height: number }; // dimensi gambar yang diproses Roboflow
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  className: string;
  imageWidth: number;  // dimensi gambar yang diproses Roboflow (untuk scaling)
  imageHeight: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!ROBOFLOW_API_KEY) {
    console.error('[ROBOFLOW] API Key tidak dikonfigurasi di environment variables.');
    // Kembalikan null bounding box agar pipeline tetap jalan (fallback ke Cloudflare full-image)
    return res.status(200).json({ success: true, boundingBox: null, message: 'Roboflow API Key tidak dikonfigurasi, lanjut tanpa deteksi kotak.' });
  }

  const { image } = req.body;
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ success: false, error: 'Gambar tidak diterima.' });
  }

  try {
    // Roboflow menerima base64 langsung (tanpa prefix "data:image/jpeg;base64,")
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    console.log(`[ROBOFLOW] Mengirim gambar ke ${ROBOFLOW_PROJECT}/${ROBOFLOW_VERSION} untuk deteksi bounding box...`);

    const response = await fetch(
      `${ROBOFLOW_ENDPOINT}?api_key=${ROBOFLOW_API_KEY}&confidence=40&overlap=30`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: base64Data,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Roboflow API error ${response.status}: ${errorText}`);
    }

    const data: RoboflowResponse = await response.json();

    console.log(`[ROBOFLOW] Terdeteksi ${data.predictions?.length ?? 0} objek.`);

    // Tidak ada prediksi → fallback ke Cloudflare dengan gambar penuh
    if (!data.predictions || data.predictions.length === 0) {
      return res.status(200).json({
        success: true,
        boundingBox: null,
        message: 'Tidak ada objek terdeteksi oleh Roboflow, lanjut dengan gambar penuh.',
      });
    }

    // Pilih prediksi dengan confidence TERTINGGI sebagai target crop
    const best = data.predictions.reduce((prev, curr) =>
      curr.confidence > prev.confidence ? curr : prev
    );

    // Roboflow mengembalikan koordinat CENTER-based.
    // Konversi ke TOP-LEFT (format Canvas API) + tambahkan padding 8%
    const PADDING_RATIO = 0.08;
    const imgW = data.image.width;
    const imgH = data.image.height;

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

    console.log(`[ROBOFLOW] ✅ Bounding Box terbaik: class="${best.class}", confidence=${boundingBox.confidence}%, box=${JSON.stringify({ x: Math.round(boundingBox.x), y: Math.round(boundingBox.y), w: Math.round(boundingBox.width), h: Math.round(boundingBox.height) })}`);

    return res.status(200).json({ success: true, boundingBox });

  } catch (error: any) {
    // Jika terjadi error (network, API down, dll) → fallback gracefully
    console.error(`[ROBOFLOW ERROR] ${error.message}`);
    return res.status(200).json({
      success: true,
      boundingBox: null,
      message: `Roboflow error (fallback aktif): ${error.message}`,
    });
  }
}
