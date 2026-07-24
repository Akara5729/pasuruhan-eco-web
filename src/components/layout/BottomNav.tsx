import { Camera, BookOpen } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Tab } from '../../App';

interface BottomNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-6">
        <button 
          onClick={() => onChange('catalog')}
          className={cn(
            "flex flex-col items-center justify-center w-24 h-16 gap-1 transition-colors",
            activeTab === 'catalog' ? "text-eco-green" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <BookOpen className={cn("w-6 h-6", activeTab === 'catalog' && "fill-eco-green/20")} />
          <span className="text-[10px] font-bold">Katalog Edukasi</span>
        </button>
        
        <button 
          onClick={() => onChange('scanner')}
          className={cn(
            "flex flex-col items-center justify-center w-20 h-20 rounded-full -mt-8 shadow-xl transition-transform active:scale-95 border-4 border-eco-bg",
            activeTab === 'scanner' ? "bg-eco-green text-white shadow-eco-green/30" : "bg-gray-800 text-white shadow-gray-800/30"
          )}
        >
          <Camera className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
