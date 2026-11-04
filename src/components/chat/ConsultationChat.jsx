import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { consultationService } from '../../services/consultationService.js';
import { studentService } from '../../services/studentService.js';

// Gestiona los mensajes con el backend
export const ConsultationChat = () => {
  // Almacena el texto que escribe el usuario en el input
  const [inputMensaje, setInputMensaje] = useState('');
  // Almacena el historial de mensajes
  const [mensajes, setMensajes] = useState([
    {
      id: '1',
      remitente: 'ia',
      texto: '¡Hola! Soy tu asistente inteligente de Campuslands. ¿En qué te puedo ayudar hoy con tus cursos, proyectos o dudas técnicas?',
      cursosRecomendados: []
    }
  ]);
  // Controla el indicador de "Cargando / Pensando..."
  const [cargando, setCargando] = useState(false);
  // Almacena posibles errores de la API
  const [error, setError] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(true);
  const [cargandoRegistro, setCargandoRegistro] = useState(false);
  const [errorEstudiantes, setErrorEstudiantes] = useState(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [nuevoEstudiante, setNuevoEstudiante] = useState({
    nombreCompleto: '',
    email: '',
    nivelExperiencia: 'Principiante',
    areaInteres: ''
  });
  // Referencia para hacer scroll hacia el último mensaje 
  const chatEndRef = useRef(null);
  // Para hacer scroll cada vez que cambian los mensajes
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [mensajes, cargando]);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      try {
        const lista = await studentService.obtenerEstudiantes();
        setEstudiantes(Array.isArray(lista) ? lista : []);
        const idGuardado = localStorage.getItem('rutaIA.studentId');
        const estudianteGuardado = lista.find((estudiante) =>
          String(estudiante.id || estudiante._id) === idGuardado
        );
        if (estudianteGuardado) {
          setStudentId(idGuardado);
        } else {
          localStorage.removeItem('rutaIA.studentId');
        }
      } catch (err) {
        setErrorEstudiantes(err.message || 'No se pudieron cargar los estudiantes.');
      } finally {
        setCargandoEstudiantes(false);
      }
    };

    cargarEstudiantes();
  }, []);

  const handleSeleccionarEstudiante = (id) => {
    setStudentId(id);
    if (id) {
      localStorage.setItem('rutaIA.studentId', id);
    } else {
      localStorage.removeItem('rutaIA.studentId');
    }
  };

  const handleRegistrarEstudiante = async (e) => {
    e.preventDefault();
    setErrorEstudiantes(null);
    setCargandoRegistro(true);
    try {
      const estudiante = await studentService.registrarEstudiante(nuevoEstudiante);
      const id = String(estudiante.id || estudiante._id);
      setEstudiantes((actuales) => [...actuales, estudiante]);
      handleSeleccionarEstudiante(id);
      setMostrarRegistro(false);
      setNuevoEstudiante({
        nombreCompleto: '',
        email: '',
        nivelExperiencia: 'Principiante',
        areaInteres: ''
      });
    } catch (err) {
      setErrorEstudiantes(err.message || 'No se pudo registrar el estudiante.');
    } finally {
      setCargandoRegistro(false);
    }
  };

  // Maneja el envío de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Si el input está vacío o espacios en blanco, no hara nada
    if (!studentId || !inputMensaje.trim()) return;
    const textoUsuario = inputMensaje.trim();
    setInputMensaje('');
    setError(null);
    // Creamos el objeto del mensaje del usuario y lo añadimos al estado
    const nuevoMensajeUsuario = {
      id: Date.now().toString(),
      remitente: 'usuario',
      texto: textoUsuario
    };
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setCargando(true);
    try {
      // Consumimos el servicio que conecta con el backend
      const respuestaBackend = await consultationService.enviarConsulta(studentId, textoUsuario);
      // Extrae la respuesta de la IA y los cursos recomendados
      const textoRespuesta = respuestaBackend.respuesta || respuestaBackend.mensaje || 'Respuesta generada con éxito.';
      const cursos = respuestaBackend.fuentes || respuestaBackend.cursosRecomendados || [];
      // Crea el objeto de respuesta de la IA
      const nuevoMensajeIA = {
        id: (Date.now() + 1).toString(),
        remitente: 'ia',
        texto: textoRespuesta,
        cursosRecomendados: cursos,
        consultaId: respuestaBackend._id || respuestaBackend.id
      };
      setMensajes((prev) => [...prev, nuevoMensajeIA]);
    } catch (err) {
      console.error('Error al enviar consulta:', err);
      setError(err.message || 'Ocurrió un error al comunicarse con el servidor.');
    } finally {
      setCargando(false);
    }
  };
  return (
    <div className="flex-1 flex flex-col h-screen bg-darkBg overflow-hidden">
      {/* Cabecera superior del chat */}
      <header className="px-6 py-4 bg-darkCard border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-accentPurple">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Asistente RAG & Cursos</h2>
            <p className="text-xs text-gray-400">Impulsado por Node.js, MongoDB & n8n</p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-400">
          Estudiante
          <select
            value={studentId}
            onChange={(e) => handleSeleccionarEstudiante(e.target.value)}
            disabled={cargandoEstudiantes}
            className="max-w-48 bg-gray-900 border border-gray-700 text-white rounded-lg px-2 py-2 disabled:opacity-50"
          >
            <option value="">Seleccionar</option>
            {estudiantes.map((estudiante) => {
              const id = String(estudiante.id || estudiante._id);
              return <option key={id} value={id}>{estudiante.nombreCompleto}</option>;
            })}
          </select>
        </label>
      </header>
      {!studentId ? (
        <section className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl mx-auto mt-8 bg-darkCard border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white">Identifica al estudiante</h3>
            <p className="text-sm text-gray-400 mt-2">
              Para guardar la consulta y personalizar las recomendaciones, selecciona un estudiante registrado o registra uno nuevo.
            </p>
            {errorEstudiantes && (
              <p className="mt-4 text-sm text-red-400" role="alert">{errorEstudiantes}</p>
            )}
            {cargandoEstudiantes ? (
              <p className="mt-5 text-sm text-gray-400">Cargando estudiantes...</p>
            ) : (
              <>
                {estudiantes.length > 0 && (
                  <label className="block mt-5 text-sm text-gray-300">
                    Estudiante registrado
                    <select
                      value={studentId}
                      onChange={(e) => handleSeleccionarEstudiante(e.target.value)}
                      className="mt-2 w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5"
                    >
                      <option value="">Selecciona tu nombre</option>
                      {estudiantes.map((estudiante) => {
                        const id = String(estudiante.id || estudiante._id);
                        return <option key={id} value={id}>{estudiante.nombreCompleto} ({estudiante.email})</option>;
                      })}
                    </select>
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => setMostrarRegistro((visible) => !visible)}
                  className="mt-5 text-sm text-cyan-400 hover:text-cyan-300"
                >
                  {mostrarRegistro ? 'Usar un estudiante registrado' : 'Registrar estudiante nuevo'}
                </button>
                {mostrarRegistro && (
                  <form onSubmit={handleRegistrarEstudiante} className="mt-4 space-y-3">
                    <input
                      required
                      value={nuevoEstudiante.nombreCompleto}
                      onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, nombreCompleto: e.target.value })}
                      placeholder="Nombre completo"
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5"
                    />
                    <input
                      required
                      type="email"
                      value={nuevoEstudiante.email}
                      onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, email: e.target.value })}
                      placeholder="Correo electrónico"
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5"
                    />
                    <select
                      value={nuevoEstudiante.nivelExperiencia}
                      onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, nivelExperiencia: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5"
                    >
                      <option>Principiante</option>
                      <option>Intermedio</option>
                      <option>Avanzado</option>
                    </select>
                    <input
                      required
                      value={nuevoEstudiante.areaInteres}
                      onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, areaInteres: e.target.value })}
                      placeholder="Área de interés"
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5"
                    />
                    <button
                      type="submit"
                      disabled={cargandoRegistro}
                      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 disabled:opacity-50 text-white rounded-lg px-4 py-2.5"
                    >
                      {cargandoRegistro ? 'Registrando...' : 'Registrar y continuar'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </section>
      ) : (
        <>
      {/* Contenedor principal de mensajes */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {mensajes.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 ${
                msg.remitente === 'usuario' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Icono del remitente (Avatar) */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.remitente === 'usuario'
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                }`}
              >
                {msg.remitente === 'usuario' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              {/* Burbuja de texto */}
              <div
                className={`max-w-xl rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                  msg.remitente === 'usuario'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-darkCard border border-gray-800 text-gray-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.texto}</p>
                {/* Si la respuesta trae cursos recomendados, se listan */}
                {msg.cursosRecomendados && msg.cursosRecomendados.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-800/80 space-y-2">
                    <p className="text-xs font-semibold text-accentCyan uppercase tracking-wider">
                      Cursos Recomendados:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.cursosRecomendados.map((curso, index) => (
                        <div key={index} className="bg-gray-900/60 p-2.5 rounded-lg border border-gray-800 text-xs">
                          <span className="font-bold text-white">{curso.titulo || curso.nombre}</span>
                          <p className="text-gray-400 mt-0.5 line-clamp-1">{curso.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Indicador cuando la IA está respondiendo */}
        {cargando && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-darkCard border border-gray-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-gray-400 ml-2">Consultando flujo RAG...</span>
            </div>
          </motion.div>
        )}

        {/* Mensaje de error si falla la API */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {/* Para el scroll automático */}
        <div ref={chatEndRef} />
      </div>
      {/* Footer / Input de texto para enviar mensajes */}
      <footer className="p-4 bg-darkCard border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={inputMensaje}
            onChange={(e) => setInputMensaje(e.target.value)}
            placeholder="Escribe tu consulta técnica o educativa..."
            className="flex-1 bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-accentCyan transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={cargando || !inputMensaje.trim()}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-xl shadow-md transition-all flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </footer>
        </>
      )}
    </div>
  );
};