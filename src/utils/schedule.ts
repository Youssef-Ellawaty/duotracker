import { syncScheduleToSupabase, fetchScheduleFromSupabase } from './supabaseClient';

export interface WeekScheduleConfig {
  isStarted: boolean;
  startedBy: string;
  week1StartDate: string; // "YYYY-MM-DD" e.g. "2026-08-15"
  week1EndDate: string;   // "YYYY-MM-DD" e.g. "2026-08-22"
  cutoffHour: number;     // 5 (5:00 AM)
  createdAt: string;
}

const SCHEDULE_KEY = 'duotracker_schedule_v3';

export const DEFAULT_SCHEDULE_CONFIG: WeekScheduleConfig = {
  isStarted: false,
  startedBy: 'Youssef Ellawaty',
  week1StartDate: new Date().toISOString().split('T')[0],
  week1EndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  cutoffHour: 5, // 5:00 AM
  createdAt: new Date().toISOString(),
};

export function loadScheduleConfig(): WeekScheduleConfig {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load schedule config', e);
  }
  return DEFAULT_SCHEDULE_CONFIG;
}

export function saveScheduleConfig(config: WeekScheduleConfig): void {
  try {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(config));
    // Trigger automatic background sync to Supabase
    syncScheduleToSupabase(config);
  } catch (e) {
    console.error('Failed to save schedule config', e);
  }
}

export interface CurrentWeekCalculation {
  isStarted: boolean;
  isBeforeStart: boolean;
  weekNumber: number;
  weekTitle: string;
  startDateFormatted: string; // e.g. "15/08 (05:00 AM)"
  endDateFormatted: string;   // e.g. "23/08 (05:00 AM)"
  rawStartDate: Date | null;
  rawEndDate: Date | null;
  timeRemainingStr: string;
}

/**
 * Calculates current week details based on Youssef's schedule settings.
 * Cutoff is 5:00 AM on the day following week1EndDate.
 */
export function calculateCurrentWeekInfo(config: WeekScheduleConfig, nowInput?: Date): CurrentWeekCalculation {
  if (!config.isStarted) {
    return {
      isStarted: false,
      isBeforeStart: false,
      weekNumber: 1,
      weekTitle: 'الأسبوع الأول (في انتظار البدء)',
      startDateFormatted: '--',
      endDateFormatted: '--',
      rawStartDate: null,
      rawEndDate: null,
      timeRemainingStr: '',
    };
  }

  const now = nowInput || new Date();

  // Week 1 Start Timestamp: StartDate + 05:00:00
  const [sYear, sMonth, sDay] = config.week1StartDate.split('-').map(Number);
  const week1Start = new Date(sYear, sMonth - 1, sDay, config.cutoffHour || 5, 0, 0, 0);

  // Week 1 End Timestamp: EndDate + 1 day at 05:00:00 (taking 5 hours from next day as specified)
  const [eYear, eMonth, eDay] = config.week1EndDate.split('-').map(Number);
  const week1EndCutoff = new Date(eYear, eMonth - 1, eDay + 1, config.cutoffHour || 5, 0, 0, 0);

  const durationMs = Math.max(
    24 * 60 * 60 * 1000,
    week1EndCutoff.getTime() - week1Start.getTime()
  );

  // Case 1: Current time is before Week 1 official start
  if (now.getTime() < week1Start.getTime()) {
    const diffMs = week1Start.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      isStarted: true,
      isBeforeStart: true,
      weekNumber: 1,
      weekTitle: 'الأسبوع الأول (ينطلق قريباً)',
      startDateFormatted: formatDateWithCutoff(week1Start),
      endDateFormatted: formatDateWithCutoff(week1EndCutoff),
      rawStartDate: week1Start,
      rawEndDate: week1EndCutoff,
      timeRemainingStr: `${diffDays} يوم و ${diffHours} ساعة و ${diffMins} دقيقة`,
    };
  }

  // Case 2: Week 1 has started. Calculate current week number
  const elapsedMs = now.getTime() - week1Start.getTime();
  const weekIndex = Math.floor(elapsedMs / durationMs); // 0 = Week 1, 1 = Week 2, etc.
  const weekNumber = 1 + weekIndex;

  const currentWeekStart = new Date(week1Start.getTime() + weekIndex * durationMs);
  const currentWeekEnd = new Date(week1Start.getTime() + (weekIndex + 1) * durationMs);

  const timeToNextMs = currentWeekEnd.getTime() - now.getTime();
  const diffDays = Math.floor(timeToNextMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((timeToNextMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return {
    isStarted: true,
    isBeforeStart: false,
    weekNumber,
    weekTitle: `الأسبوع ${weekNumber}`,
    startDateFormatted: formatDateWithCutoff(currentWeekStart),
    endDateFormatted: formatDateWithCutoff(currentWeekEnd),
    rawStartDate: currentWeekStart,
    rawEndDate: currentWeekEnd,
    timeRemainingStr: `${diffDays} يوم و ${diffHours} ساعة`,
  };
}

function formatDateWithCutoff(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month} الساعة ${hours}:${mins} فجراً`;
}
