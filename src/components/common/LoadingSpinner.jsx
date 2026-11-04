import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ texto = 'Cargando...' }) => (
  <div className="flex items-center justify-center gap-2 p-4 text-gray-400 text-sm">
    <Loader2 className="w-5 h-5 animate-spin text-accentCyan" />
    <span>{texto}</span>
  </div>
);