import { syncScheduleToFirebase } from './firebaseClient';

export interface WeekPeriod {
  id: string;
  name: string;        // اسم مخصص يضعه يوسف، مثال: "الأسبوع الأول" أو "أسبوع المراجعة النهائية"
  startDate: string;   // "YYYY-MM-DD"
  endDate: string;     // "YYYY-MM-DD" (اليوم الأخير ضمن الفترة)
  cutoffHour: number;  // ساعة القطع (افتراضي 5 فجراً)
  createdBy: string;
  createdAt: string;
}

export interface WeekScheduleConfig {
  periods: WeekPeriod[];
}

export const EMPTY_SCHEDULE_CONFIG: WeekScheduleConfig = { periods: [] };

/** يحفظ الجدول مباشرة على Firebase Firestore فقط — لا يوجد أي تخزين محلي */
export function saveScheduleConfig(config: WeekScheduleConfig): Promise<void> {
  return syncScheduleToFirebase(config);
}

export function createPeriod(
  name: string,
  startDate: string,
  endDate: string,
  createdBy: string,
  cutoffHour: number = 5
): WeekPeriod {
  return {
    id: `period-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim() || 'أسبوع بدون اسم',
    startDate,
    endDate,
    cutoffHour,
    createdBy,
    createdAt: new Date().toISOString(),
  };
}

function sortPeriods(periods: WeekPeriod[]): WeekPeriod[] {
  return Array.isArray(periods) ? [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate)) : [];
}

export function addPeriod(config: WeekScheduleConfig, period: WeekPeriod): WeekScheduleConfig {
  return { periods: sortPeriods([...(config.periods || []), period]) };
}

export function updatePeriod(
  config: WeekScheduleConfig,
  periodId: string,
  updates: Partial<Omit<WeekPeriod, 'id' | 'createdBy' | 'createdAt'>>
): WeekScheduleConfig {
  return {
    periods: sortPeriods(
      (config.periods || []).map((p) => (p.id === periodId ? { ...p, ...updates } : p))
    ),
  };
}

export function removePeriod(config: WeekScheduleConfig, periodId: string): WeekScheduleConfig {
  return { periods: (config.periods || []).filter((p) => p.id !== periodId) };
}

export interface CurrentWeekCalculation {
  hasActivePeriod: boolean;
  isBetweenPeriods: boolean; // لا توجد فترة نشطة الآن (فجوة، أو لم تبدأ بعد، أو انتهت كل الفترات)
  activePeriod: WeekPeriod | null;
  nextPeriod: WeekPeriod | null;
  ordinal: number; // ترتيب الفترة (للعرض فقط)
  weekTitle: string;
  startDateFormatted: string;
  endDateFormatted: string;
  timeRemainingStr: string;
}

function periodStart(p: WeekPeriod): Date {
  const [y, m, d] = p.startDate.split('-').map(Number);
  return new Date(y, m - 1, d, p.cutoffHour || 5, 0, 0, 0);
}

function periodEndCutoff(p: WeekPeriod): Date {
  const [y, m, d] = p.endDate.split('-').map(Number);
  return new Date(y, m - 1, d + 1, p.cutoffHour || 5, 0, 0, 0);
}

export function calculateCurrentWeekInfo(
  config: WeekScheduleConfig,
  nowInput?: Date
): CurrentWeekCalculation {
  const now = nowInput || new Date();
  const sorted = sortPeriods(config?.periods || []);

  if (sorted.length === 0) {
    return {
      hasActivePeriod: false,
      isBetweenPeriods: false,
      activePeriod: null,
      nextPeriod: null,
      ordinal: 0,
      weekTitle: 'لم يتم تحديد أي فترة مذاكرة بعد',
      startDateFormatted: '--',
      endDateFormatted: '--',
      timeRemainingStr: '',
    };
  }

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const start = periodStart(p);
    const end = periodEndCutoff(p);

    if (now.getTime() >= start.getTime() && now.getTime() < end.getTime()) {
      const timeToNextMs = end.getTime() - now.getTime();
      const diffDays = Math.floor(timeToNextMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((timeToNextMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      return {
        hasActivePeriod: true,
        isBetweenPeriods: false,
        activePeriod: p,
        nextPeriod: sorted[i + 1] || null,
        ordinal: i + 1,
        weekTitle: p.name,
        startDateFormatted: formatDateWithCutoff(start),
        endDateFormatted: formatDateWithCutoff(end),
        timeRemainingStr: `${diffDays} يوم و ${diffHours} ساعة`,
      };
    }
  }

  const upcoming = sorted.find((p) => periodStart(p).getTime() > now.getTime());
  if (upcoming) {
    const start = periodStart(upcoming);
    const end = periodEndCutoff(upcoming);
    const diffMs = start.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      hasActivePeriod: false,
      isBetweenPeriods: true,
      activePeriod: null,
      nextPeriod: upcoming,
      ordinal: sorted.indexOf(upcoming) + 1,
      weekTitle: `${upcoming.name} (ينطلق قريباً)`,
      startDateFormatted: formatDateWithCutoff(start),
      endDateFormatted: formatDateWithCutoff(end),
      timeRemainingStr: `${diffDays} يوم و ${diffHours} ساعة و ${diffMins} دقيقة`,
    };
  }

  return {
    hasActivePeriod: false,
    isBetweenPeriods: true,
    activePeriod: null,
    nextPeriod: null,
    ordinal: sorted.length,
    weekTitle: 'لا توجد فترة نشطة حالياً - بانتظار تحديد فترة جديدة من يوسف',
    startDateFormatted: '--',
    endDateFormatted: '--',
    timeRemainingStr: '',
  };
}

function formatDateWithCutoff(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month} الساعة ${hours}:${mins} فجراً`;
}
