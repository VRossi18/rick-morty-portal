import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './index.css';
import './styles/not-found.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      {/* basename: mesmo path do Vite (import.meta.env.BASE_URL) para GitHub Pages em subpasta */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
         <App />
      </BrowserRouter>
   </StrictMode>,
);
