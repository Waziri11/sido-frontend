import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
export default defineConfig({ plugins: [react()], resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } }, server: { host: '127.0.0.1', port: 5173, proxy: { '/api': 'http://127.0.0.1:5001' } }, build: { rollupOptions: { output: { manualChunks: { charts: ['recharts'], forms: ['react-hook-form', 'zod', '@hookform/resolvers'], vendor: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'axios'] } } } }, test: { environment: 'jsdom' } })
