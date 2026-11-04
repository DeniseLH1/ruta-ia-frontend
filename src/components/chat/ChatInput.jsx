// Componente de entrada para escribir consultas
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

export const ChatInput = ({ onEnviar, cargando }) => {
  const [texto, setTexto] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!texto.trim() || cargando) return;
    onEnviar(texto.trim());
    setTexto('');
  };
  return (
    <footer className="p-4 bg-darkCard border-t border-gray-800">
      <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-4xl mx-auto">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={cargando}
          placeholder="Escribe tu consulta técnica o sobre cursos..."
          className="flex-1 bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-accentCyan transition-colors disabled:opacity-50"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={cargando || !texto.trim()}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-xl shadow-md transition-all flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </form>
    </footer>
  );
};