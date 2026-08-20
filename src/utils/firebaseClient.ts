/**
 * Firebase Client Integration for DuoTracker.
 * Provides real-time synchronization, cloud storage, and robust error handling
 * using Google Cloud Firestore and Firebase.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Firestore,
  Unsubscribe,
} from 'firebase/firestore';
import { PastWeekRecord, UserProfile, WeeklyData } from '../types';
import { WeekScheduleConfig } from './schedule';

// Load default config from firebase-applet-config.json or fallback
let defaultFirebaseConfig: any = null;
try {
  // @ts-ignore
  import('../../firebase-applet-config.json').then((module) => {
    defaultFirebaseConfig = module.default || module;
  });
} catch (e) {
  console.warn('Could not statically import firebase-applet-config.json', e);
}

export interface FirebaseConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain?: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  isConnected: boolean;
}

const FIREBASE_CONFIG_KEY = 'duotracker_firebase_config_v1';

// Default provisioned configuration for the app
export const PROVISIONED_FIREBASE_CONFIG = {
  projectId: "micro-affinity-0zp2g",
  appId: "1:403489024649:web:39bc457166b914d2827458",
  apiKey: "AIzaSyBC5FO1fkx9zaUJFCeMQsQDsJzRwuTov5g",
  authDomain: "micro-affinity-0zp2g.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-duotracker-4f1331a8-0adb-4acf-a1f7-ddb3dc98ef3a",
  storageBucket: "micro-affinity-0zp2g.firebasestorage.app",
  messagingSenderId: "403489024649",
};

export function getFirebaseConfig(): FirebaseConfig {
  // Check local override first
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.projectId && parsed.apiKey && parsed.appId) {
        return {
          ...parsed,
          isConnected: true,
        };
      }
    }
  } catch (e) {
    console.error('Failed to load Firebase config from localStorage', e);
  }

  // Fallback to provisioned config
  return {
    ...PROVISIONED_FIREBASE_CONFIG,
    isConnected: true,
  };
}

export function saveFirebaseConfig(config: Partial<FirebaseConfig>): void {
  try {
    const current = getFirebaseConfig();
    const updated = {
      ...current,
      ...config,
      isConnected: Boolean(config.projectId && config.apiKey && config.appId),
    };
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(updated));
    cachedApp = null;
    cachedDb = null;
  } catch (e) {
    console.error('Failed to save Firebase config', e);
  }
}

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (cachedApp) return cachedApp;

  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId || !config.appId) {
    return null;
  }

  try {
    if (getApps().length > 0) {
      cachedApp = getApp();
    } else {
      cachedApp = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`,
        projectId: config.projectId,
        storageBucket: config.storageBucket || `${config.projectId}.appspot.com`,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });
    }
    return cachedApp;
  } catch (e) {
    console.error('Failed to initialize Firebase App:', e);
    return null;
  }
}

export function getFirebaseDb(): Firestore | null {
  if (cachedDb) return cachedDb;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    const config = getFirebaseConfig();
    if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
      cachedDb = getFirestore(app, config.firestoreDatabaseId);
    } else {
      cachedDb = getFirestore(app);
    }
    return cachedDb;
  } catch (e) {
    console.error('Failed to initialize Firestore DB:', e);
    return null;
  }
}

// ----------------------------------------------------
// Firestore Sync & Query Operations
// ----------------------------------------------------

/**
 * Syncs weekly goals and progress for a user to Firestore
 */
export async function syncWeekToFirebase(
  weekKey: string,
  weekData: WeeklyData
): Promise<{ success: boolean; error?: string }> {
  const db = getFirebaseDb();
  if (!db) return { success: false, error: 'Firebase Firestore not initialized' };

  try {
    const weekDocRef = doc(db, 'duotracker_weeks', weekKey);
    await setDoc(weekDocRef, {
      id: weekKey,
      week_data: weekData,
      updated_at: new Date().toISOString(),
    }, { merge: true });

    return { success: true };
  } catch (err: any) {
    console.error('Firebase auto-sync week error:', err);
    return { success: false, error: err?.message || 'Firestore write error' };
  }
}

/**
 * Fetches weekly data for a user from Firestore
 */
export async function fetchWeekFromFirebase(weekKey: string): Promise<WeeklyData | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const weekDocRef = doc(db, 'duotracker_weeks', weekKey);
    const snap = await getDoc(weekDocRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    return (data?.week_data as WeeklyData) || null;
  } catch (err) {
    console.warn('Firebase fetch week failed:', err);
    return null;
  }
}

/**
 * Saves and syncs the schedule configuration (periods) to Firestore
 */
export async function syncScheduleToFirebase(schedule: WeekScheduleConfig): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    const scheduleDocRef = doc(db, 'duotracker_weeks', 'schedule_config_global');
    await setDoc(scheduleDocRef, {
      id: 'schedule_config_global',
      week_data: schedule,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Firebase sync schedule failed:', err);
  }
}

/**
 * Fetches the global schedule configuration from Firestore
 */
export async function fetchScheduleFromFirebase(): Promise<WeekScheduleConfig | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const scheduleDocRef = doc(db, 'duotracker_weeks', 'schedule_config_global');
    const snap = await getDoc(scheduleDocRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    const weekData = data?.week_data as WeekScheduleConfig;
    if (!weekData || !Array.isArray(weekData.periods)) {
      return { periods: [] };
    }
    return weekData;
  } catch (err) {
    console.warn('Firebase fetch schedule failed:', err);
    return null;
  }
}

/**
 * Syncs the past weeks history & Hall of Fame to Firestore
 */
export async function syncPastWeeksToFirebase(pastWeeks: PastWeekRecord[]): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    const historyDocRef = doc(db, 'duotracker_history', 'past_weeks_global');
    await setDoc(historyDocRef, {
      id: 'past_weeks_global',
      records: pastWeeks,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Firebase sync history failed:', err);
  }
}

/**
 * Fetches the past weeks history from Firestore
 */
export async function fetchPastWeeksFromFirebase(): Promise<PastWeekRecord[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const historyDocRef = doc(db, 'duotracker_history', 'past_weeks_global');
    const snap = await getDoc(historyDocRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    return (data?.records as PastWeekRecord[]) || [];
  } catch (err) {
    console.warn('Firebase fetch past weeks failed:', err);
    return null;
  }
}

/**
 * Syncs a user profile (track, partner, pin) to Firestore
 */
export async function syncProfileToFirebase(profile: UserProfile): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    const profileId = profile.id || `profile_${profile.name.replace(/\s+/g, '_')}`;
    const profileDocRef = doc(db, 'duotracker_profiles', profileId);
    await setDoc(profileDocRef, {
      id: profileId,
      name: profile.name,
      pin: profile.pin,
      track: profile.track,
      partner_name: profile.partnerName,
      partner_pin: profile.partnerPin,
      partner_track: profile.partnerTrack,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Firebase sync profile failed:', err);
  }
}

/**
 * Fetches a user profile from Firestore
 */
export async function fetchProfileFromFirebase(profileIdOrName: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const profileId = profileIdOrName.startsWith('user_')
      ? profileIdOrName
      : `profile_${profileIdOrName.replace(/\s+/g, '_')}`;

    const profileDocRef = doc(db, 'duotracker_profiles', profileId);
    const snap = await getDoc(profileDocRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      id: data.id,
      name: data.name,
      pin: data.pin,
      track: data.track,
      partnerName: data.partner_name,
      partnerPin: data.partner_pin,
      partnerTrack: data.partner_track,
      isLoggedIn: true,
    };
  } catch (err) {
    console.warn('Firebase fetch profile failed:', err);
    return null;
  }
}

/**
 * Real-time Document Listener via Firestore onSnapshot
 */
export function subscribeToFirebaseDoc(
  collectionName: 'duotracker_weeks' | 'duotracker_history' | 'duotracker_profiles',
  docId: string,
  onData: (data: any) => void
): Unsubscribe {
  const db = getFirebaseDb();
  if (!db) return () => {};

  try {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.data());
        }
      },
      (error) => {
        console.warn(`Firestore snapshot error for ${collectionName}/${docId}:`, error);
      }
    );
  } catch (e) {
    console.error('Failed to subscribe to Firestore document:', e);
    return () => {};
  }
}

/**
 * Tests the connection to Firebase Firestore by writing and reading a lightweight handshake test document.
 */
export async function testFirebaseConnection(): Promise<{ success: boolean; message: string }> {
  const db = getFirebaseDb();
  if (!db) {
    return { success: false, message: 'تعذر تهيئة اتصال Firebase. تأكد من صحة إعدادات المشروع.' };
  }

  try {
    const testDocRef = doc(db, 'duotracker_system', 'connection_test');
    await setDoc(testDocRef, {
      test: true,
      timestamp: new Date().toISOString(),
      agent: 'DuoTracker Realtime Client',
    });

    const snap = await getDoc(testDocRef);
    if (snap.exists()) {
      return {
        success: true,
        message: '✅ تم الاتصال بنجاح بقاعدة بيانات Firebase Firestore والمزامنة جاهزة!',
      };
    }
    return { success: false, message: '❌ تعذر التحقق من قراءة سجل الاختبار من Firebase.' };
  } catch (err: any) {
    console.error('Firebase test connection error:', err);
    return {
      success: false,
      message: `❌ خطأ أثناء الاتصال بـ Firebase: ${err?.message || 'تعذر الوصول لقاعدة البيانات'}`,
    };
  }
}
