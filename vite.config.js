import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production)
  // and make sure VITE_ prefixed variables are loaded.
  // For non-VITE_ prefixed variables like API_KEY, we need to explicitly expose them.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: process.env.VITE_BASE_PATH
    define: {
      // Expose API_KEY to client-side code under process.env.API_KEY
      // Vite normally only exposes VITE_ prefixed variables through import.meta.env
      // This 'define' configuration makes it available as process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});
