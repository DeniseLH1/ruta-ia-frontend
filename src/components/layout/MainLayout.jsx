import React from 'react';
import { Sidebar } from './Sidebar.jsx';

export const MainLayout = ({ children, vistaActual, setVistaActual, onNuevaConsulta }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-darkBg text-white">
      <Sidebar
        vistaActual={vistaActual}
        onCambiarVista={setVistaActual}
        onNuevaConsulta={onNuevaConsulta}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
};