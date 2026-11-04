import React from 'react';
import { Sparkles, Activity } from 'lucide-react';

export const Header = ({ titulo, subtitulo }) => (
  <header className="px-6 py-4 bg-darkCard border-b border-gray-800 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-accentPurple">
        <Sparkles className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-white font-semibold text-sm">{titulo}</h2>
        <p className="text-xs text-gray-400">{subtitulo}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
      <Activity className="w-3.5 h-3.5 animate-pulse" />
      <span>RAG Backend Conectado</span>
    </div>
  </header>
);