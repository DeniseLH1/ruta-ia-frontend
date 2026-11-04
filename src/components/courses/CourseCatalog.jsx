import React, { useEffect, useState } from 'react';
import { courseService } from '../../services/courseService.js';
import { CourseCard } from './CourseCard';
import { LoadingSpinner } from '../common/LoadingSpinner.jsx';
import { BookOpen, RefreshCw } from 'lucide-react';

export const CourseCatalog = () => {
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [nivel, setNivel] = useState('');

  const cargarCursos = async () => {
    setCargando(true);
    setError(null);
    try {
      const lista = await courseService.obtenerCursos({
        ...(categoria && { categoria }),
        ...(nivel && { nivel })
      });
      setCursos(Array.isArray(lista) ? lista : []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los cursos desde la base de datos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, [categoria, nivel]);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-darkBg">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-accentCyan" />
              Catálogo de Cursos
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Explora los módulos de capacitación disponibles en Campuslands.
            </p>
          </div>
          <button
            onClick={cargarCursos}
            aria-label="Actualizar catálogo"
            title="Actualizar catálogo"
            className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="text-sm text-gray-300">
            Categoría
            <input
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Todas las categorías"
              className="mt-1 block w-full sm:w-64 bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2"
            />
          </label>
          <label className="text-sm text-gray-300">
            Nivel
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="mt-1 block w-full sm:w-48 bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2"
            >
              <option value="">Todos los niveles</option>
              <option value="Básico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </label>
        </div>

        {cargando && <LoadingSpinner texto="Cargando catálogo de cursos..." />}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {!cargando && !error && (
          cursos.length === 0
            ? <p className="text-sm text-gray-400">No hay cursos activos que coincidan con los filtros.</p>
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursos.map((curso) => (
                <CourseCard key={curso._id || curso.id} curso={curso} />
              ))}
            </div>
        )}
      </div>
    </div>
  );
};