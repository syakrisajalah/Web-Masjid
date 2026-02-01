import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Memuat variabel lingkungan. Parameter ketiga '' memuat semua variabel tanpa filter prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Sesuai info user: Menggunakan VITE_API_KEY untuk API Key Gemini
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || ""),
      // Sesuai info user: Menggunakan GOOGLE_SCRIPT_URL untuk Database
      'process.env.GOOGLE_SCRIPT_URL': JSON.stringify(env.GOOGLE_SCRIPT_URL || env.VITE_GOOGLE_SCRIPT_URL || "")
    }
  }
})