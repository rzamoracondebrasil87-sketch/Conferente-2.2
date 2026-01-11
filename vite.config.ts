import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Ensure API key is loaded from .env
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  
  if (!apiKey && mode === 'production') {
    console.warn('⚠️ Warning: GEMINI_API_KEY not found in environment variables');
  }

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      open: true
    },
    plugins: [react()],
    publicDir: 'public',
    define: {
      // Make GEMINI_API_KEY available to the app in multiple ways
      'process.env.REACT_APP_GEMINI_API_KEY': JSON.stringify(apiKey),
      'process.env.API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
      __GEMINI_API_KEY__: JSON.stringify(apiKey),
      'window.__GEMINI_API_KEY__': JSON.stringify(apiKey)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    },
    build: {
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false
        }
      }
    }
  };
});
