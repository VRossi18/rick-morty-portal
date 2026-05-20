import { AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { RouteFallback } from './components/RouteFallback';
import { lazyPage } from './utils/lazyPage';

const HomePage = lazyPage(() => import('./pages/HomePage'), 'HomePage');
const AboutPage = lazyPage(() => import('./pages/AboutPage'), 'AboutPage');
const CharacterDetailPage = lazyPage(
   () => import('./pages/CharacterDetailPage'),
   'CharacterDetailPage',
);
const NotFoundPage = lazyPage(() => import('./pages/NotFoundPage'), 'NotFoundPage');
const RpgCharacterCreationPage = lazyPage(
   () => import('./pages/RpgCharacterCreationPage'),
   'RpgCharacterCreationPage',
);

export default function App() {
   const location = useLocation();

   return (
      <AnimatePresence mode="popLayout" initial={false}>
         <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AppShell />}>
               <Route index element={<Navigate to="/characters" replace />} />
               <Route
                  path="characters"
                  element={
                     <Suspense fallback={<RouteFallback />}>
                        <HomePage />
                     </Suspense>
                  }
               />
               <Route
                  path="about"
                  element={
                     <Suspense fallback={<RouteFallback />}>
                        <AboutPage />
                     </Suspense>
                  }
               />
               <Route
                  path="rpg"
                  element={
                     <Suspense fallback={<RouteFallback />}>
                        <RpgCharacterCreationPage />
                     </Suspense>
                  }
               />
               <Route
                  path="character/:id"
                  element={
                     <Suspense fallback={<RouteFallback />}>
                        <CharacterDetailPage />
                     </Suspense>
                  }
               />
               <Route
                  path="*"
                  element={
                     <Suspense fallback={<RouteFallback />}>
                        <NotFoundPage />
                     </Suspense>
                  }
               />
            </Route>
         </Routes>
      </AnimatePresence>
   );
}
