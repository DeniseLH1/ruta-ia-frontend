import React, { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout.jsx';
import { ConsultationChat } from './components/chat/ConsultationChat.jsx';
import { CourseCatalog } from './components/courses/CourseCatalog.jsx';
import { RatingModal } from './components/rating/RatingModal.jsx';

// Componente principal que controla la navegación entre vistas y el estado global de la app.
function App() {
  // Mantiene la vista activa actual: 'chat' o 'courses'.
  const [vistaActual, setVistaActual] = useState('chat');

  // Controla si el modal de calificación está abierto o cerrado.
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  // Guarda el ID de la consulta que se va a calificar.
  const [consultaACalificar, setConsultaACalificar] = useState(null);

  // Vuelve a la vista del chat cuando se inicia una nueva consulta.
  const handleNuevaConsulta = () => {
    setVistaActual('chat');
  };

  // Abre el modal de calificación y guarda la consulta seleccionada.
  const handleAbrirRating = (id) => {
    setConsultaACalificar(id);
    setRatingModalOpen(true);
  };

  return (
    // Layout general que encapsula la estructura visual de la aplicación.
    <MainLayout
      vistaActual={vistaActual}
      setVistaActual={setVistaActual}
      onNuevaConsulta={handleNuevaConsulta}
    >
      {/* Muestra el chat principal cuando la vista actual es 'chat'. */}
      {vistaActual === 'chat' && (
        <ConsultationChat onAbrirRating={handleAbrirRating} />
      )}

      {/* Muestra el catálogo de cursos cuando la vista actual es 'courses'. */}
      {vistaActual === 'courses' && <CourseCatalog />}

      {/* Modal global para calificar una consulta específica. */}
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        consultaId={consultaACalificar}
      />
    </MainLayout>
  );
}

export default App;