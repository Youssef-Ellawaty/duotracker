import { PastWeekRecord, TrackType, UserBacklogData, UserProfile, UserUrtTrackerData, UrtRow, WeeklyData } from '../types';
import { getSubjectsForTrack } from '../data/tracks';
import { calculateWeeklyScore } from './scoreCalculator';
import {
  syncPastWeeksToFirebase,
  syncProfileToFirebase,
  syncWeekToFirebase,
  syncBacklogToFirebase,
  syncUrtToFirebase,
  fetchPastWeeksFromFirebase,
  fetchWeekFromFirebase,
  fetchProfileFromFirebase,
  fetchBacklogFromFirebase,
  fetchUrtFromFirebase,
} from './firebaseClient';

// حسابان فقط مسموح بهما في التطبيق بالكامل
export const PRESET_USERS = {
  EMY: {
    id: 'user_emy',
    name: 'Emy Ahmed',
    pin: '132026',
    track: 'SCI_BIO' as const,
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
    partnerTrack: 'SCI_BIO' as const,
    isLoggedIn: true,
  },
};

export function getTrackForName(name?: string, fallbackTrack?: 'SCI_MATH' | 'SCI_BIO'): 'SCI_MATH' | 'SCI_BIO' {
  if (!name) return fallbackTrack || 'SCI_MATH';
  const lower = name.toLowerCase();
  if (lower.includes('emy') || lower.includes('إيمي') || lower.includes('ahmed') || lower.includes('bio')) {
    return 'SCI_BIO';
  }
  if (lower.includes('youssef') || lower.includes('يوسف') || lower.includes('ellawaty') || lower.includes('math')) {
    return 'SCI_MATH';
  }
  return fallbackTrack || 'SCI_MATH';
}

export function weekKeyFor(name: string): string {
  return `week_${name.replace(/\s+/g, '_')}`;
}

export function backlogKeyFor(name: string): string {
  return `backlog_${name.replace(/\s+/g, '_')}`;
}

export function urtKeyFor(name: string): string {
  return `urt_${name.replace(/\s+/g, '_')}`;
}

export interface UrtTableConfig {
  key: string;
  nameAr: string;
  nameEn: string;
  shortName: string;
  iconName: string;
  color: string;
  accentBg: string;
  borderColor: string;
}

export function getUrtTablesForTrack(track: TrackType): UrtTableConfig[] {
  if (track === 'SCI_MATH') {
    return [
      {
        key: 'physics',
        nameAr: 'فيزياء',
        nameEn: 'Physics',
        shortName: 'Physics',
        iconName: 'Zap',
        color: 'from-amber-500 to-yellow-600',
        accentBg: 'bg-amber-500/10 text-amber-300',
        borderColor: 'border-amber-500/30',
      },
      {
        key: 'chemistry',
        nameAr: 'كيمياء',
        nameEn: 'Chemistry',
        shortName: 'Chemistry',
        iconName: 'FlaskConical',
        color: 'from-emerald-500 to-teal-600',
        accentBg: 'bg-emerald-500/10 text-emerald-300',
        borderColor: 'border-emerald-500/30',
      },
      {
        key: 'math',
        nameAr: 'ماث (رياضيات بحتة)',
        nameEn: 'Pure Math',
        shortName: 'Math',
        iconName: 'Calculator',
        color: 'from-cyan-500 to-blue-600',
        accentBg: 'bg-cyan-500/10 text-cyan-300',
        borderColor: 'border-cyan-500/30',
      },
      {
        key: 'mechanics',
        nameAr: 'ميكا (ميكانيكا تطبيقية)',
        nameEn: 'Mechanics',
        shortName: 'Meca',
        iconName: 'Cog',
        color: 'from-indigo-500 to-purple-600',
        accentBg: 'bg-indigo-500/10 text-indigo-300',
        borderColor: 'border-indigo-500/30',
      },
    ];
  } else {
    return [
      {
        key: 'physics',
        nameAr: 'فيزياء',
        nameEn: 'Physics',
        shortName: 'Physics',
        iconName: 'Zap',
        color: 'from-amber-500 to-yellow-600',
        accentBg: 'bg-amber-500/10 text-amber-300',
        borderColor: 'border-amber-500/30',
      },
      {
        key: 'chemistry',
        nameAr: 'كيمياء',
        nameEn: 'Chemistry',
        shortName: 'Chemistry',
        iconName: 'FlaskConical',
        color: 'from-emerald-500 to-teal-600',
        accentBg: 'bg-emerald-500/10 text-emerald-300',
        borderColor: 'border-emerald-500/30',
      },
      {
        key: 'biology',
        nameAr: 'بايو (أحياء)',
        nameEn: 'Biology',
        shortName: 'Bio',
        iconName: 'Dna',
        color: 'from-green-500 to-emerald-700',
        accentBg: 'bg-green-500/10 text-green-300',
        borderColor: 'border-green-500/30',
      },
      {
        key: 'geology',
        nameAr: 'جيو (جيولوجيا)',
        nameEn: 'Geology',
        shortName: 'Geo',
        iconName: 'Mountain',
        color: 'from-stone-500 to-amber-700',
        accentBg: 'bg-stone-500/10 text-amber-300',
        borderColor: 'border-amber-600/30',
      },
    ];
  }
}

export function createInitialUrtData(
  userName: string,
  track: TrackType
): UserUrtTrackerData {
  const configs = getUrtTablesForTrack(track);
  const tables: Record<string, UrtRow[]> = {};
  configs.forEach((c) => {
    tables[c.key] = [];
  });

  return {
    userId: userName.toLowerCase().includes('emy') ? 'user_emy' : 'user_youssef',
    userName,
    track,
    lastUpdated: new Date().toISOString(),
    tables,
  };
}

export function syncUrtWithTrack(
  urtData: UserUrtTrackerData,
  track: TrackType
): UserUrtTrackerData {
  const currentTables = urtData?.tables || {};
  const configs = getUrtTablesForTrack(track);
  const newTables: Record<string, UrtRow[]> = { ...currentTables };

  configs.forEach((c) => {
    if (!Array.isArray(newTables[c.key])) {
      newTables[c.key] = [];
    }
  });

  return {
    ...urtData,
    track,
    lastUpdated: new Date().toISOString(),
    tables: newTables,
  };
}

export function createInitialBacklogData(
  userName: string,
  track: 'SCI_MATH' | 'SCI_BIO'
): UserBacklogData {
  const subjects = getSubjectsForTrack(track);
  return {
    userId: userName.toLowerCase().includes('emy') ? 'user_emy' : 'user_youssef',
    userName,
    track,
    lastUpdated: new Date().toISOString(),
    items: subjects.map((sub) => ({
      subjectId: sub.id,
      subjectNameAr: sub.nameAr,
      subjectNameEn: sub.nameEn,
      pendingCount: 0,
      clearedCount: 0,
      notes: '',
      iconName: sub.iconName,
      color: sub.color,
    })),
  };
}

export function syncBacklogWithTrack(
  backlog: UserBacklogData,
  track: 'SCI_MATH' | 'SCI_BIO'
): UserBacklogData {
  const allowedSubjects = getSubjectsForTrack(track);
  const existingMap = new Map((backlog.items || []).map((i) => [i.subjectId, i]));

  const updatedItems = allowedSubjects.map((sub) => {
    const existing = existingMap.get(sub.id);
    if (existing) {
      return {
        ...existing,
        subjectNameAr: sub.nameAr,
        subjectNameEn: sub.nameEn,
        iconName: sub.iconName,
        color: sub.color,
        pendingCount: Math.max(0, existing.pendingCount || 0),
        clearedCount: Math.max(0, existing.clearedCount || 0),
        notes: existing.notes || '',
      };
    }
    return {
      subjectId: sub.id,
      subjectNameAr: sub.nameAr,
      subjectNameEn: sub.nameEn,
      pendingCount: 0,
      clearedCount: 0,
      notes: '',
      iconName: sub.iconName,
      color: sub.color,
    };
  });

  return {
    ...backlog,
    track,
    lastUpdated: new Date().toISOString(),
    items: updatedItems,
  };
}

export function syncWeeklyDataWithTrack(
  weeklyData: WeeklyData,
  track: 'SCI_MATH' | 'SCI_BIO'
): WeeklyData {
  const allowedSubjects = getSubjectsForTrack(track);
  const existingGoalMap = new Map(
    weeklyData.subjectGoals.map((g) => [g.subjectId, g])
  );

  const updatedSubjectGoals = allowedSubjects.map((sub) => {
    const existing = existingGoalMap.get(sub.id);
    if (existing) {
      return {
        ...existing,
        subjectNameAr: sub.nameAr,
        subjectNameEn: sub.nameEn,
        iconName: sub.iconName,
        color: sub.color,
      };
    }
    return {
      subjectId: sub.id,
      subjectNameAr: sub.nameAr,
      subjectNameEn: sub.nameEn,
      targetSessions: 0,
      completedSessions: 0,
      iconName: sub.iconName,
      color: sub.color,
    };
  });

  const metrics = calculateWeeklyScore(updatedSubjectGoals);

  return {
    ...weeklyData,
    subjectGoals: updatedSubjectGoals,
    totalTarget: metrics.totalTarget,
    totalCompleted: metrics.totalCompleted,
    completionRate: metrics.completionRate,
    bonusPoints: metrics.bonusPoints,
    finalScore: metrics.finalScore,
  };
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

export async function fetchRemoteBacklog(name: string): Promise<UserBacklogData | null> {
  const key = backlogKeyFor(name);
  return fetchBacklogFromFirebase(key);
}

export async function persistBacklog(name: string, data: UserBacklogData): Promise<UserBacklogData> {
  const key = backlogKeyFor(name);
  const updated: UserBacklogData = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  await syncBacklogToFirebase(key, updated);
  return updated;
}

export async function fetchRemoteUrt(name: string): Promise<UserUrtTrackerData | null> {
  const key = urtKeyFor(name);
  return fetchUrtFromFirebase(key);
}

export async function persistUrt(name: string, data: UserUrtTrackerData): Promise<UserUrtTrackerData> {
  const key = urtKeyFor(name);
  const updated: UserUrtTrackerData = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  await syncUrtToFirebase(key, updated);
  return updated;
}

