export type TrackType = 'SCI_MATH' | 'SCI_BIO';

export interface SubjectGoal {
  subjectId: string;
  subjectNameAr: string;
  subjectNameEn: string;
  targetSessions: number; // 0 to 10
  completedSessions: number;
  iconName: string;
  color: string;
}

export interface UserProfile {
  id: string; // e.g. 'user_main' or 'user_partner'
  name: string;
  pin: string;
  track: TrackType;
  partnerName: string;
  partnerPin: string;
  partnerTrack: TrackType;
  isLoggedIn: boolean;
}

export interface WeeklyData {
  weekId: string;
  weekNumber: number;
  weekTitle: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
  subjectGoals: SubjectGoal[];
  notes: string;
  lastUpdated: string;
  // Computed metrics cached for archive cards
  totalTarget: number;
  totalCompleted: number;
  completionRate: number; // Percentage 0-100%
  bonusPoints: number; // Bonus points count
  finalScore: number; // completionRate + bonusPoints
}

export interface PastWeekRecord {
  weekId: string;
  weekTitle: string;
  startDate: string;
  endDate: string;
  userMetrics: {
    userName: string;
    totalTarget: number;
    totalCompleted: number;
    completionRate: number;
    bonusPoints: number;
    finalScore: number;
    notes: string;
    subjectGoals: SubjectGoal[];
  };
  partnerMetrics: {
    partnerName: string;
    totalTarget: number;
    totalCompleted: number;
    completionRate: number;
    bonusPoints: number;
    finalScore: number;
    notes: string;
    subjectGoals: SubjectGoal[];
  };
  winnerName: string;
  winnerScore: number;
  isTie: boolean;
  completedAt: string;
}

export type TabView = 'MY_WEEK' | 'PARTNER_WEEK' | 'HISTORY' | 'HALL_OF_FAME' | 'BACKLOG' | 'URT_TRACKER';

export interface SubjectBacklogItem {
  subjectId: string;
  subjectNameAr: string;
  subjectNameEn: string;
  pendingCount: number; // عدد السيشنات المتراكمة
  clearedCount: number; // عدد السيشنات التي تمت تصفيتها
  notes: string; // أسماء الدروس أو الفصول المتراكمة
  iconName: string;
  color: string;
}

export interface UserBacklogData {
  userId: string;
  userName: string;
  track: TrackType;
  lastUpdated: string;
  items: SubjectBacklogItem[];
}

export interface UrtRow {
  id: string;
  title: string;          // عنوان (e.g. Test / Exam title)
  questionsCount: string; // عدد الأسئلة (e.g. 50)
  score: string;          // الدرجة (e.g. 48/50 or 96%)
  duration: string;       // الوقت (e.g. 45 min)
  notes?: string;         // ملاحظات اختيارية
  createdAt?: string;
}

export interface UserUrtTrackerData {
  userId: string;
  userName: string;
  track: TrackType;
  lastUpdated: string;
  // Map of subject key ('physics', 'chemistry', 'math' | 'biology', 'mechanics' | 'geology') to array of rows
  tables: Record<string, UrtRow[]>;
}

export interface SubjectDef {
  id: string;
  nameAr: string;
  nameEn: string;
  tracks: TrackType[];
  iconName: string;
  color: string;
}
