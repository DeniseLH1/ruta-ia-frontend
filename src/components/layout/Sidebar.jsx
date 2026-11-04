import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquarePlus, History, BookOpen, Clock3, LogOut, ShieldCheck } from 'lucide-react';

// Historial de consultas y acceso rápido de cursos
export const Sidebar = ({ usuario, onLogout, onNuevaConsulta, onCambiarVista, vistaActual }) => {
  return (
    <motion.aside 
      // Animación de entrada desde la izquierda usando Framer Motion
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-72 bg-darkCard border-r border-gray-800 flex flex-col h-screen p-4 select-none"
    >
      {/* Encabezado nombre y logo*/}
      <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accentPurple to-accentCyan flex items-center justify-center shadow-lg shadow-purple-500/20">
          <span className="text-white font-bold text-lg">IA</span>
        </div>
        <div>
          <h1 className="font-bold text-base text-white tracking-wide">Ruta IA Studio</h1>
          <p className="text-xs text-gray-400">Campuslands Assistant</p>
        </div>
      </div>

      {usuario.role === 'student' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNuevaConsulta}
          className="mb-6 flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-3 font-medium text-white shadow-md transition-all hover:from-purple-500 hover:to-cyan-500"
        >
          <MessageSquarePlus className="h-5 w-5" />
          <span>Nueva Consulta</span>
        </motion.button>
      )}

      {/* Menú de Navegación / Secciones */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Navegación
        </p>

        {usuario.role === 'admin' ? (
          <button
            onClick={() => onCambiarVista('admin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              vistaActual === 'admin'
                ? 'bg-gray-800 text-accentCyan border-l-4 border-accentCyan'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Administración</span>
          </button>
        ) : (
          <>
        <button
          onClick={() => onCambiarVista('chat')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            vistaActual === 'chat' 
              ? 'bg-gray-800 text-accentCyan border-l-4 border-accentCyan' 
              : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Consultas & RAG</span>
        </button>

        {/* Opción: Cursos */}
        <button
          onClick={() => onCambiarVista('courses')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            vistaActual === 'courses' 
              ? 'bg-gray-800 text-accentCyan border-l-4 border-accentCyan' 
              : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Cursos</span>
        </button>

        <button
          onClick={() => onCambiarVista('history')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            vistaActual === 'history'
              ? 'bg-gray-800 text-accentCyan border-l-4 border-accentCyan'
              : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
          }`}
        >
          <Clock3 className="w-4 h-4" />
          <span>Historial</span>
        </button>
          </>
        )}
      </div>

      {/* Sección Inferior: Perfil */}
      <div className="pt-4 border-t border-gray-800 mt-auto">
        <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-gray-900/50 border border-gray-800/60">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-gray-300 font-medium">n8n Workflow: Activo</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 px-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white">{usuario.nombre}</p>
            <p className="text-[10px] uppercase text-gray-500">{usuario.role === 'admin' ? 'Administrador' : 'Estudiante'}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1 rounded-lg px-2 py-2 text-xs text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </motion.aside>
  );
};