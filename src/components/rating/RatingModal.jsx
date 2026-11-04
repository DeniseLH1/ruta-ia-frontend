import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { consultationService } from '../../services/consultationService.js';

export const RatingModal = ({ isOpen, onClose, consultaId }) => {
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await consultationService.calificarConsulta(consultaId, calificacion, comentario);
      onClose();
    } catch (err) {
      console.error('Error al calificar:', err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-darkCard border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-bold text-white mb-1">Calificar Respuesta</h3>
          <p className="text-xs text-gray-400 mb-6">
            Tu retroalimentación nos ayuda a mejorar las respuestas del sistema RAG.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col items-center gap-2 py-2">
              <RatingStars valorInicial={calificacion} onChange={setCalificacion} />
              <span className="text-xs text-amber-400 font-medium">
                {calificacion} de 5 estrellas
              </span>
            </div>

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe un comentario opcional sobre la respuesta..."
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm rounded-xl p-3 focus:outline-none focus:border-accentCyan"
            />

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{enviando ? 'Guardando...' : 'Enviar Calificación'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};