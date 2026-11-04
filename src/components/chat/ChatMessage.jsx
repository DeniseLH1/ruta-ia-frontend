import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Star } from 'lucide-react';

export const ChatMessage = ({ mensaje, onAbrirRating }) => {
  const esUsuario = mensaje.remitente === 'usuario';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${esUsuario ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Icono del remitente */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          esUsuario
            ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
            : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
        }`}
      >
        {esUsuario ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      {/* Cuerpo del mensaje */}
      <div
        className={`max-w-xl rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
          esUsuario
            ? 'bg-cyan-600 text-white rounded-tr-none'
            : 'bg-darkCard border border-gray-800 text-gray-200 rounded-tl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{mensaje.texto}</p>
        {/* Cursos recomendados si existen */}
        {mensaje.cursosRecomendados && mensaje.cursosRecomendados.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-800/80 space-y-2">
            <p className="text-xs font-semibold text-accentCyan uppercase tracking-wider">
              Cursos Recomendados:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {mensaje.cursosRecomendados.map((curso, idx) => (
                <div key={idx} className="bg-gray-900/60 p-2.5 rounded-lg border border-gray-800 text-xs">
                  <span className="font-bold text-white">{curso.titulo || curso.nombre}</span>
                  <p className="text-gray-400 mt-0.5 line-clamp-2">{curso.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Botón de Calificación para respuestas de la IA */}
        {!esUsuario && mensaje.consultaId && (
          <div className="mt-3 pt-2 border-t border-gray-800 flex justify-end">
            <button
              onClick={() => onAbrirRating(mensaje.consultaId)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-400 transition-colors"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Calificar respuesta</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};