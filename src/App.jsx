import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { ConsultationChat } from './components/chat/ConsultationChat';

// Componente principal de la aplicación
function App() {
  // Estado para controlar qué vista está activa
  const [vistaActual, setVistaActual] = useState('chat');
  // Función para reiniciar o iniciar una nueva consulta
  const handleNuevaConsulta = () => {
    setVistaActual('chat');
  };
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-darkBg text-white">
      {/* Barra lateral de navegación e historial */}
      <Sidebar 
        onNuevaConsulta={handleNuevaConsulta}
        onCambiarVista={setVistaActual}
        vistaActual={vistaActual}
      />
      {/* Contenedor principal de la vista activa */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {vistaActual === 'chat' && <ConsultationChat />}
        {vistaActual === 'courses' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-bold text-accentCyan mb-2">Catálogo de Cursos</h2>
            <p className="text-gray-400 text-sm">Próximamente visualiza y administra los cursos del backend aquí.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;