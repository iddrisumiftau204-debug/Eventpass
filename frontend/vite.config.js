import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['eventpass-22424830.loca.lt', 'localhost', '127.0.0.1', 'frontend-7lgo.onrender.com'],
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
