import { useState, useEffect, useRef } from 'react';
import ScannerEngine from '../components/scanner/ScannerEngine';
import ResultCard from '../components/scanner/ResultCard';
import type { AIResult } from '../services/aiService';
import { analyzeImage } from '../services/aiService';
import { logToServer } from '../services/remoteLogger';

// ── Eco Tips yang berganti-ganti saat loading ──
const ECO_TIPS = [
  "♻️ 1 botol plastik PET yang didaur ulang bisa menghemat energi setara 60W lampu selama 6 jam.",
  "📦 Kardus bekas bisa dilebur & dijadikan kertas baru hanya dalam 7 hari.",
  "🍃 Sampah organik bisa menjadi kompos dalam 2-4 minggu & menyuburkan tanah.",
  "💰 1 kg plastik PET bersih bisa dijual Rp 3.000–5.000 ke bank sampah.",
  "⚡ Daur ulang aluminium hemat energi 95% dibanding produksi baru.",
  "🌍 Indonesia menghasilkan ±67 juta ton sampah per tahun — pilah mulai dari rumah!",
  "🏦 Bergabung ke bank sampah lokal untuk menukar sampah menjadi tabungan atau sembako.",
  "🧴 Botol plastik #1 (PET) & #2 (HDPE) paling mudah didaur ulang & bernilai tinggi.",
];

// ── Tahapan proses AI ──
const STAGES = [
  { id: 1, label: "Optimalisasi Gambar", icon: "⚡", desc: "Auto-contrast & ROI crop aktif...", progress: 30 },
  { id: 2, label: "Deteksi Objek AI", icon: "🤖", desc: "Cloudflare Llama Vision menganalisis...", progress: 75 },
  { id: 3, label: "Kalkulasi Nilai Ekonomi", icon: "💡", desc: "Menghitung kategori & harga pasar...", progress: 92 },
  { id: 4, label: "Menyiapkan Hasil", icon: "✨", desc: "Merangkai laporan untuk Anda...", progress: 100 },
];

export default function ScannerView() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Progress state
  const [progress, setProgress] = useState(0);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);
  const tipIntervalRef = useRef<number | null>(null);

  const startProgress = () => {
    setProgress(0);
    setCurrentStageIdx(0);
    setTipIdx(Math.floor(Math.random() * ECO_TIPS.length));

    // Simulasi progres yang terasa alami (maju cepat di awal, melambat saat menunggu AI)
    let current = 0;
    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev < 25) return prev + 2.5;      // Cepat: preprocessing
        if (prev < 70) return prev + 0.8;      // Lambat: menunggu AI
        if (prev < 88) return prev + 0.5;      // Sangat lambat: kalkulasi
        return prev;                             // Berhenti di 88, tunggu selesai
      });
      current = Math.min(current + 0.8, 88);

      // Update stage berdasarkan progress
      setCurrentStageIdx(_idx => {
        const pct = current;
        if (pct >= 92) return 3;
        if (pct >= 70) return 2;
        if (pct >= 25) return 1;
        return 0;
      });
    }, 100);

    // Tips berganti setiap 2.5 detik
    tipIntervalRef.current = window.setInterval(() => {
      setTipIdx(idx => (idx + 1) % ECO_TIPS.length);
    }, 2500);
  };

  const stopProgress = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (tipIntervalRef.current) clearInterval(tipIntervalRef.current);
    setProgress(100);
    setCurrentStageIdx(3);
  };

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (tipIntervalRef.current) clearInterval(tipIntervalRef.current);
    };
  }, []);

  const handleAnalyze = async (image: string) => {
    logToServer('INFO', `[ScannerView] Memulai Proses Scan...`);
    setImageSrc(image);
    setIsAnalyzing(true);
    setErrorMsg(null);
    startProgress();

    try {
      const res = await analyzeImage(image);
      stopProgress();
      // Delay kecil agar animasi "100%" terlihat sebentar
      setTimeout(() => {
        setResult(res);
        setIsAnalyzing(false);
      }, 400);
    } catch (error: any) {
      console.error("Gagal menganalisis gambar:", error);
      stopProgress();
      setErrorMsg(error.message || "Gagal menghubungi AI. Pastikan ada koneksi internet.");
      setIsAnalyzing(false);
    }
  };

  const handleCloseResult = () => {
    setResult(null);
    setImageSrc(null);
    setErrorMsg(null);
    setProgress(0);
  };

  if (errorMsg && imageSrc) {
    return (
      <div className="flex flex-col h-full bg-black relative items-center justify-center p-6 text-center">
        <img src={imageSrc} alt="Failed" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="z-10 bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Analisis Gagal</h2>
          <p className="text-gray-600 text-sm mb-6">{errorMsg}</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleAnalyze(imageSrc)}
              className="w-full py-3 text-white rounded-xl font-bold transition-all"
              style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}
            >
              Coba Lagi
            </button>
            <button 
              onClick={handleCloseResult}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
            >
              Foto Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result && imageSrc) {
    return <ResultCard result={result} imageSrc={imageSrc} onClose={handleCloseResult} />;
  }

  return (
    <div className="h-full relative">
      <ScannerEngine 
        onAnalyze={handleAnalyze}
      />

      {/* ── Multi-Stage Loading Progress Overlay ── */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-5"
          style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
        >
          {/* Preview foto yang dipindai */}
          {imageSrc && (
            <div className="relative mb-5">
              <div
                className="w-24 h-24 rounded-2xl object-cover overflow-hidden border-2 border-emerald-400/60"
                style={{ boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}
              >
                <img src={imageSrc} alt="Scanning" className="w-full h-full object-cover" />
              </div>
              {/* Pulsing glow ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping opacity-30" />
            </div>
          )}

          {/* Card Progress */}
          <div className="w-full max-w-xs bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-5">
            {/* Header */}
            <p className="text-white font-bold text-base text-center mb-1">
              Menganalisis Sampah...
            </p>
            <p className="text-emerald-400 text-xs text-center mb-4 font-medium">
              Two-Stage AI Vision sedang bekerja
            </p>

            {/* Progress Bar */}
            <div className="relative mb-4">
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="progress-shimmer h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-white/50 text-[10px]">{Math.round(progress)}%</span>
                <span className="text-emerald-400 text-[10px] font-medium">
                  {STAGES[currentStageIdx]?.label}
                </span>
              </div>
            </div>

            {/* Stage Stepper */}
            <div className="space-y-2 mb-4">
              {STAGES.map((stage, idx) => {
                const isDone = idx < currentStageIdx;
                const isActive = idx === currentStageIdx;
                return (
                  <div key={stage.id}
                    className={`flex items-center gap-2.5 py-1.5 px-3 rounded-xl transition-all duration-300 ${
                      isActive ? 'bg-emerald-500/20 border border-emerald-400/30' :
                      isDone  ? 'opacity-60' : 'opacity-30'
                    }`}
                  >
                    <span className={`text-base transition-all ${isActive ? 'animate-pulse' : ''}`}>
                      {isDone ? '✅' : stage.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${isActive ? 'text-emerald-300' : 'text-white/80'}`}>
                        {stage.label}
                      </p>
                      {isActive && (
                        <p className="text-white/50 text-[10px] truncate">{stage.desc}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Eco Tip */}
            <div className="border-t border-white/10 pt-3">
              <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1 text-center">💡 Fakta Eco</p>
              <p
                key={tipIdx}
                className="text-white/70 text-[10px] text-center leading-relaxed"
                style={{ animation: 'fadeInTip 0.5s ease' }}
              >
                {ECO_TIPS[tipIdx]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
