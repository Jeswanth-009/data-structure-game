import { GameSession } from '@/types/game';

const SESSION_KEY = 'detective_session';

export const saveSession = (session: GameSession): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
};

export const getSession = (): GameSession | null => {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
  return null;
};

export const clearSession = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  return getSession() !== null;
};
