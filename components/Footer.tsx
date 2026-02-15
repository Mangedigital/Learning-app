
import React from 'react';

interface FooterProps {
  debugMode: boolean;
  onToggleDebug: () => void;
}

export const Footer: React.FC<FooterProps> = ({ debugMode, onToggleDebug }) => (
  <footer className="p-4 md:p-8 text-center text-slate-400 text-xs md:text-sm border-t border-slate-100 mt-8 md:mt-12 bg-white w-full">
    <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
      <p className="font-medium">© {new Date().getFullYear()} Göteborgs Stad. Utbildningsprototyp för HR-avdelningen.</p>
      <button 
        onClick={onToggleDebug} 
        className={`text-[10px] transition-all px-2 py-0.5 rounded ${debugMode ? 'bg-amber-100 text-amber-600 font-bold' : 'opacity-20 hover:opacity-100'}`}
      >
        <i className="fa-solid fa-gear mr-1"></i> {debugMode ? 'Testläge AKTIVT' : 'Testläge'}
      </button>
    </div>
  </footer>
);
