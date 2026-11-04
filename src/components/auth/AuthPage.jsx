import React, { useState } from 'react';
import { authService } from '../../services/authService.js';

// Ofrece registro e inicio de sesión; el rol de administrador usa credenciales del servidor.
export const AuthPage = ({ onAuthenticate }) => {
  const [modo, setModo] = useState('student-login');
  const [formulario, setFormulario] = useState({
    nombreCompleto: '',
    email: '',
    username: '',
    password: '',
    nivelExperiencia: 'Principiante',
    areaInteres: ''
  });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const actualizar = (campo, valor) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setEnviando(true);
    try {
      let session;
      if (modo === 'register') {
        session = await authService.registrarEstudiante(formulario);
      } else if (modo === 'admin-login') {
        session = await authService.iniciarSesionAdmin(formulario.username, formulario.password);
      } else {
        session = await authService.iniciarSesionEstudiante(formulario.email, formulario.password);
      }
      onAuthenticate(session);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo completar el acceso.');
    } finally {
      setEnviando(false);
    }
  };

  const esRegistro = modo === 'register';
  const esAdmin = modo === 'admin-login';

  return (
    <main className="min-h-screen flex items-center justify-center bg-darkBg px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-800 bg-darkCard p-7 shadow-xl">
        <p className="text-sm font-semibold text-cyan-300">RutaIA</p>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {esRegistro ? 'Crear cuenta de estudiante' : esAdmin ? 'Acceso de administración' : 'Iniciar sesión'}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {esRegistro ? 'Tus consultas e historial quedarán asociados a tu cuenta.' : 'Ingresa para continuar.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {esRegistro && (
            <>
              <input
                required
                value={formulario.nombreCompleto}
                onChange={(event) => actualizar('nombreCompleto', event.target.value)}
                placeholder="Nombre completo"
                autoComplete="name"
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white"
              />
              <select
                value={formulario.nivelExperiencia}
                onChange={(event) => actualizar('nivelExperiencia', event.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white"
              >
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
              <input
                required
                value={formulario.areaInteres}
                onChange={(event) => actualizar('areaInteres', event.target.value)}
                placeholder="Área de interés"
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white"
              />
            </>
          )}

          {esAdmin ? (
            <input
              required
              value={formulario.username}
              onChange={(event) => actualizar('username', event.target.value)}
              placeholder="Usuario administrador"
              autoComplete="username"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white"
            />
          ) : (
            <input
              required
              type="email"
              value={formulario.email}
              onChange={(event) => actualizar('email', event.target.value)}
              placeholder="Correo electrónico"
              autoComplete="email"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white"
            />
          )}

          <input
            required
            minLength={esRegistro ? 8 : undefined}
            type="password"
            value={formulario.password}
            onChange={(event) => actualizar('password', event.target.value)}
            placeholder="Contraseña"
            autoComplete={esRegistro ? 'new-password' : 'current-password'}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white"
          />

          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {enviando ? 'Procesando...' : esRegistro ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          {!esAdmin && (
            <button
              type="button"
              onClick={() => { setModo(esRegistro ? 'student-login' : 'register'); setError(''); }}
              className="text-cyan-300 hover:text-cyan-200"
            >
              {esRegistro ? 'Ya tengo cuenta' : 'Crear cuenta de estudiante'}
            </button>
          )}
          <button
            type="button"
            onClick={() => { setModo(esAdmin ? 'student-login' : 'admin-login'); setError(''); }}
            className="text-gray-400 hover:text-white"
          >
            {esAdmin ? 'Acceso de estudiante' : 'Acceso administrador'}
          </button>
        </div>
      </section>
    </main>
  );
};
