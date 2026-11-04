import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, BookOpen, RefreshCw, ShieldCheck } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { LoadingSpinner } from '../common/LoadingSpinner.jsx';

const statisticCards = [
  ['totalEstudiantes', 'Estudiantes registrados'],
  ['totalCursos', 'Cursos registrados'],
  ['cursosActivos', 'Cursos activos'],
  ['totalConsultas', 'Consultas totales'],
  ['consultasRespondidas', 'Respondidas'],
  ['consultasSinResultados', 'Sin resultados'],
  ['consultasError', 'Con error'],
  ['promedioCalificaciones', 'Promedio de calificación']
];

// Reúne métricas y permite al administrador retirar cursos del catálogo.
export const AdminDashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cursoActualizando, setCursoActualizando] = useState('');
  const [error, setError] = useState('');

  const cargarPanel = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [stats, listaCursos, listaEstudiantes] = await Promise.all([
        adminService.obtenerEstadisticas(),
        adminService.obtenerCursos(),
        adminService.obtenerEstudiantes()
      ]);
      setEstadisticas({
        ...stats,
        totalEstudiantes: Array.isArray(listaEstudiantes) ? listaEstudiantes.length : 0,
        totalCursos: Array.isArray(listaCursos) ? listaCursos.length : 0,
        cursosActivos: Array.isArray(listaCursos)
          ? listaCursos.filter((course) => course.estado === 'activo').length
          : 0
      });
      setCursos(Array.isArray(listaCursos) ? listaCursos : []);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo cargar el panel administrativo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPanel();
  }, [cargarPanel]);

  const handleDesactivar = async (curso) => {
    const confirmado = window.confirm(`¿Desactivar "${curso.nombre}"? Dejará de recomendarse.`);
    if (!confirmado) return;

    setCursoActualizando(String(curso._id || curso.id));
    setError('');
    try {
      await adminService.desactivarCurso(curso._id || curso.id);
      setCursoActualizando('');
      await cargarPanel();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo desactivar el curso.');
      setCursoActualizando('');
    }
  };

  return (
    <section className="flex-1 overflow-y-auto bg-darkBg p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-7">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-white">
              <ShieldCheck className="h-7 w-7 text-cyan-300" />
              Panel administrativo
            </h1>
            <p className="mt-1 text-sm text-gray-400">Estadísticas y gestión del catálogo.</p>
          </div>
          <button
            type="button"
            onClick={cargarPanel}
            disabled={cargando}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" /> Actualizar
          </button>
        </header>

        {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
        {cargando && <LoadingSpinner texto="Cargando datos administrativos..." />}

        {!cargando && estadisticas && (
          <>
            <section aria-label="Estadísticas de consultas" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statisticCards.map(([key, title]) => (
                <article key={key} className="rounded-xl border border-gray-800 bg-darkCard p-5">
                  <p className="text-sm text-gray-400">{title}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{estadisticas[key] ?? 0}</p>
                </article>
              ))}
              <article className="rounded-xl border border-gray-800 bg-darkCard p-5">
                <p className="text-sm text-gray-400">Curso más recomendado</p>
                <p className="mt-2 text-lg font-semibold text-cyan-200">{estadisticas.cursoMasRecomendado || 'Ninguno'}</p>
              </article>
            </section>

            <section className="rounded-xl border border-gray-800 bg-darkCard">
              <header className="flex items-center gap-2 border-b border-gray-800 p-5">
                <BookOpen className="h-5 w-5 text-cyan-300" />
                <h2 className="font-semibold text-white">Gestión de cursos</h2>
                <span className="ml-auto text-sm text-gray-400">{cursos.length} cursos</span>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Curso</th>
                      <th className="px-5 py-3">Categoría</th>
                      <th className="px-5 py-3">Nivel</th>
                      <th className="px-5 py-3">Estado</th>
                      <th className="px-5 py-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursos.map((curso) => {
                      const id = String(curso._id || curso.id);
                      return (
                        <tr key={id} className="border-t border-gray-800 text-gray-200">
                          <td className="px-5 py-3 font-medium">{curso.nombre}</td>
                          <td className="px-5 py-3">{curso.categoria}</td>
                          <td className="px-5 py-3">{curso.nivel}</td>
                          <td className="px-5 py-3">{curso.estado}</td>
                          <td className="px-5 py-3">
                            {curso.estado === 'activo' ? (
                              <button
                                type="button"
                                disabled={cursoActualizando === id}
                                onClick={() => handleDesactivar(curso)}
                                className="rounded-md border border-red-500/30 px-3 py-1.5 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                              >
                                {cursoActualizando === id ? 'Desactivando...' : 'Desactivar'}
                              </button>
                            ) : <span className="text-gray-500">Sin acciones</span>}
                          </td>
                        </tr>
                      );
                    })}
                    {cursos.length === 0 && (
                      <tr><td colSpan="5" className="px-5 py-8 text-center text-gray-400">No hay cursos registrados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="flex items-center gap-2 text-xs text-gray-500">
              <BarChart3 className="h-4 w-4" />
              Las estadísticas conservan los datos de consultas que los estudiantes ocultaron de su historial.
            </p>
          </>
        )}
      </div>
    </section>
  );
};
