import { useCallback, useEffect, useRef, useState } from 'react';
import {
   normalizeCuriosityLocale,
   resolveAiApiUrl,
   type CuriosityLocale,
} from '../config/ai';

interface FetchCuriosityOptions {
   characterId: number;
   locale: CuriosityLocale;
   question?: string;
}

async function requestCharacterCuriosity({
   characterId,
   locale,
   question,
}: FetchCuriosityOptions): Promise<string> {
   const apiUrl = resolveAiApiUrl();
   if (!apiUrl) {
      throw new Error('AI_NOT_CONFIGURED');
   }

   const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
         characterId,
         locale,
         ...(question ? { question } : {}),
      }),
   });

   if (!response.ok) {
      throw new Error('FETCH_FAILED');
   }

   const data = (await response.json()) as { text?: string };
   if (!data.text) {
      throw new Error('FETCH_FAILED');
   }

   return data.text;
}

export function useCharacterCuriosity(characterId: number, language: string) {
   const locale = normalizeCuriosityLocale(language);
   const isConfigured = Boolean(resolveAiApiUrl());
   const [text, setText] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(isConfigured);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);
   const lastQuestionRef = useRef<string | undefined>(undefined);

   useEffect(() => {
      if (!isConfigured) {
         return;
      }

      let cancelled = false;
      lastQuestionRef.current = undefined;

      void (async () => {
         try {
            const result = await requestCharacterCuriosity({ characterId, locale });
            if (!cancelled) {
               setText(result);
               setErrorMessage(null);
            }
         } catch (err) {
            if (!cancelled) {
               const code = err instanceof Error ? err.message : '';
               setErrorMessage(code === 'AI_NOT_CONFIGURED' ? 'AI_NOT_CONFIGURED' : 'FETCH_FAILED');
            }
         } finally {
            if (!cancelled) {
               setIsLoading(false);
            }
         }
      })();

      return () => {
         cancelled = true;
      };
   }, [characterId, isConfigured, locale]);

   const runRequest = useCallback(
      async (question?: string) => {
         setIsLoading(true);
         setErrorMessage(null);

         try {
            const result = await requestCharacterCuriosity({
               characterId,
               locale,
               question,
            });
            setText(result);
         } catch (err) {
            const code = err instanceof Error ? err.message : '';
            setErrorMessage(code === 'AI_NOT_CONFIGURED' ? 'AI_NOT_CONFIGURED' : 'FETCH_FAILED');
            throw err;
         } finally {
            setIsLoading(false);
         }
      },
      [characterId, locale],
   );

   const askQuestion = useCallback(
      async (question: string) => {
         const trimmed = question.trim();
         if (!trimmed) {
            throw new Error('EMPTY_QUESTION');
         }

         lastQuestionRef.current = trimmed;
         await runRequest(trimmed);
      },
      [runRequest],
   );

   const retry = useCallback(async () => {
      await runRequest(lastQuestionRef.current);
   }, [runRequest]);

   return {
      text,
      isLoading,
      errorMessage,
      askQuestion,
      retry,
   };
}
