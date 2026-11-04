const SESSION_KEY = 'rutaIA.session';

// Mantiene token e identidad juntos y elimina el formato antiguo basado en selección.
export function getSession() {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored);
    if (!session.token || !session.user?.id || !session.user?.role) return null;
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.removeItem('rutaIA.studentId');
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('rutaIA.studentId');
}
