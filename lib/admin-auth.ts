'use client';

export interface AdminSession {
  adminId: string;
  username: string;
}

const ADMIN_SESSION_KEY = 'admin_session';

export const setAdminSession = (session: AdminSession) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  }
};

export const getAdminSession = (): AdminSession | null => {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
  return null;
};

export const clearAdminSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
};

export const isAdminAuthenticated = (): boolean => {
  return getAdminSession() !== null;
};
