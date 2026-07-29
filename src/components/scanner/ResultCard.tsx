import { useMemo, useState, useEffect } from 'react';
import { Leaf, Info, DollarSign, X, Bot, Sparkles, TrendingUp, Zap } from 'lucide-react';
import type { AIResult } from '../../services/aiService';
import { cn } from '../../utils/cn';
import ChatInterface from './ChatInterface';
import { retrieveTrashContext } from '../../services/ragService';
interface ResultCardProps {
  result: AIResult;
  imageSrc: string;
  onClose: () => void;
}

export default function ResultCard({ result, imageSrc, onClose }: ResultCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Tampilkan popup feedback setelah 4 detik, hanya jika belum pernah melihatnya
    const hasSeen = localStorage.getItem('pasuruhan_feedback_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    localStorage.setItem('pasuruhan_feedback_seen', 'true');
  };

  const handleOpenFeedback = () => {
    window.open('https://forms.gle/CWtqXSqbUrtHyr6W7', '_blank');
    setShowFeedback(false);
    localStorage.setItem('pasuruhan_feedback_seen', 'true');
  };

  // RAG: Ambil data kamus lokal sekali
  const ragFacts = useMemo(() => retrieveTrashContext(result.label, result.category), [result]);
  // Buat Fakta Edukasi secara statis (tanpa AI) untuk menghemat token
  const aiExplanation = useMemo(() => {
    if (result.category === 'BUKAN_SAMPAH') {
      return "Sistem kami mendeteksi objek ini bukan sampah. Mari kita jaga lingkungan dengan hanya memilah benda yang benar-benar merupakan sampah.";
    }
    if (result.category === 'GAMBAR_BURAM') {
      return "Kamera kurang fokus atau pencahayaan kurang. AI butuh detail visual (tekstur, bentuk, label) untuk menganalisis sampah dengan benar. Yuk, coba foto ulang!";
    }

    // Cek apakah sampah dikenali di dalam kamus lokal kita
    const isKnown = result.label !== "Tidak Dikenali" && ragFacts.namaResmi !== "Sampah Umum (Tidak Dikenali)";
    
    if (isKnown) {
      return `Tahukah kamu? ${ragFacts.namaResmi} butuh waktu sekitar ${ragFacts.facts.decompositionTime} untuk terurai. Dampaknya: ${ragFacts.facts.ecoImpact}`;
    } else {
      return "Jenis sampah ini belum tercatat spesifik di kamus kami. Namun secara umum, pastikan kamu memilahnya sesuai bahan dasarnya (Plastik/Kertas/Organik/Residu) untuk mempermudah daur ulang!";
    }
  }, [result, ragFacts]);
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PLASTIK': return 'bg-eco-amber text-white';
      case 'KERTAS': return 'bg-eco-blue text-white';
      case 'ORGANIK': return 'bg-eco-green text-white';
      case 'RESIDU': return 'bg-eco-red text-white';
      case 'BUKAN_SAMPAH': return 'bg-gray-800 text-white';
      case 'GAMBAR_BURAM': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryBorder = (category: string) => {
    switch (category) {
      case 'PLASTIK': return 'border-eco-amber';
      case 'KERTAS': return 'border-eco-blue';
      case 'ORGANIK': return 'border-eco-green';
      case 'RESIDU': return 'border-eco-red';
      case 'BUKAN_SAMPAH': return 'border-gray-800';
      case 'GAMBAR_BURAM': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case 'PLASTIK': return 'text-eco-amber';
      case 'KERTAS': return 'text-eco-blue';
      case 'ORGANIK': return 'text-eco-green';
      case 'RESIDU': return 'text-eco-red';
      case 'BUKAN_SAMPAH': return 'text-gray-800';
      case 'GAMBAR_BURAM': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };
  
  const getIconBg = (category: string) => {
    switch (category) {
      case 'PLASTIK': return 'bg-eco-amber/20';
      case 'KERTAS': return 'bg-eco-blue/20';
      case 'ORGANIK': return 'bg-eco-green/20';
      case 'RESIDU': return 'bg-eco-red/20';
      case 'BUKAN_SAMPAH': return 'bg-gray-800/20';
      case 'GAMBAR_BURAM': return 'bg-orange-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-eco-bg overflow-y-auto pb-24">
      {/* Header Image */}
      <div className="relative h-64 w-full bg-black">
        <img src={imageSrc} alt="Scanned" className="w-full h-full object-cover opacity-80" />
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="absolute -bottom-6 w-full flex justify-center">
          <div className={cn("px-6 py-2 rounded-full font-bold shadow-lg shadow-black/10 text-lg", getCategoryColor(result.category))}>
            {result.confidence}% Yakin
          </div>
        </div>
      </div>

      <div className="px-6 pt-12 pb-6 flex flex-col gap-6">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-extrabold text-eco-text mb-2">{result.label}</h2>
          <div className={cn("inline-block px-4 py-1 rounded-full text-sm font-bold shadow-sm mb-3", getCategoryColor(result.category))}>
            Kategori: {result.category}
          </div>
          <div>
            <button 
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-full font-medium text-xs transition-all active:scale-95 border border-red-100"
            >
              <X className="w-3.5 h-3.5" /> AI Salah Tebak? Scan Ulang
            </button>
          </div>
        </div>

        {/* Cloudflare AI Detail Fact Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-3xl shadow-sm border border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Bot className="w-24 h-24 text-indigo-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-indigo-700">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold">Fakta Edukasi AI</h3>
            </div>
            <p className="text-indigo-900/80 leading-relaxed text-sm">
              {aiExplanation}
            </p>
          </div>
        </div>

        {/* Action Guide */}
        <div className={cn("bg-white p-5 rounded-3xl shadow-sm border-l-4", getCategoryBorder(result.category))}>
          <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-full mt-1", getIconBg(result.category), getIconColor(result.category))}>
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-eco-text text-lg mb-1">Panduan Buang</h3>
              <p className="text-eco-text-light leading-relaxed">{result.disposalGuide}</p>
            </div>
          </div>
        </div>

        {/* Eco Tip */}
        <div className="bg-eco-green/10 p-5 rounded-3xl shadow-sm border border-eco-green/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full mt-1 bg-eco-green/20 text-eco-green-dark">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-eco-green-dark text-lg mb-1">Tips Ekologis</h3>
              <p className="text-eco-text-light leading-relaxed">{result.ecoTip}</p>
            </div>
          </div>
        </div>

        {/* Eco Value Estimation */}
        {result.ecoValue && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-3xl shadow-sm border border-amber-100 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <DollarSign className="w-24 h-24 text-amber-500" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 text-amber-700">
                <DollarSign className="w-5 h-5" />
                <h3 className="font-bold">Estimasi Nilai Ekonomi</h3>
              </div>
              
              <div className="bg-white/60 rounded-2xl p-4 mb-3 border border-amber-200/50">
                <div className="text-xs font-bold text-amber-600 mb-1 uppercase tracking-wider">Harga Pasar</div>
                <div className="font-extrabold text-xl text-amber-600">
                  {result.ecoValue.basePrice}
                </div>
              </div>

              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-800 text-sm mb-0.5">Cara Dapat Harga Maksimal</h4>
                  <p className="text-amber-900/80 text-sm leading-relaxed">{result.ecoValue.proTip}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-orange-800 text-sm mb-0.5">Target Kumpul Rutin</h4>
                  <p className="text-orange-900/80 text-sm leading-relaxed">{result.ecoValue.monthlyProjection}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chatbot Interface */}
        {(result.category !== 'BUKAN_SAMPAH' && result.category !== 'GAMBAR_BURAM') && (
          <div className="mt-8 border-t border-gray-200 pt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-eco-text">Tanya Cloudflare AI</h2>
              <p className="text-eco-text-light text-sm mt-1">Dapatkan ide kreatif daur ulang sampah ini!</p>
            </div>
            <ChatInterface result={result} />
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <button 
            onClick={onClose}
            className="w-full bg-eco-text hover:bg-black text-white rounded-2xl py-4 font-bold text-lg transition-all active:scale-95"
          >
            Scan Lagi
          </button>
        </div>
      </div>

      {/* Pop-up Evaluasi */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-center text-eco-text mb-2">Bantu Kami Lebih Baik 🌱</h3>
            <p className="text-center text-eco-text-light text-sm mb-6 leading-relaxed">
              Halo! Bagaimana pengalaman Anda menggunakan aplikasi ini hari ini? Luangkan 1 menit untuk memberikan masukan agar AI kami semakin pintar!
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleOpenFeedback}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                Tentu, Isi Survei
              </button>
              <button 
                onClick={handleCloseFeedback}
                className="w-full text-gray-500 hover:text-gray-800 font-medium py-3 rounded-xl transition-colors text-sm"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
