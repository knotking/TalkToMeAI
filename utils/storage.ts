import { SessionLog, PersonaId } from '../types';

const STORAGE_KEY = 'talktomeai_sessions';
const PREF_PREFIX = 'talktomeai_pref_';

interface PersonaPreference {
  voiceName: string;
  language: string;
}

export function saveSession(session: SessionLog): void {
  try {
    const existingSessions = getSessions();
    const updatedSessions = [session, ...existingSessions];
    // Limit to last 50 sessions to prevent storage overflow
    if (updatedSessions.length > 50) {
      updatedSessions.length = 50;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function getSessions(): SessionLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
}

export function deleteSession(sessionId: string): void {
  try {
    const sessions = getSessions();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
}

export function clearAllSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function savePersonaPreference(personaId: PersonaId, pref: PersonaPreference): void {
    try {
        localStorage.setItem(`${PREF_PREFIX}${personaId}`, JSON.stringify(pref));
    } catch (error) {
        console.error('Failed to save preferences:', error);
    }
}

export function getPersonaPreference(personaId: PersonaId): PersonaPreference | null {
    try {
        const data = localStorage.getItem(`${PREF_PREFIX}${personaId}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
}