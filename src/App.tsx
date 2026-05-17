import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AboutPage } from './pages/AboutPage';
import { CharacterDetailPage } from './pages/CharacterDetailPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RpgCharacterCreationPage } from './pages/RpgCharacterCreationPage';

export default function App() {
   const location = useLocation();

   return (
      <AnimatePresence mode="popLayout" initial={false}>
         <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AppShell />}>
               <Route index element={<Navigate to="/characters" replace />} />
               <Route path="characters" element={<HomePage />} />
               <Route path="about" element={<AboutPage />} />
               <Route path="rpg" element={<RpgCharacterCreationPage />} />
               <Route path="character/:id" element={<CharacterDetailPage />} />
               <Route path="*" element={<NotFoundPage />} />
            </Route>
         </Routes>
      </AnimatePresence>
   );
}
