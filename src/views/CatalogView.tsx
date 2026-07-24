import { useState, useMemo } from 'react';
import { BookOpen, Leaf, Recycle, Wind, X, Search, ChevronRight, DollarSign, Clock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ecoDictionary } from '../services/ragService';
import type { TrashFacts } from '../services/ragService';
import { cn } from '../utils/cn';

export default function CatalogView() {
  const [selectedItem, setSelectedItem] = useState<TrashFacts | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Kelompokkan data berdasarkan kategori
  const groupedData = useMemo(() => {
    const filtered = ecoDictionary.filter(item => 
      item.namaResmi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return {
      'PLASTIK': filtered.filter(item => item.kategori === 'PLASTIK'),
      'KERTAS': filtered.filter(item => item.kategori === 'KERTAS'),
      'ORGANIK': filtered.filter(item => item.kategori === 'ORGANIK'),
      'RESIDU': filtered.filter(item => item.kategori === 'RESIDU')
    };
  }, [searchQuery]);

  const getCategoryConfig = (category: string) => {
    switch(category) {
      case 'PLASTIK': return { bg: 'bg-eco-amber/20', text: 'text-eco-amber', border: 'border-eco-amber', icon: Wind };
      case 'KERTAS': return { bg: 'bg-eco-blue/20', text: 'text-eco-blue', border: 'border-eco-blue', icon: BookOpen };
      case 'ORGANIK': return { bg: 'bg-eco-green/20', text: 'text-eco-green', border: 'border-eco-green', icon: Leaf };
      case 'RESIDU': return { bg: 'bg-eco-red/20', text: 'text-eco-red', border: 'border-eco-red', icon: Recycle };
      default: return { bg: 'bg-gray-200', text: 'text-gray-500', border: 'border-gray-500', icon: Info };
    }
  };

  return (
    <div className="h-full bg-eco-bg overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-eco-green pt-12 pb-8 px-6 rounded-b-[2.5rem] shadow-md sticky top-0 z-10">
        <h1 className="text-3xl font-extrabold text-white mb-2">Ensiklopedia Edukasi</h1>
        <p className="text-green-100 text-sm mb-6">Panduan pilah sampah komprehensif untuk lingkungan yang lebih bersih.</p>
        
        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Cari jenis sampah... (misal: botol, kardus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/70 rounded-full py-3 px-12 focus:outline-none focus:bg-white focus:text-eco-text focus:placeholder-gray-400 transition-all shadow-inner"
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/70" />
        </div>
      </div>

      <div className="p-6 flex flex-col gap-8 mt-2">
        {/* Render setiap kategori */}
        {Object.entries(groupedData).map(([categoryName, items]) => {
          if (items.length === 0) return null;
          const conf = getCategoryConfig(categoryName);
          const Icon = conf.icon;

          return (
            <section key={categoryName}>
              <h2 className="text-xl font-extrabold text-eco-text mb-4 flex items-center gap-2">
                <div className={cn("p-2 rounded-xl", conf.bg, conf.text)}>
                  <Icon className="w-5 h-5" />
                </div>
                {categoryName}
              </h2>
              
              <div className="grid grid-cols-1 gap-3">
                {items.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedItem(item)}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow active:scale-[0.98] text-left"
                  >
                    <div>
                      <h3 className="font-bold text-eco-text">{item.namaResmi}</h3>
                      <p className="text-xs text-eco-text-light mt-1 line-clamp-1">{item.facts.materialDescription}</p>
                    </div>
                    <ChevronRight className={cn("w-5 h-5 shrink-0 ml-2", conf.text)} />
                  </button>
                ))}
              </div>
            </section>
          );
        })}

        {Object.values(groupedData).every(arr => arr.length === 0) && (
          <div className="text-center py-10 text-eco-text-light">
            <Recycle className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Sampah tidak ditemukan di ensiklopedia.</p>
          </div>
        )}
      </div>

      {/* Modal / Full-Screen Popup */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col sm:max-w-md sm:mx-auto sm:border-x sm:border-gray-200 shadow-2xl"
          >
            {/* Modal Header */}
            <div className={cn("pt-12 pb-6 px-6 shadow-md rounded-b-[2.5rem] relative", getCategoryConfig(selectedItem.kategori).bg)}>
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6 text-eco-text" />
              </button>
              
              <div className={cn("inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider", getCategoryConfig(selectedItem.kategori).text, "bg-white")}>
                {selectedItem.kategori}
              </div>
              <h2 className="text-3xl font-extrabold text-eco-text leading-tight">{selectedItem.namaResmi}</h2>
              <p className={cn("font-medium mt-1", getCategoryConfig(selectedItem.kategori).text)}>{selectedItem.subKategori}</p>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 pb-24">
              
              <section>
                <h3 className="font-bold text-lg text-eco-text mb-2">Deskripsi Material</h3>
                <p className="text-eco-text-light leading-relaxed text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {selectedItem.facts.materialDescription}
                </p>
              </section>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider">Waktu Urai</h4>
                  </div>
                  <p className="text-sm font-semibold text-blue-800">{selectedItem.facts.decompositionTime}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">Nilai Ekonomi</h4>
                  </div>
                  <p className="text-sm font-semibold text-amber-800">{selectedItem.facts.economicValue}</p>
                </div>
              </div>

              <section className={cn("p-4 rounded-2xl border-l-4 bg-white shadow-sm", getCategoryConfig(selectedItem.kategori).border)}>
                <h3 className="font-bold text-lg text-eco-text mb-2 flex items-center gap-2">
                  <Info className={cn("w-5 h-5", getCategoryConfig(selectedItem.kategori).text)} />
                  Panduan Pembuangan
                </h3>
                <p className="text-eco-text-light leading-relaxed text-sm">
                  {selectedItem.disposalTip}
                </p>
              </section>

              <section>
                <h3 className="font-bold text-lg text-eco-text mb-3">Ide Daur Ulang / DIY</h3>
                <ul className="space-y-2">
                  {selectedItem.facts.diyIdeas.map((idea, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-eco-text-light items-start">
                      <div className="w-5 h-5 rounded-full bg-eco-green/10 text-eco-green flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed">{idea}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-red-50 p-4 rounded-2xl border border-red-100">
                <h3 className="font-bold text-sm text-red-800 mb-2 uppercase tracking-wider">Peringatan / Bahaya</h3>
                <ul className="list-disc pl-5 text-sm text-red-700/80 space-y-1">
                  {selectedItem.facts.hazards.map((hazard, idx) => (
                    <li key={idx}>{hazard}</li>
                  ))}
                </ul>
              </section>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
