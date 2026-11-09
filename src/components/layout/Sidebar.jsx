import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BookOpen,
  ChartNoAxesCombined,
  Clock3,
  LayoutDashboard,
  LogOut,
  MessageSquarePlus,
  ShieldCheck,
  UsersRound
} from 'lucide-react';

const adminNavigation = [
  { id: 'admin', label: 'Inicio', icon: LayoutDashboard },
  { id: 'admin-stats', label: 'Estadísticas', icon: ChartNoAxesCombined },
  { id: 'admin-courses', label: 'Gestión de cursos', icon: BookOpen },
  { id: 'admin-students', label: 'Estudiantes', icon: UsersRound },
  { id: 'admin-history', label: 'Historial de consultas', icon: Clock3 }
];

export const Sidebar = ({ usuario, onLogout, onNuevaConsulta, onCambiarVista, vistaActual }) => {
  const isAdmin = usuario.role === 'admin';
  const studentNavigation = [
    { id: 'chat', label: 'Consultas & RAG', icon: MessageSquarePlus },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'history', label: 'Historial', icon: Clock3 }
  ];

  return (
    <motion.aside
      initial={{ x: -18, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative z-10 flex h-screen w-[4.5rem] shrink-0 flex-col border-r border-white/[0.06] bg-[#0c1220] p-2.5 sm:w-64 sm:p-4"
    >
      <div className="mb-5 flex items-center justify-center gap-3 border-b border-white/[0.07] px-1 pb-5 pt-1 sm:justify-start sm:px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 shadow-lg shadow-cyan-950/30">
          {isAdmin
            ? <ShieldCheck className="h-5 w-5 text-white" />
            : <span className="text-sm font-extrabold text-white">IA</span>}
        </div>
        <div className="hidden min-w-0 sm:block">
          <h1 className="truncate text-sm font-bold tracking-wide text-white">Ruta IA Studio</h1>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">Campuslands Assistant</p>
        </div>
      </div>

      {usuario.role === 'student' && (
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNuevaConsulta}
          aria-label="Nueva consulta"
          title="Nueva consulta"
          className="mb-5 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 px-2 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/25 transition hover:brightness-110 sm:justify-start sm:px-4"
        >
          <MessageSquarePlus className="h-5 w-5 shrink-0" />
          <span className="hidden sm:inline">Nueva consulta</span>
        </motion.button>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Navegación principal">
        <p className="mb-2 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 sm:block">
          {isAdmin ? 'Administración' : 'Navegación'}
        </p>
        {(isAdmin ? adminNavigation : studentNavigation).map(({ id, label, icon: Icon }) => {
          const active = vistaActual === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onCambiarVista(id)}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
              title={label}
              className={`group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl px-2 py-3 text-left text-sm font-medium transition sm:justify-start sm:px-3 ${
                active
                  ? 'bg-gradient-to-r from-cyan-400/[0.13] to-violet-400/[0.08] text-cyan-200'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
              }`}
            >
              {active && <motion.span layoutId="sidebar-active" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-cyan-300" />}
              <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="hidden truncate sm:inline">{label}</span>
            </button>
          );
        })}
      </nav>

      {isAdmin && (
        <div className="mb-3 hidden items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2.5 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-medium text-slate-400"><Activity className="mr-1 inline h-3 w-3" />Panel conectado</span>
        </div>
      )}

      <div className="mt-2 border-t border-white/[0.07] pt-3">
        <div className="mb-2 hidden min-w-0 px-2 sm:block">
          <p className="truncate text-xs font-medium text-slate-200">{usuario.nombre}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
            {isAdmin ? 'Administrador' : 'Estudiante'}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="flex w-full items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-rose-400/[0.08] hover:text-rose-300 sm:justify-start sm:px-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </motion.aside>
  );
};
