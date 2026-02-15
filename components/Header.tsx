
import React from 'react';
import { UserRole } from '../types';

export const Header: React.FC<{ role?: UserRole | null; onReset: () => void }> = ({ role, onReset }) => (
  <header className="bg-[#004b89] text-white p-4 shadow-md sticky top-0 z-50">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
        <div className="bg-white p-1 rounded">
          <img src="https://picsum.photos/32/32?random=1" alt="Gbg Stad" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-none">AI i Vardagen</h1>
          <p className="text-xs opacity-80">Göteborgs Stad - Utbildning</p>
        </div>
      </div>
      {role && (
        <div className="hidden sm:flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded-full border border-white/20">
          <i className="fa-solid fa-user-circle"></i>
          <span>{role}</span>
        </div>
      )}
    </div>
  </header>
);
