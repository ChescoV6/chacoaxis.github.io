import { useCallback, useLayoutEffect, useState } from 'react';

export type QuizTheme = 'light' | 'dark';

const STORAGE_KEY = '12axes:quiz-theme';
const ATTRIBUTE = 'data-quiz-theme';

/** O padrão é o claro; só a escolha guardada do usuário liga o escuro. */
export function resolveQuizTheme(stored: string | null): QuizTheme {
  return stored === 'dark' ? 'dark' : 'light';
}

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Tema escuro só enquanto o quiz está na tela (`active`). O atributo vai no <html> e não no
 * app-shell porque o painel (?) e o tooltip do glossário renderizam fora dele.
 */
export function useQuizTheme(active: boolean) {
  const [theme, setTheme] = useState<QuizTheme>(() => resolveQuizTheme(readStored()));

  // useLayoutEffect: aplica antes da primeira pintura, para o quiz não piscar claro.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (active && theme === 'dark') {
      root.setAttribute(ATTRIBUTE, 'dark');
    } else {
      root.removeAttribute(ATTRIBUTE);
    }
    return () => root.removeAttribute(ATTRIBUTE);
  }, [active, theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: QuizTheme = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Navegação privada ou armazenamento bloqueado: a escolha vale só nesta sessão.
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
