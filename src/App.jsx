import React, { useEffect, useState } from 'react';
import { MainLayout } from './components/layout/MainLayout.jsx';
import { ConsultationChat } from './components/chat/ConsultationChat.jsx';
import { CourseCatalog } from './components/courses/CourseCatalog.jsx';
import { RatingModal } from './components/rating/RatingModal.jsx';
import { ConsultationHistory } from './components/history/ConsultationHistory.jsx';
import { AuthPage } from './components/auth/AuthPage.jsx';
import { AdminDashboard } from './components/admin/AdminDashboard.jsx';
import { fetchApi } from './api/fetchApi.js';
import { clearSession, getSession } from './api/session.js';

// Componente principal que controla la navegación entre vistas y el estado global de la app.
function App() {
  const [session, setSession] = useState(getSession);
  const [validandoSesion, setValidandoSesion] = useState(Boolean(getSession()));
  const [vistaActual, setVistaActual] = useState('chat');

  // Controla si el modal de calificación está abierto o cerrado.
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  // Guarda el ID de la consulta que se va a calificar.
  const [consultaACalificar, setConsultaACalificar] = useState(null);
  const [historialVersion, setHistorialVersion] = useState(0);
  const [consultasCalificadas, setConsultasCalificadas] = useState(() => new Set());
  const [consultaACalificarDetalle, setConsultaACalificarDetalle] = useState(null);

  // Comprueba al cargar que el token guardado siga vigente y reacciona al vencimiento.
  useEffect(() => {
    let active = true;
    const handleSessionExpired = () => {
      clearSession();
      setSession(null);
    };
    window.addEventListener('rutaIA:session-expired', handleSessionExpired);

    if (session?.token) {
      setValidandoSesion(true);
      fetchApi('/auth/me')
        .then((user) => {
          if (active) setSession((actual) => actual ? { ...actual, user } : null);
        })
        .catch(() => {
          if (active) {
            clearSession();
            setSession(null);
          }
        })
        .finally(() => {
          if (active) setValidandoSesion(false);
        });
    } else {
      setValidandoSesion(false);
    }

    return () => {
      active = false;
      window.removeEventListener('rutaIA:session-expired', handleSessionExpired);
    };
  }, [session?.token]);

  useEffect(() => {
    if (session?.user.role === 'admin') setVistaActual('admin');
  }, [session]);

  const handleNuevaConsulta = () => {
    setVistaActual('chat');
  };

  const handleAbrirRating = (id, consulta = null) => {
    setConsultaACalificar(id);
    setConsultaACalificarDetalle(consulta);
    setRatingModalOpen(true);
  };

  const handleAuthenticate = (newSession) => {
    setSession(newSession);
    setVistaActual(newSession.user.role === 'admin' ? 'admin' : 'chat');
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setVistaActual('chat');
  };

  const handleCalificacionGuardada = () => {
    setConsultasCalificadas((actuales) => new Set(actuales).add(String(consultaACalificar)));
    setHistorialVersion((version) => version + 1);
  };

  if (validandoSesion) {
    return <div className="min-h-screen flex items-center justify-center bg-darkBg text-gray-300">Verificando sesión...</div>;
  }
  if (!session) return <AuthPage onAuthenticate={handleAuthenticate} />;

  return (
    // Layout general que encapsula la estructura visual de la aplicación.
    <MainLayout
      usuario={session.user}
      onLogout={handleLogout}
      vistaActual={vistaActual}
      setVistaActual={setVistaActual}
      onNuevaConsulta={handleNuevaConsulta}
    >
      {/* Muestra el chat principal cuando la vista actual es 'chat'. */}
      {session.user.role === 'student' && vistaActual === 'chat' && (
        <ConsultationChat
          usuario={session.user}
          onAbrirRating={handleAbrirRating}
          consultasCalificadas={consultasCalificadas}
        />
      )}

      {/* Muestra el catálogo de cursos cuando la vista actual es 'courses'. */}
      {session.user.role === 'student' && vistaActual === 'courses' && <CourseCatalog />}

      {session.user.role === 'student' && vistaActual === 'history' && (
        <ConsultationHistory
          key={historialVersion}
          studentId={session.user.id}
          onAbrirRating={handleAbrirRating}
          consultasCalificadas={consultasCalificadas}
        />
      )}
      {session.user.role === 'admin' && vistaActual === 'admin' && <AdminDashboard />}

      {/* Modal global para calificar una consulta específica. */}
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        consultaId={consultaACalificar}
        calificacionInicial={consultaACalificarDetalle?.calificacion}
        comentarioInicial={consultaACalificarDetalle?.comentario}
        onRated={handleCalificacionGuardada}
      />
    </MainLayout>
  );
}

export default App;