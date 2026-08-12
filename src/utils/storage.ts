import { PastWeekRecord, UserProfile, WeeklyData } from '../types';
import { getSubjectsForTrack } from '../data/tracks';
import { calculateWeeklyScore } from './scoreCalculator';
import { syncPastWeeksToSupabase, syncWeekToSupabase } from './supabaseClient';

const PROFILE_KEY = 'duotracker_profile_v3';
const MY_WEEK_KEY = 'duotracker_my_week_v3';
const PARTNER_WEEK_KEY = 'duotracker_partner_week_v3';
const PAST_WEEKS_KEY = 'duotracker_past_weeks_v3';

// Default User Profile with preset accounts: Emy Ahmed & Youssef Ellawaty
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

export const DEFAULT_PROFILE: UserProfile = {
  ...PRESET_USERS.EMY,
  isLoggedIn: false, // Default unauthenticated to trigger login screen first
};

// Default Initial Weekly Data Generator (Starts with 0 targets and 0 completed sessions)
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
    targetSessions: customTargetDefault, // Defaults to 0 for all subjects until user sets goals
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

// Clean Empty Seed Past Weeks for Archives & Hall of Fame (No Mock Data)
export const SEED_PAST_WEEKS: PastWeekRecord[] = [];

// LocalStorage Handlers
export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadMyWeek(track: 'SCI_MATH' | 'SCI_BIO'): WeeklyData {
  try {
    const raw = localStorage.getItem(MY_WEEK_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load my week', e);
  }
  const initial = createInitialWeeklyData('Current Week (1)', 1, track, 0);
  saveMyWeek(initial);
  return initial;
}

export function saveMyWeek(data: WeeklyData, userProfileName?: string): void {
  try {
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
    localStorage.setItem(MY_WEEK_KEY, JSON.stringify(updated));
    // Trigger automatic background sync with Supabase with user-specific key
    const userKey = userProfileName ? `week_${userProfileName.replace(/\s+/g, '_')}` : 'my_week';
    syncWeekToSupabase(userKey, updated);
  } catch (e) {
    console.error('Failed to save my week', e);
  }
}

export function loadPartnerWeek(partnerTrack: 'SCI_MATH' | 'SCI_BIO'): WeeklyData {
  try {
    const raw = localStorage.getItem(PARTNER_WEEK_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load partner week', e);
  }
  const initial = createInitialWeeklyData('Current Week (1)', 1, partnerTrack, 0);
  savePartnerWeek(initial);
  return initial;
}

export function savePartnerWeek(data: WeeklyData, partnerProfileName?: string): void {
  try {
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
    localStorage.setItem(PARTNER_WEEK_KEY, JSON.stringify(updated));
    // Trigger automatic background sync with Supabase
    const partnerKey = partnerProfileName ? `week_${partnerProfileName.replace(/\s+/g, '_')}` : 'partner_week';
    syncWeekToSupabase(partnerKey, updated);
  } catch (e) {
    console.error('Failed to save partner week', e);
  }
}

export function loadPastWeeks(): PastWeekRecord[] {
  try {
    const raw = localStorage.getItem(PAST_WEEKS_KEY);
    if (raw) {
      const parsed: PastWeekRecord[] = JSON.parse(raw);
      // Clean out any legacy mock data records
      const sanitized = parsed.filter(
        (rec) =>
          !rec.weekId.startsWith('week-archive-') &&
          rec.winnerName !== 'أحمد محمود' &&
          rec.winnerName !== 'عمر خالد'
      );
      return sanitized;
    }
  } catch (e) {
    console.error('Failed to load past weeks', e);
  }
  savePastWeeks(SEED_PAST_WEEKS);
  return SEED_PAST_WEEKS;
}

export function savePastWeeks(pastWeeks: PastWeekRecord[]): void {
  try {
    localStorage.setItem(PAST_WEEKS_KEY, JSON.stringify(pastWeeks));
    // Trigger automatic background sync with Supabase
    syncPastWeeksToSupabase(pastWeeks);
  } catch (e) {
    console.error('Failed to save past weeks', e);
  }
}

