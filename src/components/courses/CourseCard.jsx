import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Code2 } from 'lucide-react';
import { Badge } from '../common/Badge';

export const CourseCard = ({ curso }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-darkCard border border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:border-gray-700 transition-all"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge color="purple">{curso.nivel || 'General'}</Badge>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{curso.duracionHoras ? `${curso.duracionHoras}h` : 'N/A'}</span>
          </div>
        </div>

        <h3 className="font-bold text-white text-base mb-2 line-clamp-1">{curso.titulo}</h3>
        <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-3">{curso.descripcion}</p>
      </div>

      <div>
        {curso.tecnologias && curso.tecnologias.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-800">
            {curso.tecnologias.map((tech, idx) => (
              <span key={idx} className="bg-gray-900 text-gray-300 text-[10px] px-2 py-0.5 rounded border border-gray-800 flex items-center gap-1">
                <Code2 className="w-3 h-3 text-accentCyan" />
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};