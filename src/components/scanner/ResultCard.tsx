import { useMemo } from 'react';
import { Leaf, Info, DollarSign, X, Bot, Sparkles } from 'lucide-react';
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
  // RAG: Ambil data kamus lokal sekali
  const ragFacts = useMemo(() => retrieveTrashContext(result.label, result.category), [result]);
  // Buat Fakta Edukasi secara statis (tanpa AI) untuk menghemat token
  const aiExplanation = useMemo(() => {
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
          <div className={cn("inline-block px-4 py-1 rounded-full text-sm font-bold shadow-sm mb-4", getCategoryColor(result.category))}>
            Kategori: {result.category}
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

        {/* Eco Points */}
        {result.ecoPoints > 0 && (
          <div className="bg-eco-amber/10 p-5 rounded-3xl shadow-sm border border-eco-amber/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-eco-amber/20 text-eco-amber">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-eco-text text-lg">Estimasi Nilai</h3>
            </div>
            <div className="font-extrabold text-2xl text-eco-amber">
              Rp {result.ecoPoints}
            </div>
          </div>
        )}

        {/* Chatbot Interface */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-eco-text">Tanya Cloudflare AI</h2>
            <p className="text-eco-text-light text-sm mt-1">Dapatkan ide kreatif daur ulang sampah ini!</p>
          </div>
          <ChatInterface result={result} />
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-eco-text hover:bg-black text-white rounded-2xl py-4 font-bold text-lg transition-all active:scale-95 mt-4"
        >
          Scan Lagi
        </button>
      </div>
    </div>
  );
}
