import React, { useCallback, useEffect, useState } from 'react';
import { Clock3, RefreshCw } from 'lucide-react';
import { consultationService } from '../../services/consultationService.js';
import { LoadingSpinner } from '../common/LoadingSpinner.jsx';

const formatDate = (date) => {
  if (!date) return 'Fecha no disponible';
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? 'Fecha no disponible'
    : parsedDate.toLocaleString();
};

export const ConsultationHistory = ({ studentId, onAbrirRating, consultasCalificadas }) => {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eliminandoId, setEliminandoId] = useState('');

  const cargarHistorial = useCallback(async () => {
    if (!studentId) {
      setHistorial([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const consultas = await consultationService.obtenerHistorialEstudiante();
      setHistorial(Array.isArray(consultas) ? consultas : []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial.');
    } finally {
      setCargando(false);
    }
  }, [studentId]);

  const handleEliminar = async (consultaId) => {
    if (!window.confirm('¿Eliminar esta consulta de tu historial? Se conservará para las estadísticas.')) return;
    setEliminandoId(String(consultaId));
    setError(null);
    try {
      await consultationService.eliminarConsulta(consultaId);
      await cargarHistorial();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo eliminar la consulta.');
    } finally {
      setEliminandoId('');
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  return (
    <section className="flex-1 overflow-y-auto p-6 md:p-8 bg-darkBg">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-gray-800 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Clock3 className="w-7 h-7 text-accentCyan" />
              Historial de consultas
            </h2>
            <p className="text-sm text-gray-400 mt-1">Preguntas, respuestas, fuentes y estado de cada consulta.</p>
          </div>
          <button
            type="button"
            onClick={cargarHistorial}
            aria-label="Actualizar historial"
            className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </header>

        {!studentId && (
          <p className="rounded-xl border border-gray-800 bg-darkCard p-5 text-sm text-gray-300">
            Inicia sesión con tu cuenta de estudiante para consultar tu historial.
          </p>
        )}
        {cargando && <LoadingSpinner texto="Cargando historial..." />}
        {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
        {!cargando && !error && studentId && historial.length === 0 && (
          <p className="rounded-xl border border-gray-800 bg-darkCard p-5 text-sm text-gray-300">
            Este estudiante aún no tiene consultas.
          </p>
        )}

        {!cargando && historial.map((consulta) => (
          <article key={consulta._id || consulta.id} className="rounded-2xl border border-gray-800 bg-darkCard p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-400">{formatDate(consulta.fecha)}</p>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gray-900 px-3 py-1 text-xs text-cyan-300">{consulta.estado || 'Sin estado'}</span>
                <button
                  type="button"
                  disabled={eliminandoId === String(consulta._id || consulta.id)}
                  onClick={() => handleEliminar(consulta._id || consulta.id)}
                  className="rounded-md border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                >
                  {eliminandoId === String(consulta._id || consulta.id) ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pregunta</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-white">{consulta.mensaje}</p>
            </div>
            {consulta.respuesta && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Recomendación</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-200">{consulta.respuesta}</p>
              </div>
            )}
            {consulta.errorDetalle && <p className="text-sm text-red-300">{consulta.errorDetalle}</p>}
            {consulta.fuentes?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Fuentes</h3>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {consulta.fuentes.map((fuente, index) => (
                    <li key={fuente.id || fuente.mongo_id || index} className="rounded-lg border border-gray-800 bg-gray-900/70 p-3">
                      <p className="text-sm font-semibold text-white">{fuente.nombre || fuente.payload?.nombre || 'Curso recomendado'}</p>
                      {(fuente.descripcion || fuente.payload?.descripcion) && (
                        <p className="mt-1 text-xs text-gray-400">{fuente.descripcion || fuente.payload?.descripcion}</p>
                      )}
                      {(fuente.categoria || fuente.payload?.categoria) && (
                        <p className="mt-2 text-xs text-cyan-300">{fuente.categoria || fuente.payload?.categoria}</p>
                      )}
                      {typeof (fuente.similitud ?? fuente.score) === 'number' && (
                        <p className="mt-1 text-xs text-gray-500">Similitud: {Number(fuente.similitud ?? fuente.score).toFixed(3)}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {consulta.estado === 'Respondida' && !consulta.calificacion && !consultasCalificadas?.has(String(consulta._id || consulta.id)) && (
              <button
                type="button"
                onClick={() => onAbrirRating(consulta._id || consulta.id)}
                className="text-sm text-amber-300 hover:text-amber-200"
              >
                Calificar esta respuesta
              </button>
            )}
            {consulta.calificacion && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-amber-300">Calificación: {consulta.calificacion}/5</p>
                  {consulta.comentario && <p className="mt-1 text-sm text-gray-400">{consulta.comentario}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => onAbrirRating(consulta._id || consulta.id, consulta)}
                  className="text-sm text-cyan-300 hover:text-cyan-200"
                >
                  Editar mi calificación
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
