import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionLog, PersonaId } from '../types';

const STORAGE_KEY = 'talktomeai_sessions';
const PREF_PREFIX = 'talktomeai_pref_';

interface PersonaPreference {
  voiceName: string;
  language: string;
}

export function generateId(): string {
  // Simple ID generator for React Native if crypto is not available globally in the same way
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export async function saveSession(session: SessionLog): Promise<void> {
  try {
    const existingSessions = await getSessions();
    const updatedSessions = [session, ...existingSessions];
    // Limit to last 50 sessions
    if (updatedSessions.length > 50) {
      updatedSessions.length = 50;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export async function getSessions(): Promise<SessionLog[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const sessions = await getSessions();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
}

export async function clearAllSessions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear sessions:', error);
  }
}

export async function savePersonaPreference(personaId: PersonaId, pref: PersonaPreference): Promise<void> {
    try {
        await AsyncStorage.setItem(`${PREF_PREFIX}${personaId}`, JSON.stringify(pref));
    } catch (error) {
        console.error('Failed to save preferences:', error);
    }
}

export async function getPersonaPreference(personaId: PersonaId): Promise<PersonaPreference | null> {
    try {
        const data = await AsyncStorage.getItem(`${PREF_PREFIX}${personaId}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
}

