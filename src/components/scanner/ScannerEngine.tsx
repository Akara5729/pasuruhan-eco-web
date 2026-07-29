import React, { useState, useRef, useCallback } from 'react';
import { Camera, Image as ImageIcon, RotateCcw, Sparkles } from 'lucide-react';
import { logToServer } from '../../services/remoteLogger';

interface ScannerEngineProps {
  onAnalyze: (imageSrc: string) => void;
}

// ─────────────────────────────────────────────
// FASE 2: Image Preprocessing Pipeline
// ─────────────────────────────────────────────

const TARGET_SIZE = 640; // Ukuran optimal untuk model Llama Vision

/**
 * Auto-Contrast Enhancement via Histogram Stretching.
 * Memperjelas perbedaan terang/gelap agar tekstur objek lebih terlihat AI.
 */
const applyAutoContrast = (imageData: ImageData): ImageData => {
  const data = imageData.data;
  let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;

  // Pass 1: cari nilai min & max per channel
  for (let i = 0; i < data.length; i += 4) {
    if (data[i]   < minR) minR = data[i];   if (data[i]   > maxR) maxR = data[i];
    if (data[i+1] < minG) minG = data[i+1]; if (data[i+1] > maxG) maxG = data[i+1];
    if (data[i+2] < minB) minB = data[i+2]; if (data[i+2] > maxB) maxB = data[i+2];
  }

  const rangeR = maxR - minR || 1;
  const rangeG = maxG - minG || 1;
  const rangeB = maxB - minB || 1;

  // Pass 2: stretch histogram ke 0-255
  for (let i = 0; i < data.length; i += 4) {
    data[i]   = Math.round(((data[i]   - minR) / rangeR) * 255);
    data[i+1] = Math.round(((data[i+1] - minG) / rangeG) * 255);
    data[i+2] = Math.round(((data[i+2] - minB) / rangeB) * 255);
  }

  return imageData;
};

/**
 * Preprocessing untuk gambar dari KAMERA:
 * 1. ROI Crop: ambil kotak tengah dari frame (area yang ada di scanner box)
 * 2. Resize ke TARGET_SIZE x TARGET_SIZE
 * 3. Auto-Contrast Enhancement
 */
const preprocessCameraImage = (rawImageSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext('2d')!;

      // ROI Crop: ambil square tengah dari frame kamera
      // Ini mensimulasikan crop pada area scanner box yang terlihat user
      const srcSize = Math.min(img.width, img.height);
      const srcX = (img.width - srcSize) / 2;
      const srcY = (img.height - srcSize) / 2;

      // Gambar langsung crop + scale ke TARGET_SIZE
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, TARGET_SIZE, TARGET_SIZE);

      // Terapkan auto-contrast
      const imageData = ctx.getImageData(0, 0, TARGET_SIZE, TARGET_SIZE);
      ctx.putImageData(applyAutoContrast(imageData), 0, 0);

      logToServer('INFO', `[ScannerEngine] Kamera: ROI crop (${srcSize}x${srcSize} dari ${img.width}x${img.height}) → ${TARGET_SIZE}x${TARGET_SIZE} + contrast`);
      console.log(`\x1b[36m[PREPROCESS]\x1b[0m 📷 Kamera: ROI crop (${srcSize}x${srcSize} dari ${img.width}x${img.height}) → ${TARGET_SIZE}x${TARGET_SIZE} + contrast`);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = rawImageSrc;
  });
};

/**
 * Preprocessing untuk gambar dari GALERI:
 * 1. Resize agar muat dalam TARGET_SIZE x TARGET_SIZE (aspect ratio tetap)
 * 2. Pad sisa area dengan putih agar canvas penuh
 * 3. Auto-Contrast Enhancement
 */
const preprocessGalleryImage = (rawImageSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext('2d')!;

      // Latar belakang putih (agar AI tidak bingung dengan padding hitam)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

      // Hitung scale agar gambar muat di dalam kotak (letterbox/pillarbox)
      const scale = Math.min(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
      const scaledW = Math.round(img.width * scale);
      const scaledH = Math.round(img.height * scale);
      const offsetX = Math.round((TARGET_SIZE - scaledW) / 2);
      const offsetY = Math.round((TARGET_SIZE - scaledH) / 2);

      ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);

      // Terapkan auto-contrast
      const imageData = ctx.getImageData(0, 0, TARGET_SIZE, TARGET_SIZE);
      ctx.putImageData(applyAutoContrast(imageData), 0, 0);

      logToServer('INFO', `[ScannerEngine] Galeri: scale ${img.width}x${img.height} → ${scaledW}x${scaledH} + contrast`);
      console.log(`\x1b[36m[PREPROCESS]\x1b[0m 🖼️ Galeri: scale ${img.width}x${img.height} → ${scaledW}x${scaledH} (offset ${offsetX},${offsetY}) + contrast`);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = rawImageSrc;
  });
};

// ─────────────────────────────────────────────
// ROBOFLOW: Smart Bounding Box Crop
// Langkah 1 dari Two-Stage Pipeline:
// Kirim gambar ke Roboflow → dapatkan koordinat sampah → crop.
// Jika gagal/kosong → fallback ke preprocessing lama (center crop / letterbox).
// ─────────────────────────────────────────────

interface BoundingBox {
  x: number; y: number; width: number; height: number;
  confidence: number; className: string;
  imageWidth: number; imageHeight: number;
}

/**
 * Menghubungi /api/roboflow untuk mendapatkan lokasi sampah (Bounding Box).
 * Mengembalikan BoundingBox | null.
 * TIDAK PERNAH throw — error selalu menghasilkan null (fallback aktif).
 */
const getRoboflowBoundingBox = async (rawImageSrc: string): Promise<BoundingBox | null> => {
  try {
    const response = await fetch('/api/roboflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: rawImageSrc }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.boundingBox ?? null;
  } catch {
    return null;
  }
};

/**
 * Langkah 2 dari Two-Stage Pipeline:
 * Crop gambar asli menggunakan Bounding Box dari Roboflow,
 * skalakan koordinat dari ruang Roboflow ke ruang gambar asli,
 * lalu resize ke TARGET_SIZE + auto-contrast.
 */
const cropAndPreprocessWithBBox = (rawImageSrc: string, bbox: BoundingBox): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Skala koordinat dari dimensi gambar yang diproses Roboflow ke gambar asli
      const scaleX = img.width  / bbox.imageWidth;
      const scaleY = img.height / bbox.imageHeight;

      const cropX = bbox.x      * scaleX;
      const cropY = bbox.y      * scaleY;
      const cropW = bbox.width  * scaleX;
      const cropH = bbox.height * scaleY;

      const canvas = document.createElement('canvas');
      canvas.width  = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext('2d')!;

      // Latar belakang putih agar area padding tidak hitam
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

      // Gambar crop dari bounding box ke canvas TARGET_SIZE
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, TARGET_SIZE, TARGET_SIZE);

      // Terapkan auto-contrast
      const imageData = ctx.getImageData(0, 0, TARGET_SIZE, TARGET_SIZE);
      ctx.putImageData(applyAutoContrast(imageData), 0, 0);

      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = rawImageSrc;
  });
};

// ─────────────────────────────────────────────
// FASE 3: Blur Detection (Variance of Laplacian)
// ─────────────────────────────────────────────

// Threshold: nilai di bawah ini dianggap gambar terlalu buram
const BLUR_THRESHOLD_CAMERA = 45;  // Ketat — kamera bisa difoto ulang
const BLUR_THRESHOLD_GALLERY = 18; // Longgar — foto dari galeri tidak bisa diubah

/**
 * Menghitung skor ketajaman gambar menggunakan Variance of Laplacian.
 * Nilai tinggi = gambar tajam. Nilai rendah = gambar buram.
 * Menggunakan sampling setiap 3px untuk performa yang baik di HP.
 */
const computeBlurScore = (imageData: ImageData): number => {
  const { data, width, height } = imageData;
  const laplacianValues: number[] = [];
  const step = 3; // Sampling setiap 3 piksel (tradeoff kecepatan vs akurasi)

  for (let y = step; y < height - step; y += step) {
    for (let x = step; x < width - step; x += step) {
      // Konversi ke grayscale menggunakan bobot persepsi manusia
      const toGray = (px: number) => {
        const i = px * 4;
        return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      };

      const center = toGray(y * width + x);
      const top    = toGray((y - step) * width + x);
      const bottom = toGray((y + step) * width + x);
      const left   = toGray(y * width + (x - step));
      const right  = toGray(y * width + (x + step));

      // Laplacian kernel: [0,1,0],[1,-4,1],[0,1,0]
      const lap = top + bottom + left + right - 4 * center;
      laplacianValues.push(lap);
    }
  }

  // Hitung varians dari nilai Laplacian
  const mean = laplacianValues.reduce((a, b) => a + b, 0) / laplacianValues.length;
  const variance = laplacianValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / laplacianValues.length;
  return Math.round(variance);
};

/**
 * Cek apakah gambar terlalu buram menggunakan canvas.
 * Mengembalikan { score, isBlurry }.
 */
const checkImageBlur = (rawImageSrc: string, threshold: number): Promise<{ score: number; isBlurry: boolean }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Pakai ukuran kecil untuk performa deteksi (320px cukup untuk blur check)
      const CHECK_SIZE = 320;
      const canvas = document.createElement('canvas');
      canvas.width = CHECK_SIZE;
      canvas.height = CHECK_SIZE;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, CHECK_SIZE, CHECK_SIZE);
      const imageData = ctx.getImageData(0, 0, CHECK_SIZE, CHECK_SIZE);
      const score = computeBlurScore(imageData);
      resolve({ score, isBlurry: score < threshold });
    };
    img.onerror = () => resolve({ score: 999, isBlurry: false }); // Jika gagal load, anggap tidak buram
    img.src = rawImageSrc;
  });
};

export default function ScannerEngine(props: ScannerEngineProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [blurWarning, setBlurWarning] = useState<string | null>(null); // Pesan blur untuk user
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      setStream(mediaStream);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Gagal mengakses kamera. Pastikan Anda telah memberikan izin, atau gunakan fitur unggah foto.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // ── FASE 2+3+Roboflow: captureFrame dengan blur detection + smart crop + preprocessing ──
  const captureFrame = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const width = video.videoWidth || video.clientWidth || 640;
      const height = video.videoHeight || video.clientHeight || 480;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          // 1. Ambil frame mentah dari kamera
          ctx.drawImage(video, 0, 0, width, height);
          const rawImageSrc = canvas.toDataURL('image/jpeg', 0.95);

          // 2. Blur Detection (Fase 3): tolak gambar buram sebelum panggil API
          const { score, isBlurry } = await checkImageBlur(rawImageSrc, BLUR_THRESHOLD_CAMERA);
          logToServer('INFO', `[ScannerEngine] Blur check kamera: score=${score}, isBlurry=${isBlurry}`);

          if (isBlurry) {
            logToServer('WARN', `[ScannerEngine] Gambar buram (score=${score}), meminta foto ulang`);
            setBlurWarning(`📸 Gambar kurang tajam (skor: ${score}). Coba dekatkan kamera dan pastikan objek tidak bergerak.`);
            return;
          }

          // 3. Gambar tajam → lanjut ke pipeline
          setBlurWarning(null);
          stopCamera();
          setIsEnhancing(true);

          // 4. Roboflow Smart-Crop: deteksi lokasi sampah, crop hanya area itu
          logToServer('INFO', '[ScannerEngine] Menghubungi Roboflow untuk deteksi bounding box...');
          const bbox = await getRoboflowBoundingBox(rawImageSrc);

          let processedImageSrc: string;
          if (bbox) {
            logToServer('SUCCESS', `[ScannerEngine] Roboflow ✅ class="${bbox.className}" conf=${bbox.confidence}% → crop + enhance`);
            processedImageSrc = await cropAndPreprocessWithBBox(rawImageSrc, bbox);
          } else {
            logToServer('WARN', '[ScannerEngine] Roboflow tidak menemukan objek, fallback ke center-crop buta');
            processedImageSrc = await preprocessCameraImage(rawImageSrc);
          }

          setIsEnhancing(false);
          setCapturedImage(rawImageSrc);
          logToServer('SUCCESS', `[ScannerEngine] Pipeline selesai (Roboflow=${bbox ? 'smart-crop' : 'fallback'}), meneruskan ke Cloudflare AI`);
          props.onAnalyze(processedImageSrc);
        } catch (e: any) {
          logToServer('ERROR', `[ScannerEngine] Gagal di captureFrame: ${e?.message || e}`);
          console.error('captureFrame error:', e);
          setIsEnhancing(false);
        }
      }
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // ── FASE 2+3+Roboflow: handleFileUpload dengan smart crop pipeline ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawImageSrc = event.target?.result as string;
        stopCamera();
        setBlurWarning(null);
        setIsEnhancing(true);

        try {
          // Blur check (longgar untuk galeri)
          const { score, isBlurry } = await checkImageBlur(rawImageSrc, BLUR_THRESHOLD_GALLERY);
          logToServer('INFO', `[ScannerEngine] Blur check galeri: score=${score}, isBlurry=${isBlurry}`);
          if (isBlurry) {
            logToServer('WARN', `[ScannerEngine] Gambar galeri buram (score=${score}), tetap diproses`);
          }

          // Roboflow Smart-Crop untuk galeri juga
          logToServer('INFO', '[ScannerEngine] Galeri: menghubungi Roboflow untuk bounding box...');
          const bbox = await getRoboflowBoundingBox(rawImageSrc);

          let processedImageSrc: string;
          if (bbox) {
            logToServer('SUCCESS', `[ScannerEngine] Galeri: Roboflow ✅ class="${bbox.className}" conf=${bbox.confidence}% → crop`);
            processedImageSrc = await cropAndPreprocessWithBBox(rawImageSrc, bbox);
          } else {
            logToServer('WARN', '[ScannerEngine] Galeri: Roboflow tidak menemukan objek, fallback ke letterbox');
            processedImageSrc = await preprocessGalleryImage(rawImageSrc);
          }

          setIsEnhancing(false);
          setCapturedImage(rawImageSrc);
          logToServer('SUCCESS', `[ScannerEngine] Galeri pipeline selesai (Roboflow=${bbox ? 'smart-crop' : 'fallback'}), meneruskan ke Cloudflare AI`);
          props.onAnalyze(processedImageSrc);
        } catch (e: any) {
          logToServer('ERROR', `[ScannerEngine] Gagal di handleFileUpload: ${e?.message || e}`);
          setIsEnhancing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  React.useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(e => console.error("Error playing video:", e));
      };
    }
  }, [stream]);

  // ── State: Gambar sudah diambil, menunggu konfirmasi ──
  if (capturedImage) {
    return (
      <div className="flex flex-col h-full bg-black">
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          <img src={capturedImage} alt="Captured" className="max-h-full max-w-full object-contain" />
          {/* Overlay animasi saat enhancing */}
          {isEnhancing && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-eco-green/20 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-eco-green" />
              </div>
              <p className="text-white font-semibold text-sm">Memproses gambar...</p>
              <p className="text-white/60 text-xs">Meningkatkan kualitas untuk AI</p>
            </div>
          )}
        </div>
        {!isEnhancing && (
          <div className="bg-white rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-10 flex flex-col gap-4 pb-12">
            <button
              onClick={retakePhoto}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="w-6 h-6" />
              Foto Ulang / Tutup
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black relative">
      {!stream && !error && (
        <div className="flex-1 flex flex-col items-center justify-center text-white p-6 text-center z-10 bg-eco-bg text-eco-text">
          <Camera className="w-20 h-20 mb-6 opacity-30 text-eco-green" />
          <h2 className="text-2xl font-bold mb-2">Pemindai Sampah</h2>
          <p className="text-eco-text-light mb-8 max-w-xs">Arahkan kamera ke sampah untuk mengetahui jenis dan cara membuangnya.</p>
          <button
            onClick={startCamera}
            className="bg-eco-green hover:bg-eco-green-dark text-white rounded-full py-4 px-8 font-bold text-lg transition-all active:scale-95 w-full max-w-xs shadow-lg shadow-eco-green/30"
          >
            Buka Kamera
          </button>
          <div className="mt-6 flex items-center gap-2">
            <div className="h-px w-16 bg-gray-300"></div>
            <span className="text-gray-500 text-sm">Atau</span>
            <div className="h-px w-16 bg-gray-300"></div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 text-eco-green font-medium flex items-center gap-2 p-2 active:opacity-70"
          >
            <ImageIcon className="w-5 h-5" />
            Pilih dari Galeri
          </button>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 bg-eco-bg">
          <div className="bg-eco-red/10 p-4 rounded-full mb-4">
            <Camera className="w-12 h-12 text-eco-red" />
          </div>
          <p className="text-eco-red mb-8 max-w-xs">{error}</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-eco-blue hover:bg-eco-blue/90 text-white rounded-full py-4 px-8 font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 w-full max-w-xs shadow-lg shadow-eco-blue/30"
          >
            <ImageIcon className="w-5 h-5" />
            Pilih dari Galeri
          </button>
        </div>
      )}

      {stream && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
            <div className={`w-full aspect-square max-w-sm border-2 rounded-3xl relative flex flex-col justify-end pb-6 transition-colors duration-300 ${blurWarning ? 'border-eco-amber/80' : 'border-white/50'}`}>
              <div className={`absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 rounded-tl-3xl transition-colors ${blurWarning ? 'border-eco-amber' : 'border-eco-green'}`} />
              <div className={`absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 rounded-tr-3xl transition-colors ${blurWarning ? 'border-eco-amber' : 'border-eco-green'}`} />
              <div className={`absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 rounded-bl-3xl transition-colors ${blurWarning ? 'border-eco-amber' : 'border-eco-green'}`} />
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 rounded-br-3xl transition-colors ${blurWarning ? 'border-eco-amber' : 'border-eco-green'}`} />
              {blurWarning ? (
                <p className="text-eco-amber text-center bg-black/70 px-4 py-2 rounded-xl text-xs font-semibold mx-4 shadow-lg backdrop-blur-sm animate-pulse">
                  {blurWarning}
                </p>
              ) : (
                <p className="text-white text-center bg-black/60 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium mx-4 shadow-lg backdrop-blur-sm">
                  Dekatkan kamera 30-50 cm.<br/>Pastikan <span className="text-eco-amber font-bold">HANYA SAMPAH</span> di dalam kotak.
                </p>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex items-center justify-between z-10 max-w-xs mx-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              onClick={captureFrame}
              className="w-20 h-20 rounded-full border-4 border-white active:scale-95 flex items-center justify-center transition-all"
            >
              <div className="w-16 h-16 bg-white rounded-full transition-all" />
            </button>
            <button
              onClick={stopCamera}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <span className="sr-only">Batal</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
