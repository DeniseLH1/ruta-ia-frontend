import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración oficial de Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
});