import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ valorInicial = 0, onChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((estrella) => (
        <button
          key={estrella}
          type="button"
          onClick={() => onChange(estrella)}
          onMouseEnter={() => setHover(estrella)}
          onMouseLeave={() => setHover(0)}
          className="p-1 focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`w-7 h-7 ${
              estrella <= (hover || valorInicial)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
};