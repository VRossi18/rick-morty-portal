import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './config/wagmi';
import './i18n';
import './index.css';
import './styles/not-found.css';
import App from './App.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <WagmiProvider config={wagmiConfig}>
         <QueryClientProvider client={queryClient}>
            {/* basename: mesmo path do Vite (import.meta.env.BASE_URL) para GitHub Pages em subpasta */}
            <BrowserRouter basename={import.meta.env.BASE_URL}>
               <App />
            </BrowserRouter>
         </QueryClientProvider>
      </WagmiProvider>
   </StrictMode>,
);
