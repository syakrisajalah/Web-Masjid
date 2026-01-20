import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Expose API_KEY to the client-side code securely
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Expose GOOGLE_SCRIPT_URL so all devices (Mobile/Desktop) can connect to the DB
      // Masukkan URL Web App Google Script Anda di file .env atau Vercel Environtment Variables dengan nama GOOGLE_SCRIPT_URL
      'process.env.GOOGLE_SCRIPT_URL': JSON.stringify(env.GOOGLE_SCRIPT_URL)
    }
  }
})
