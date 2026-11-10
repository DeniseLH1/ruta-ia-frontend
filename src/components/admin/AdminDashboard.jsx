import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UsersRound,
  X
} from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import { LoadingSpinner } from '../common/LoadingSpinner.jsx';

const statisticCards = [
  ['totalEstudiantes', 'Estudiantes', UsersRound, 'from-violet-500/20 to-violet-500/0', 'text-violet-300'],
  ['totalCursos', 'Cursos en catálogo', GraduationCap, 'from-cyan-500/20 to-cyan-500/0', 'text-cyan-300'],
  ['cursosActivos', 'Cursos activos', BookOpen, 'from-emerald-500/20 to-emerald-500/0', 'text-emerald-300'],
  ['totalConsultas', 'Consultas realizadas', MessageCircle, 'from-amber-500/20 to-amber-500/0', 'text-amber-300']
];

const detailStatisticCards = [
  ['consultasRespondidas', 'Respondidas', CheckCircle2, 'text-emerald-300'],
  ['consultasSinResultados', 'Sin resultados', Search, 'text-amber-300'],
  ['consultasError', 'Con error', Activity, 'text-rose-300'],
  ['promedioCalificaciones', 'Calificación promedio', Star, 'text-violet-300']
];

const initialCourseForm = {
  nombre: '',
  descripcion: '',
  categoria: '',
  nivel: 'Básico',
  duración: ''
};

const consultationStates = [
  ['Respondida', 'consultasRespondidas', 'bg-emerald-400'],
  ['Sin resultados', 'consultasSinResultados', 'bg-amber-400'],
  ['Error', 'consultasError', 'bg-red-400'],
  ['Pendiente', null, 'bg-cyan-400']
];

const formatDate = (date) => {
  if (!date) return 'Fecha no disponible';
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? 'Fecha no disponible' : parsedDate.toLocaleString();
};

// Reúne métricas, historial y herramientas de administración del catálogo.
export const AdminDashboard = ({ vistaActual = 'admin', onCambiarVista = () => {} }) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cursoActualizando, setCursoActualizando] = useState('');
  const [sincronizandoCursos, setSincronizandoCursos] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cursoConfirmacion, setCursoConfirmacion] = useState(null);
  const [cursoPorEliminar, setCursoPorEliminar] = useState(null);
  const [confirmarSincronizacion, setConfirmarSincronizacion] = useState(false);
  const [modalCursoAbierto, setModalCursoAbierto] = useState(false);
  const [cursoEditando, setCursoEditando] = useState(null);
  const [formCurso, setFormCurso] = useState(initialCourseForm);
  const [filtroEstudiante, setFiltroEstudiante] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busquedaHistorial, setBusquedaHistorial] = useState('');
  const [busquedaEstudiantes, setBusquedaEstudiantes] = useState('');

  const cargarPanel = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [stats, listaCursos, listaEstudiantes, listaHistorial] = await Promise.all([
        adminService.obtenerEstadisticas(),
        adminService.obtenerCursos(),
        adminService.obtenerEstudiantes(),
        adminService.obtenerHistorial()
      ]);
      const cursosActuales = Array.isArray(listaCursos) ? listaCursos : [];
      setEstadisticas({
        ...stats,
        totalEstudiantes: Array.isArray(listaEstudiantes) ? listaEstudiantes.length : 0,
        totalCursos: cursosActuales.length,
        cursosActivos: cursosActuales.filter((course) => course.estado === 'activo').length
      });
      setCursos(cursosActuales);
      setEstudiantes(Array.isArray(listaEstudiantes) ? listaEstudiantes : []);
      setHistorial(Array.isArray(listaHistorial) ? listaHistorial : []);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo cargar el panel administrativo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPanel();
  }, [cargarPanel]);

  const historialFiltrado = useMemo(() => {
    const termino = busquedaHistorial.trim().toLocaleLowerCase();
    return historial.filter((consulta) => {
      const studentId = String(consulta.studentId?._id || consulta.studentId || '');
      const studentName = consulta.estudianteNombre
        || estudiantes.find((student) => String(student._id || student.id) === studentId)?.nombreCompleto
        || '';
      const coincideEstudiante = !filtroEstudiante || studentId === filtroEstudiante;
      const coincideEstado = !filtroEstado || consulta.estado === filtroEstado;
      const coincideBusqueda = !termino
        || `${studentName} ${consulta.mensaje || ''} ${consulta.respuesta || ''}`.toLocaleLowerCase().includes(termino);
      return coincideEstudiante && coincideEstado && coincideBusqueda;
    });
  }, [busquedaHistorial, estudiantes, filtroEstado, filtroEstudiante, historial]);

  const estudiantesFiltrados = useMemo(() => {
    const termino = busquedaEstudiantes.trim().toLocaleLowerCase();
    return estudiantes.filter((student) => (
      `${student.nombreCompleto || ''} ${student.email || ''} ${student.areaInteres || ''} ${student.nivelExperiencia || ''}`
        .toLocaleLowerCase()
        .includes(termino)
    ));
  }, [busquedaEstudiantes, estudiantes]);

  // Resume consultas y valoraciones para cada estudiante.
  const metricasEstudiantes = useMemo(() => {
    const metricas = new Map();
    historial.forEach((consulta) => {
      const studentId = String(consulta.studentId?._id || consulta.studentId || '');
      const actual = metricas.get(studentId) || { consultas: 0, calificaciones: 0, sumaCalificaciones: 0 };
      actual.consultas += 1;
      if (Number.isFinite(consulta.calificacion)) {
        actual.calificaciones += 1;
        actual.sumaCalificaciones += consulta.calificacion;
      }
      metricas.set(studentId, actual);
    });
    return metricas;
  }, [historial]);

  const abrirFormularioCurso = (curso = null) => {
    setError('');
    setCursoEditando(curso);
    setFormCurso(curso ? {
      nombre: curso.nombre || '',
      descripcion: curso.descripcion || '',
      categoria: curso.categoria || '',
      nivel: curso.nivel || 'Básico',
      duración: curso.duración ?? ''
    } : initialCourseForm);
    setModalCursoAbierto(true);
  };

  const handleGuardarCurso = async (event) => {
    event.preventDefault();
    setCursoActualizando('formulario');
    setError('');
    const datosCurso = { ...formCurso, duración: Number(formCurso.duración) };
    try {
      if (cursoEditando) {
        await adminService.actualizarCurso(cursoEditando._id || cursoEditando.id, datosCurso);
      } else {
        await adminService.crearCurso(datosCurso);
      }
      setModalCursoAbierto(false);
      await cargarPanel();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo guardar el curso.');
    } finally {
      setCursoActualizando('');
    }
  };

  const handleCambiarEstadoCurso = async (curso, reactivar) => {
    setCursoConfirmacion({ curso, reactivar });
  };

  const confirmarCambioCurso = async () => {
    if (!cursoConfirmacion) return;
    const { curso, reactivar } = cursoConfirmacion;
    const id = String(curso._id || curso.id);
    setCursoActualizando(id);
    setError('');
    setAviso('');
    try {
      if (reactivar) await adminService.reactivarCurso(id);
      else await adminService.desactivarCurso(id);
      if (reactivar) {
        setAviso('Curso reactivado y enviado al flujo de indexación.');
      }
      await cargarPanel();
    } catch (requestError) {
      setError(requestError.message || `No se pudo ${reactivar ? 'reactivar' : 'desactivar'} el curso.`);
    } finally {
      setCursoActualizando('');
      setCursoConfirmacion(null);
    }
  };

  const confirmarEliminarCurso = async () => {
    if (!cursoPorEliminar) return;
    const id = String(cursoPorEliminar._id || cursoPorEliminar.id);
    setCursoActualizando(id);
    setError('');
    setAviso('');
    try {
      await adminService.eliminarCurso(id);
      setAviso('Curso eliminado del catálogo y del índice de recomendaciones.');
      await cargarPanel();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo eliminar el curso.');
    } finally {
      setCursoActualizando('');
      setCursoPorEliminar(null);
    }
  };

  const handleSincronizarCursos = async () => {
    setSincronizandoCursos(true);
    setError('');
    setAviso('');
    try {
      const resultado = await adminService.sincronizarCursos();
      setAviso(`Índice actualizado: ${resultado.indexed} cursos activos sincronizados.`);
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron sincronizar los cursos con Qdrant.');
    } finally {
      setSincronizandoCursos(false);
      setConfirmarSincronizacion(false);
    }
  };

  const verHistorialEstudiante = (student) => {
    setFiltroEstudiante(String(student._id || student.id));
    setFiltroEstado('');
    setBusquedaHistorial('');
    onCambiarVista('admin-history');
  };

  const consultasPendientes = historial.filter((consulta) => consulta.estado === 'Pendiente').length;
  const totalConsultas = Number(estadisticas?.totalConsultas) || 0;
  const activeCourses = cursos.filter((course) => course.estado === 'activo');
  const pageDetails = {
    admin: ['Resumen general', 'Una mirada rápida al movimiento de tu plataforma.'],
    'admin-stats': ['Estadísticas', 'Indicadores para entender el uso y la actividad de Ruta IA.'],
    'admin-courses': ['Gestión de cursos', 'Administra el catálogo y mantén la oferta al día.'],
    'admin-students': ['Estudiantes', 'Consulta el registro, la actividad y las calificaciones de cada estudiante.'],
    'admin-history': ['Historial de consultas', 'Explora las consultas realizadas por tus estudiantes.']
  };
  const [pageTitle, pageDescription] = pageDetails[vistaActual] || pageDetails.admin;

  return (
    <section className="relative flex-1 overflow-y-auto bg-[#090e18] px-4 py-5 text-white sm:px-6 sm:py-7 lg:px-9">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-36 -top-40 h-[28rem] w-[28rem] rounded-full bg-cyan-500/[0.045] blur-3xl" />
        <div className="absolute -bottom-48 left-1/4 h-[26rem] w-[26rem] rounded-full bg-violet-600/[0.045] blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-cyan-300/80">
              <ShieldCheck className="h-3.5 w-3.5" /> Ruta IA · Administración
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{pageTitle}</h1>
            <p className="mt-1 text-sm text-slate-400">{pageDescription}</p>
          </div>
          <button
            type="button"
            onClick={cargarPanel}
            disabled={cargando}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-300/20 hover:bg-white/[0.07] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </header>

        <AnimatePresence initial={false}>
          {error && !modalCursoAbierto && (
            <motion.p
              key="admin-error"
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.07] p-4 text-sm text-rose-200"
            >
              {error}
            </motion.p>
          )}
          {aviso && (
            <motion.div
              key="admin-notice"
              role="status"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm text-cyan-100"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <span>{aviso}</span>
              <button type="button" onClick={() => setAviso('')} aria-label="Cerrar aviso" className="ml-auto text-cyan-100/60 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {cargando && <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] py-10"><LoadingSpinner texto="Preparando tu panel..." /></div>}

        {!cargando && estadisticas && (
          <AnimatePresence mode="wait">
            <motion.div
              key={vistaActual}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-6"
            >
              {vistaActual === 'admin' && (
                <>
                  <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/[0.09] bg-gradient-to-br from-[#17263b] via-[#111a2b] to-[#17142b] p-6 sm:p-8">
                    <motion.div
                      aria-hidden="true"
                      className="absolute -right-10 -top-20 -z-10 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl"
                      animate={{ x: [0, -18, 0], y: [0, 14, 0] }}
                      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      aria-hidden="true"
                      className="absolute -bottom-36 right-1/3 -z-10 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl"
                      animate={{ x: [0, 16, 0], y: [0, -12, 0] }}
                      transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
                      <div className="max-w-2xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-200/[0.07] px-3 py-1.5 text-xs font-medium text-cyan-100">
                          <Sparkles className="h-3.5 w-3.5" /> Tu centro de control académico
                        </div>
                        <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                          Todo lo importante, <span className="bg-gradient-to-r from-cyan-200 to-violet-300 bg-clip-text text-transparent">en un solo lugar.</span>
                        </h2>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300/80">
                          Revisa la actividad de tus estudiantes, mantén los cursos al día y descubre cómo evoluciona la plataforma.
                        </p>
                        <button
                          type="button"
                          onClick={() => onCambiarVista('admin-stats')}
                          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-50"
                        >
                          Explorar estadísticas <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:min-w-64">
                        <div className="rounded-2xl border border-white/[0.09] bg-black/15 p-4 backdrop-blur">
                          <p className="text-xs text-slate-400">Consultas pendientes</p>
                          <p className="mt-2 text-3xl font-semibold text-white">{consultasPendientes}</p>
                          <p className="mt-1 text-[11px] text-cyan-200/70">Por revisar</p>
                        </div>
                        <div className="rounded-2xl border border-white/[0.09] bg-black/15 p-4 backdrop-blur">
                          <p className="text-xs text-slate-400">Valoración media</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Star className="h-5 w-5 fill-amber-300 text-amber-300" />
                            <span className="text-3xl font-semibold text-white">{estadisticas.promedioCalificaciones ?? 0}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-amber-200/70">De 5 estrellas</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section aria-label="Resumen de la plataforma" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statisticCards.map(([key, title, Icon, gradient, iconColor], index) => (
                      <motion.article
                        key={key}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.3 }}
                        whileHover={{ y: -3 }}
                        className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101725] p-5 transition-colors hover:border-white/[0.13]"
                      >
                        <div className={`pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${gradient}`} />
                        <div className="relative flex items-start justify-between">
                          <div>
                            <p className="text-sm text-slate-400">{title}</p>
                            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{estadisticas[key] ?? 0}</p>
                          </div>
                          <span className={`rounded-xl bg-white/[0.05] p-2.5 ${iconColor}`}><Icon className="h-5 w-5" /></span>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                          <span>Datos actuales</span>
                        </div>
                      </motion.article>
                    ))}
                  </section>

                  <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <article className="rounded-2xl border border-white/[0.07] bg-[#101725] p-5 sm:p-6">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                          <h2 className="font-semibold text-white">Actividad reciente</h2>
                          <p className="mt-1 text-xs text-slate-500">Últimas consultas de estudiantes</p>
                        </div>
                        <button type="button" onClick={() => onCambiarVista('admin-history')} className="inline-flex items-center gap-1 text-xs font-medium text-cyan-200 transition hover:text-white">
                          Ver historial <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {historial.slice(0, 4).map((consulta) => (
                          <div key={consulta._id || consulta.id} className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-white/[0.035]">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-300/[0.08] text-cyan-200">
                              <MessageCircle className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-1 text-sm text-slate-200">{consulta.mensaje || 'Consulta sin texto'}</p>
                              <p className="mt-1 text-xs text-slate-500">{consulta.estudianteNombre || 'Estudiante'} · {formatDate(consulta.fecha)}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-white/[0.05] px-2 py-1 text-[10px] text-slate-400">{consulta.estado || 'Pendiente'}</span>
                          </div>
                        ))}
                        {historial.length === 0 && <p className="rounded-xl bg-white/[0.025] p-5 text-sm text-slate-500">Todavía no hay consultas registradas.</p>}
                      </div>
                    </article>

                    <article className="rounded-2xl border border-white/[0.07] bg-[#101725] p-5 sm:p-6">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <h2 className="font-semibold text-white">Accesos rápidos</h2>
                          <p className="mt-1 text-xs text-slate-500">Continúa con tus tareas</p>
                        </div>
                        <Sparkles className="h-4 w-4 text-violet-300" />
                      </div>
                      <div className="space-y-3">
                        {[
                          ['admin-courses', BookOpen, 'Gestionar cursos', `${cursos.length} cursos en catálogo`, 'text-cyan-200', 'bg-cyan-300/[0.08]'],
                          ['admin-students', UsersRound, 'Ver estudiantes', `${estudiantes.length} estudiantes registrados`, 'text-violet-200', 'bg-violet-300/[0.08]'],
                          ['admin-history', Clock3, 'Consultar historial', `${historial.length} consultas registradas`, 'text-cyan-200', 'bg-cyan-300/[0.08]'],
                          ['admin-stats', BarChart3, 'Ver estadísticas', 'Indicadores y valoraciones', 'text-amber-200', 'bg-amber-300/[0.08]']
                        ].map(([view, Icon, title, description, color, iconBg]) => (
                          <button
                            key={view}
                            type="button"
                            onClick={() => onCambiarVista(view)}
                            className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5 text-left transition hover:border-white/[0.12] hover:bg-white/[0.045]"
                          >
                            <span className={`rounded-xl p-2.5 ${iconBg} ${color}`}><Icon className="h-4 w-4" /></span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-slate-200">{title}</span>
                              <span className="mt-0.5 block truncate text-xs text-slate-500">{description}</span>
                            </span>
                            <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 rounded-xl border border-emerald-300/10 bg-emerald-300/[0.04] p-3.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Cursos disponibles</span>
                          <span className="font-medium text-emerald-200">{activeCourses.length} activos</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: cursos.length ? `${(activeCourses.length / cursos.length) * 100}%` : '0%' }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300"
                          />
                        </div>
                      </div>
                    </article>
                  </section>
                </>
              )}

              {vistaActual === 'admin-stats' && (
                <>
                  <section aria-label="Estadísticas de la plataforma" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statisticCards.map(([key, title, Icon, gradient, iconColor], index) => (
                      <motion.article
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101725] p-5"
                      >
                        <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${gradient}`} />
                        <div className="relative flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-400">{title}</p>
                            <p className="mt-3 text-3xl font-semibold text-white">{estadisticas[key] ?? 0}</p>
                          </div>
                          <Icon className={`h-5 w-5 ${iconColor}`} />
                        </div>
                      </motion.article>
                    ))}
                  </section>

                  <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                    <article className="rounded-2xl border border-white/[0.07] bg-[#101725] p-5 sm:p-6">
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <h2 className="font-semibold text-white">Estado de las consultas</h2>
                          <p className="mt-1 text-xs text-slate-500">Distribución de {totalConsultas} consultas registradas</p>
                        </div>
                        <span className="rounded-xl bg-cyan-300/[0.08] p-2 text-cyan-200"><Activity className="h-4 w-4" /></span>
                      </div>
                      <div className="space-y-5">
                        {consultationStates.map(([label, statKey, color], index) => {
                          const count = statKey ? Number(estadisticas[statKey]) || 0 : consultasPendientes;
                          const percentage = totalConsultas ? Math.min((count / totalConsultas) * 100, 100) : 0;
                          return (
                            <div key={label}>
                              <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-slate-300">{label}</span>
                                <span className="text-slate-400">{count} <span className="ml-1 text-xs text-slate-600">{percentage.toFixed(0)}%</span></span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.7, delay: index * 0.08, ease: 'easeOut' }}
                                  className={`h-full rounded-full ${color}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </article>
                    <article className="relative overflow-hidden rounded-2xl border border-violet-300/10 bg-gradient-to-br from-violet-500/[0.12] to-[#101725] p-6">
                      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-400/[0.12] blur-3xl" />
                      <div className="relative">
                        <span className="inline-flex rounded-xl bg-amber-300/[0.1] p-2.5 text-amber-200"><Star className="h-5 w-5 fill-amber-200/20" /></span>
                        <p className="mt-6 text-sm text-slate-400">Calificación promedio</p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-5xl font-semibold tracking-tight text-white">{estadisticas.promedioCalificaciones ?? 0}</span>
                          <span className="text-sm text-slate-500">/ 5</span>
                        </div>
                        <div className="mt-3 flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-4 w-4 ${star <= Math.round(Number(estadisticas.promedioCalificaciones) || 0) ? 'fill-amber-300 text-amber-300' : 'text-slate-700'}`} />
                          ))}
                        </div>
                        <div className="mt-7 border-t border-white/[0.08] pt-5">
                          <p className="text-xs text-slate-500">Curso más recomendado</p>
                          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-violet-100">
                            <GraduationCap className="h-4 w-4 text-violet-300" />
                            {estadisticas.cursoMasRecomendado || 'Sin recomendaciones todavía'}
                          </p>
                        </div>
                      </div>
                    </article>
                  </section>
                  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {detailStatisticCards.map(([key, label, Icon, color]) => (
                      <article key={key} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#101725] p-5">
                        <span className={`rounded-xl bg-white/[0.05] p-3 ${color}`}><Icon className="h-5 w-5" /></span>
                        <div>
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="mt-1 text-xl font-semibold text-white">{estadisticas[key] ?? 0}</p>
                        </div>
                      </article>
                    ))}
                  </section>
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <BarChart3 className="h-4 w-4 text-cyan-300/70" />
                    Los indicadores conservan las consultas que los estudiantes ocultaron de su historial personal.
                  </p>
                </>
              )}

              {vistaActual === 'admin-students' && (
                <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101725]">
                  <header className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] p-5 sm:p-6">
                    <span className="rounded-xl bg-violet-300/[0.08] p-2.5 text-violet-200"><UsersRound className="h-5 w-5" /></span>
                    <div>
                      <h2 className="font-semibold text-white">Estudiantes registrados</h2>
                      <p className="mt-1 text-xs text-slate-500">{estudiantesFiltrados.length} de {estudiantes.length} estudiantes</p>
                    </div>
                  </header>
                  <label className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4 text-slate-500 sm:px-6">
                    <Search className="h-4 w-4" />
                    <input
                      type="search"
                      value={busquedaEstudiantes}
                      onChange={(event) => setBusquedaEstudiantes(event.target.value)}
                      placeholder="Buscar por nombre, correo, interés o nivel"
                      aria-label="Buscar estudiantes"
                      className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
                    />
                  </label>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-sm">
                      <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.14em] text-slate-500">
                        <tr>
                          <th className="px-5 py-4 font-medium">Estudiante</th>
                          <th className="px-5 py-4 font-medium">Interés / nivel</th>
                          <th className="px-5 py-4 font-medium">Consultas</th>
                          <th className="px-5 py-4 font-medium">Calificaciones</th>
                          <th className="px-5 py-4 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estudiantesFiltrados.map((student) => {
                          const id = String(student._id || student.id);
                          const metricas = metricasEstudiantes.get(id) || { consultas: 0, calificaciones: 0, sumaCalificaciones: 0 };
                          const promedio = metricas.calificaciones
                            ? (metricas.sumaCalificaciones / metricas.calificaciones).toFixed(1)
                            : '—';
                          return (
                            <tr key={id} className="border-t border-white/[0.05] text-slate-300 hover:bg-white/[0.02]">
                              <td className="px-5 py-4">
                                <p className="font-medium text-slate-100">{student.nombreCompleto}</p>
                                <p className="mt-1 text-xs text-slate-500">{student.email}</p>
                              </td>
                              <td className="px-5 py-4">
                                <p className="text-slate-300">{student.areaInteres || 'Sin área indicada'}</p>
                                <p className="mt-1 text-xs text-slate-500">{student.nivelExperiencia || 'Sin nivel indicado'}</p>
                              </td>
                              <td className="px-5 py-4">{metricas.consultas}</td>
                              <td className="px-5 py-4">
                                <span className="text-amber-200">{metricas.calificaciones} valoraciones</span>
                                <span className="ml-2 text-xs text-slate-500">Promedio {promedio}/5</span>
                              </td>
                              <td className="px-5 py-4">
                                <button
                                  type="button"
                                  onClick={() => verHistorialEstudiante(student)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/15 px-3 py-2 text-xs text-cyan-100 transition hover:bg-cyan-300/[0.07]"
                                >
                                  <Clock3 className="h-3.5 w-3.5" /> Ver historial
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {estudiantesFiltrados.length === 0 && (
                          <tr><td colSpan="5" className="px-5 py-12 text-center text-slate-500">
                            {estudiantes.length ? 'No encontramos estudiantes con esa búsqueda.' : 'Aún no hay estudiantes registrados.'}
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {vistaActual === 'admin-courses' && (
                <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101725]">
                  <header className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] p-5 sm:p-6">
                    <span className="rounded-xl bg-cyan-300/[0.08] p-2.5 text-cyan-200"><BookOpen className="h-5 w-5" /></span>
                    <div>
                      <h2 className="font-semibold text-white">Catálogo de cursos</h2>
                      <p className="mt-1 text-xs text-slate-500">{activeCourses.length} activos · {cursos.length - activeCourses.length} inactivos</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmarSincronizacion(true)}
                      disabled={sincronizandoCursos || Boolean(cursoActualizando)}
                      className="ml-auto flex items-center gap-2 rounded-xl border border-cyan-300/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/[0.06] disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${sincronizandoCursos ? 'animate-spin' : ''}`} />
                      {sincronizandoCursos ? 'Sincronizando...' : 'Sincronizar Qdrant'}
                    </button>
                    <button
                      type="button"
                      onClick={() => abrirFormularioCurso()}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-950/20 transition hover:brightness-110"
                    >
                      <Plus className="h-4 w-4" /> Crear curso
                    </button>
                  </header>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[880px] text-left text-sm">
                      <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.14em] text-slate-500">
                        <tr>
                          <th className="px-6 py-4 font-medium">Curso</th>
                          <th className="px-6 py-4 font-medium">Categoría</th>
                          <th className="px-6 py-4 font-medium">Nivel</th>
                          <th className="px-6 py-4 font-medium">Estado</th>
                          <th className="px-6 py-4 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cursos.map((curso) => {
                          const id = String(curso._id || curso.id);
                          const actualizando = cursoActualizando === id;
                          const activo = curso.estado === 'activo';
                          return (
                            <tr key={id} className="border-t border-white/[0.05] text-slate-300 transition hover:bg-white/[0.02]">
                              <td className="px-6 py-4 font-medium text-slate-100">{curso.nombre}</td>
                              <td className="px-6 py-4 text-slate-400">{curso.categoria}</td>
                              <td className="px-6 py-4 text-slate-400">{curso.nivel}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${activo ? 'bg-emerald-400/[0.08] text-emerald-200' : 'bg-slate-700/50 text-slate-400'}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${activo ? 'bg-emerald-300' : 'bg-slate-500'}`} />
                                  {curso.estado || 'Sin estado'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={actualizando}
                                    onClick={() => abrirFormularioCurso(curso)}
                                    aria-label={`Editar ${curso.nombre}`}
                                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.09] px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.06] hover:text-cyan-100 disabled:opacity-50"
                                  >
                                    <Pencil className="h-3.5 w-3.5" /> Editar
                                  </button>
                                  <button
                                    type="button"
                                    disabled={actualizando}
                                    onClick={() => handleCambiarEstadoCurso(curso, !activo)}
                                    className={`rounded-lg border px-2.5 py-1.5 text-xs transition disabled:opacity-50 ${
                                      activo
                                        ? 'border-rose-300/10 text-rose-200/80 hover:bg-rose-300/[0.06]'
                                        : 'border-emerald-300/10 text-emerald-200 hover:bg-emerald-300/[0.06]'
                                    }`}
                                  >
                                    {actualizando ? 'Guardando...' : activo ? 'Desactivar' : 'Reactivar'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={actualizando}
                                    onClick={() => setCursoPorEliminar(curso)}
                                    aria-label={`Eliminar ${curso.nombre}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300/10 px-2.5 py-1.5 text-xs text-rose-200/80 transition hover:bg-rose-300/[0.06] disabled:opacity-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {cursos.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Aún no hay cursos en el catálogo.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {vistaActual === 'admin-history' && (
                <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101725]">
                  <header className="flex items-center gap-3 border-b border-white/[0.06] p-5 sm:p-6">
                    <span className="rounded-xl bg-violet-300/[0.08] p-2.5 text-violet-200"><Clock3 className="h-5 w-5" /></span>
                    <div>
                      <h2 className="font-semibold text-white">Historial de consultas</h2>
                      <p className="mt-1 text-xs text-slate-500">{historialFiltrado.length} de {historial.length} consultas</p>
                    </div>
                  </header>
                  <div className="grid gap-3 border-b border-white/[0.06] p-5 md:grid-cols-[1fr_1fr_1.5fr]">
                    <label className="text-xs font-medium text-slate-400">
                      Estudiante
                      <select
                        value={filtroEstudiante}
                        onChange={(event) => setFiltroEstudiante(event.target.value)}
                        className="mt-1.5 block w-full rounded-xl border border-white/[0.08] bg-[#0b111d] px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-cyan-300/40"
                      >
                        <option value="">Todos los estudiantes</option>
                        {estudiantes.map((student) => <option key={student._id || student.id} value={student._id || student.id}>{student.nombreCompleto}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-slate-400">
                      Estado
                      <select
                        value={filtroEstado}
                        onChange={(event) => setFiltroEstado(event.target.value)}
                        className="mt-1.5 block w-full rounded-xl border border-white/[0.08] bg-[#0b111d] px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-cyan-300/40"
                      >
                        <option value="">Todos los estados</option>
                        {consultationStates.map(([label]) => <option key={label} value={label}>{label}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-slate-400">
                      Buscar
                      <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b111d] px-3">
                        <Search className="h-4 w-4 text-slate-500" />
                        <input
                          type="search"
                          value={busquedaHistorial}
                          onChange={(event) => setBusquedaHistorial(event.target.value)}
                          placeholder="Nombre o texto de la consulta"
                          className="w-full bg-transparent py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600"
                        />
                      </span>
                    </label>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.14em] text-slate-500">
                        <tr>
                          <th className="px-5 py-4 font-medium">Fecha</th>
                          <th className="px-5 py-4 font-medium">Estudiante</th>
                          <th className="px-5 py-4 font-medium">Consulta</th>
                          <th className="px-5 py-4 font-medium">Estado</th>
                          <th className="px-5 py-4 font-medium">Calificación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialFiltrado.map((consulta) => {
                          const studentId = String(consulta.studentId?._id || consulta.studentId || '');
                          const student = estudiantes.find((item) => String(item._id || item.id) === studentId);
                          return (
                            <tr key={consulta._id || consulta.id} className="border-t border-white/[0.05] align-top text-slate-300 hover:bg-white/[0.02]">
                              <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{formatDate(consulta.fecha)}</td>
                              <td className="px-5 py-4 text-slate-200">{consulta.estudianteNombre || student?.nombreCompleto || 'Estudiante'}</td>
                              <td className="max-w-md px-5 py-4">
                                <p className="line-clamp-2 whitespace-pre-wrap text-slate-300">{consulta.mensaje || 'Sin pregunta'}</p>
                                {consulta.archivedAt && <span className="mt-1 inline-block text-[11px] text-slate-500">Oculta del historial del estudiante</span>}
                              </td>
                              <td className="px-5 py-4">
                                <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-slate-300">{consulta.estado || 'Sin estado'}</span>
                              </td>
                              <td className="px-5 py-4 text-amber-200">
                                {consulta.calificacion ? (
                                  <>
                                    <p>{consulta.calificacion}/5</p>
                                    {consulta.comentario && <p className="mt-1 max-w-xs whitespace-pre-wrap text-xs text-slate-400">{consulta.comentario}</p>}
                                  </>
                                ) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                        {historialFiltrado.length === 0 && <tr><td colSpan="5" className="px-5 py-12 text-center text-slate-500">No encontramos consultas con esos filtros.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {modalCursoAbierto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-form-title"
            className="my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#101725] shadow-2xl shadow-black/40"
          >
            <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
            <div className="p-6 sm:p-7">
              <header className="mb-5 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/70">Catálogo académico</p>
                  <h2 id="course-form-title" className="text-xl font-semibold text-white">
                    {cursoEditando ? 'Editar curso' : 'Crear curso'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setModalCursoAbierto(false)}
                  aria-label="Cerrar formulario"
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>
              {error && (
                <p role="alert" className="mb-4 rounded-xl border border-rose-300/15 bg-rose-300/[0.07] p-3 text-sm text-rose-200">
                  {error}
                </p>
              )}
              <form onSubmit={handleGuardarCurso} className="space-y-4">
              <label className="block text-sm text-gray-300">
                Nombre
                <input
                  required
                  value={formCurso.nombre}
                  onChange={(event) => setFormCurso((form) => ({ ...form, nombre: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b111d] px-3 py-2.5 text-white outline-none transition focus:border-cyan-300/40"
                />
              </label>
              <label className="block text-sm text-gray-300">
                Descripción
                <textarea
                  required
                  rows="3"
                  value={formCurso.descripcion}
                  onChange={(event) => setFormCurso((form) => ({ ...form, descripcion: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b111d] px-3 py-2.5 text-white outline-none transition focus:border-cyan-300/40"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-gray-300">
                  Categoría
                  <input
                    required
                    value={formCurso.categoria}
                    onChange={(event) => setFormCurso((form) => ({ ...form, categoria: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b111d] px-3 py-2.5 text-white outline-none transition focus:border-cyan-300/40"
                  />
                </label>
                <label className="block text-sm text-gray-300">
                  Nivel
                  <select
                    required
                    value={formCurso.nivel}
                    onChange={(event) => setFormCurso((form) => ({ ...form, nivel: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b111d] px-3 py-2.5 text-white outline-none transition focus:border-cyan-300/40"
                  >
                    <option>Básico</option>
                    <option>Intermedio</option>
                    <option>Avanzado</option>
                  </select>
                </label>
              </div>
              <label className="block text-sm text-gray-300">
                Duración (horas)
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={formCurso.duración}
                  onChange={(event) => setFormCurso((form) => ({ ...form, duración: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0b111d] px-3 py-2.5 text-white outline-none transition focus:border-cyan-300/40"
                />
              </label>
                <footer className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
                <button
                  type="button"
                  onClick={() => setModalCursoAbierto(false)}
                  className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.05]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cursoActualizando === 'formulario'}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {cursoActualizando === 'formulario' ? 'Guardando...' : cursoEditando ? 'Guardar cambios' : 'Crear curso'}
                </button>
              </footer>
              </form>
            </div>
          </section>
        </motion.div>
      )}
      <ConfirmDialog
        isOpen={Boolean(cursoConfirmacion)}
        title={cursoConfirmacion?.reactivar ? 'Reactivar este curso' : 'Desactivar este curso'}
        message={cursoConfirmacion?.reactivar
          ? `¿Quieres reactivar “${cursoConfirmacion.curso?.nombre}” para que vuelva a estar disponible en el catálogo?`
          : `¿Quieres desactivar “${cursoConfirmacion?.curso?.nombre}”? Ya no estará disponible para recomendaciones.`}
        confirmLabel={cursoConfirmacion?.reactivar ? 'Sí, reactivar curso' : 'Sí, desactivar curso'}
        variant={cursoConfirmacion?.reactivar ? 'default' : 'danger'}
        loading={Boolean(cursoConfirmacion && cursoActualizando)}
        onConfirm={confirmarCambioCurso}
        onCancel={() => setCursoConfirmacion(null)}
      />
      <ConfirmDialog
        isOpen={Boolean(cursoPorEliminar)}
        title="Eliminar curso definitivamente"
        message={`¿Eliminar “${cursoPorEliminar?.nombre}” del catálogo? También se solicitará retirar su vector del índice y esta acción no se puede deshacer.`}
        confirmLabel="Eliminar curso"
        variant="danger"
        loading={Boolean(cursoPorEliminar && cursoActualizando)}
        onConfirm={confirmarEliminarCurso}
        onCancel={() => setCursoPorEliminar(null)}
      />
      <ConfirmDialog
        isOpen={confirmarSincronizacion}
        title="Reconstruir índice de cursos"
        message="Se retirarán todos los vectores actuales de cursos_ia y se volverán a crear con los cursos activos de MongoDB. Confirma que el workflow Indexacion_Cursos actualizado ya está importado y activo."
        confirmLabel="Reconstruir índice"
        loading={sincronizandoCursos}
        onConfirm={handleSincronizarCursos}
        onCancel={() => setConfirmarSincronizacion(false)}
      />
    </section>
  );
};
