import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const GITHUB_PAGES_BASE = '/rick-and-morty-portal/';

/** Cloud Run serves at `/`; GitHub Pages uses the repo subpath. */
const productionBase = process.env.VITE_BASE ?? GITHUB_PAGES_BASE;

export default defineConfig({
   base: process.env.NODE_ENV === 'production' ? productionBase : '/',
   plugins: [react(), tailwindcss()],
});
