import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const GITHUB_PAGES_BASE = '/rick-and-morty-portal/';

export default defineConfig({
   base: process.env.NODE_ENV === 'production' ? GITHUB_PAGES_BASE : '/',
   plugins: [react(), tailwindcss()],
});
