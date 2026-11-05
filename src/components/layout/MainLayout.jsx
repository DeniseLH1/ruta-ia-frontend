import React from 'react';
import { Sidebar } from './Sidebar.jsx';

export const MainLayout = ({ children, usuario, onLogout, vistaActual, setVistaActual, onNuevaConsulta }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-darkBg text-white">
      <Sidebar
        usuario={usuario}
        onLogout={onLogout}
        vistaActual={vistaActual}
        onCambiarVista={setVistaActual}
        onNuevaConsulta={onNuevaConsulta}
      />
      <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};