import { PastWeekRecord, UserProfile, WeeklyData } from '../types';
import { getSubjectsForTrack } from '../data/tracks';
import { calculateWeeklyScore } from './scoreCalculator';
import {
  syncPastWeeksToFirebase,
  syncProfileToFirebase,
  syncWeekToFirebase,
  fetchPastWeeksFromFirebase,
  fetchWeekFromFirebase,
  fetchProfileFromFirebase,
} from './firebaseClient';

// حسابان فقط مسموح بهما في التطبيق بالكامل
export const PRESET_USERS = {
  EMY: {
    id: 'user_emy',
    name: 'Emy Ahmed',
    pin: '132026',
    track: 'SCI_MATH' as const,
    partnerName: 'Youssef Ellawaty',
    partnerPin: '132026',
    partnerTrack: 'SCI_MATH' as const,
    isLoggedIn: true,
  },
  YOUSSEF: {
    id: 'user_youssef',
    name: 'Youssef Ellawaty',
    pin: '132026',
    track: 'SCI_MATH' as const,
    partnerName: 'Emy Ahmed',
    partnerPin: '132026',
    partnerTrack: 'SCI_MATH' as const,
    isLoggedIn: true,
  },
};

export function weekKeyFor(name: string): string {
  return `week_${name.replace(/\s+/g, '_')}`;
}

export function createInitialWeeklyData(
  weekTitle: string,
  weekNumber: number,
  track: 'SCI_MATH' | 'SCI_BIO',
  customTargetDefault: number = 0
): WeeklyData {
  const subjects = getSubjectsForTrack(track);
  const subjectGoals = subjects.map((sub) => ({
    subjectId: sub.id,
    subjectNameAr: sub.nameAr,
    subjectNameEn: sub.nameEn,
    targetSessions: customTargetDefault,
    completedSessions: 0,
    iconName: sub.iconName,
    color: sub.color,
  }));

  const metrics = calculateWeeklyScore(subjectGoals);

  return {
    weekId: `week-${weekNumber}-${Date.now()}`,
    weekNumber,
    weekTitle: weekTitle || `Week ${weekNumber}`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'ACTIVE',
    subjectGoals,
    notes: '',
    lastUpdated: new Date().toISOString(),
    totalTarget: metrics.totalTarget,
    totalCompleted: metrics.totalCompleted,
    completionRate: metrics.completionRate,
    bonusPoints: metrics.bonusPoints,
    finalScore: metrics.finalScore,
  };
}

export const SEED_PAST_WEEKS: PastWeekRecord[] = [];

/* ============ كل التخزين التالي يذهب مباشرة إلى Firebase Firestore — لا يوجد أي تخزين محلي ============ */

export async function fetchRemoteProfile(profileIdOrName: string): Promise<UserProfile | null> {
  return fetchProfileFromFirebase(profileIdOrName);
}

export async function persistProfile(profile: UserProfile): Promise<void> {
  await syncProfileToFirebase(profile);
}

export async function fetchRemoteWeek(weekKey: string): Promise<WeeklyData | null> {
  return fetchWeekFromFirebase(weekKey);
}

export async function persistWeek(weekKey: string, data: WeeklyData): Promise<WeeklyData> {
  const metrics = calculateWeeklyScore(data.subjectGoals);
  const updated: WeeklyData = {
    ...data,
    totalTarget: metrics.totalTarget,
    totalCompleted: metrics.totalCompleted,
    completionRate: metrics.completionRate,
    bonusPoints: metrics.bonusPoints,
    finalScore: metrics.finalScore,
    lastUpdated: new Date().toISOString(),
  };
  await syncWeekToFirebase(weekKey, updated);
  return updated;
}

export async function fetchRemotePastWeeks(): Promise<PastWeekRecord[] | null> {
  return fetchPastWeeksFromFirebase();
}

export async function persistPastWeeks(pastWeeks: PastWeekRecord[]): Promise<void> {
  await syncPastWeeksToFirebase(pastWeeks);
}

