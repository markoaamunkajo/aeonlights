import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // <--- Make sure this comma is present!
  define: {
    'process.env.VITE_APP_EMAILJS_SERVICE_ID': JSON.stringify(process.env.VITE_APP_EMAILJS_SERVICE_ID),
    'process.env.VITE_APP_EMAILJS_TEMPLATE_ID': JSON.stringify(process.env.VITE_APP_EMAILJS_TEMPLATE_ID),
    'process.env.VITE_APP_EMAILJS_PUBLIC_KEY': JSON.stringify(process.env.VITE_APP_EMAILJS_PUBLIC_KEY),
  },
})
