import { useState } from 'react';
import ScannerEngine from '../components/scanner/ScannerEngine';
import ResultCard from '../components/scanner/ResultCard';
import type { AIResult } from '../services/aiService';
import { analyzeImage } from '../services/aiService';
import { logToServer } from '../services/remoteLogger';

export default function ScannerView() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState<string>("Memulai mesin AI...");

  const handleAnalyze = async (image: string) => {
    logToServer('INFO', `[ScannerView] Memulai Proses Scan...`);
    setImageSrc(image);
    setIsAnalyzing(true);
    setErrorMsg(null);
    setProgressStatus(`☁️ Menghubungi Cloudflare AI...`);
    
    try {
      const res = await analyzeImage(image);
      setResult(res);
    } catch (error: any) {
      console.error("Gagal menganalisis gambar:", error);
      setErrorMsg(error.message || "Gagal menghubungi AI. Pastikan ada koneksi internet.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCloseResult = () => {
    setResult(null);
    setImageSrc(null);
    setErrorMsg(null);
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
              className="w-full py-3 bg-eco-green hover:bg-eco-green-dark text-white rounded-xl font-bold transition-all"
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

      {/* Loading Overlay untuk Menganalisis Gambar */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6 z-40 backdrop-blur-sm transition-all duration-300">
          {imageSrc && (
            <img src={imageSrc} alt="Scanning" className="absolute inset-0 w-full h-full object-cover opacity-20 -z-10 mix-blend-overlay" />
          )}
          <div className="w-20 h-20 relative mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-eco-green/30" />
            <div className="absolute inset-0 rounded-full border-4 border-eco-green border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-eco-green rounded-full animate-pulse" />
            </div>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Menganalisis Sampah...</h2>
          <p className="text-eco-green-light text-sm bg-eco-green/10 px-4 py-2 rounded-full border border-eco-green/20 animate-pulse">{progressStatus}</p>
        </div>
      )}
    </div>
  );
}
