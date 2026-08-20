/**
 * DuoTracker - مزامنة لحظية سحابية كاملة عبر Google Firebase Firestore.
 */

import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { ChampionBanner } from './components/ChampionBanner';
import { MyWeekView } from './components/Views/MyWeekView';
import { PartnerWeekView } from './components/Views/PartnerWeekView';
import { HistoryView } from './components/Views/HistoryView';
import { HallOfFameView } from './components/Views/HallOfFameView';
import { LoginModal } from './components/LoginModal';
import { WeeklyGoalSetupModal } from './components/WeeklyGoalSetupModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { PastWeekRecord, TabView, UserProfile, WeeklyData } from './types';
import {
  PRESET_USERS,
  createInitialWeeklyData,
  syncWeeklyDataWithTrack,
  weekKeyFor,
  fetchRemoteProfile,
  persistProfile,
  fetchRemoteWeek,
  persistWeek,
  fetchRemotePastWeeks,
  persistPastWeeks,
} from './utils/storage';
import { calculateWeeklyScore } from './utils/scoreCalculator';
import confetti from 'canvas-confetti';

import { WeekScheduleBanner } from './components/WeekScheduleBanner';
import {
  WeekScheduleConfig,
  EMPTY_SCHEDULE_CONFIG,
  calculateCurrentWeekInfo,
  addPeriod,
  updatePeriod,
  removePeriod,
  createPeriod,
  saveScheduleConfig,
} from './utils/schedule';
import {
  getFirebaseConfig,
  fetchScheduleFromFirebase,
  subscribeToFirebaseDoc,
} from './utils/firebaseClient';

const safeSchedule = (s: any): WeekScheduleConfig =>
  s && Array.isArray(s.periods) ? s : EMPTY_SCHEDULE_CONFIG;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('MY_WEEK');

  const [firebaseReady, setFirebaseReady] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [scheduleConfig, setScheduleConfig] = useState<WeekScheduleConfig>(EMPTY_SCHEDULE_CONFIG);
  const [myWeeklyData, setMyWeeklyData] = useState<WeeklyData | null>(null);
  const [partnerWeeklyData, setPartnerWeeklyData] = useState<WeeklyData | null>(null);
  const [pastWeeks, setPastWeeks] = useState<PastWeekRecord[]>([]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  const currentWeekInfo = calculateCurrentWeekInfo(scheduleConfig);

  // التحقق من إعداد Firebase عند فتح التطبيق
  useEffect(() => {
    const cfg = getFirebaseConfig();
    setFirebaseReady(cfg.isConnected);
  }, []);

  async function loadAllRemoteData(profile: UserProfile) {
    try {
      const [schedule, myWeek, partnerWeek, past] = await Promise.all([
        fetchScheduleFromFirebase(),
        fetchRemoteWeek(weekKeyFor(profile.name)),
        fetchRemoteWeek(weekKeyFor(profile.partnerName)),
        fetchRemotePastWeeks(),
      ]);

      if (schedule) {
        setScheduleConfig(safeSchedule(schedule));
      }

      if (myWeek) {
        const synced = syncWeeklyDataWithTrack(myWeek, profile.track);
        setMyWeeklyData(synced);
        await persistWeek(weekKeyFor(profile.name), synced);
      } else {
        const initial = createInitialWeeklyData('Current Week (1)', 1, profile.track, 0);
        setMyWeeklyData(initial);
        await persistWeek(weekKeyFor(profile.name), initial);
      }

      if (partnerWeek) {
        const synced = syncWeeklyDataWithTrack(partnerWeek, profile.partnerTrack);
        setPartnerWeeklyData(synced);
        await persistWeek(weekKeyFor(profile.partnerName), synced);
      } else {
        const initial = createInitialWeeklyData('Current Week (1)', 1, profile.partnerTrack, 0);
        setPartnerWeeklyData(initial);
        await persistWeek(weekKeyFor(profile.partnerName), initial);
      }

      const cleanPast = (past || []).filter(
        (rec) => rec.winnerName !== 'أحمد محمود' && rec.winnerName !== 'عمر خالد'
      );
      setPastWeeks(cleanPast);
    } catch (e) {
      console.error('Error loading remote data:', e);
    }
  }

  // تسجيل الدخول: يجلب أحدث نسخة من البروفايل من السيرفر
  const handleLoginProfile = async (updated: UserProfile) => {
    setIsLoadingData(true);
    try {
      const remote = (await fetchRemoteProfile(updated.id)) || updated;
      const finalProfile: UserProfile = { ...remote, isLoggedIn: true };
      setUserProfile(finalProfile);
      await persistProfile(finalProfile);
      await loadAllRemoteData(finalProfile);
    } catch (err) {
      console.error('فشل تحميل بيانات تسجيل الدخول:', err);
      // Fallback cleanly to entered profile so user is not blocked
      setUserProfile({ ...updated, isLoggedIn: true });
      await loadAllRemoteData(updated);
    } finally {
      setIsLoginModalOpen(false);
      setIsLoadingData(false);
    }
  };

  const handleLogout = () => {
    setUserProfile(null);
    setMyWeeklyData(null);
    setPartnerWeeklyData(null);
    setPastWeeks([]);
    setScheduleConfig(EMPTY_SCHEDULE_CONFIG);
    setIsLoginModalOpen(true);
  };

  // اشتراك المزامنة اللحظية الفورية مع Firestore (onSnapshot)
  useEffect(() => {
    if (!userProfile) return;

    const myKey = weekKeyFor(userProfile.name);
    const partnerKey = weekKeyFor(userProfile.partnerName);

    // 1. مزامنة أسبوعي لحظياً
    const unsubMyWeek = subscribeToFirebaseDoc('duotracker_weeks', myKey, (data) => {
      if (data?.week_data) {
        setMyWeeklyData(syncWeeklyDataWithTrack(data.week_data, userProfile.track));
      }
    });

    // 2. مزامنة أسبوع الشريك لحظياً
    const unsubPartnerWeek = subscribeToFirebaseDoc('duotracker_weeks', partnerKey, (data) => {
      if (data?.week_data) {
        setPartnerWeeklyData(syncWeeklyDataWithTrack(data.week_data, userProfile.partnerTrack));
      }
    });

    // 3. مزامنة جدول الفترات لحظياً
    const unsubSchedule = subscribeToFirebaseDoc('duotracker_weeks', 'schedule_config_global', (data) => {
      if (data?.week_data) {
        setScheduleConfig(safeSchedule(data.week_data));
      }
    });

    // 4. مزامنة أرشيف الأسابيع والبطولات لحظياً
    const unsubHistory = subscribeToFirebaseDoc('duotracker_history', 'past_weeks_global', (data) => {
      if (data?.records) {
        const cleanPast = (data.records as PastWeekRecord[]).filter(
          (rec) => rec.winnerName !== 'أحمد محمود' && rec.winnerName !== 'عمر خالد'
        );
        setPastWeeks(cleanPast);
      }
    });

    return () => {
      unsubMyWeek();
      unsubPartnerWeek();
      unsubSchedule();
      unsubHistory();
    };
  }, [userProfile]);

  const latestWeek = pastWeeks.length > 0 ? pastWeeks[0] : null;

  const handleUpdateMyWeek = async (data: WeeklyData) => {
    if (!userProfile) return;
    setMyWeeklyData(data);
    const saved = await persistWeek(weekKeyFor(userProfile.name), data);
    setMyWeeklyData(saved);
  };

  const handleSwitchProfile = async () => {
    if (!userProfile) return;
    const swapped: UserProfile = {
      ...userProfile,
      id: userProfile.id === 'user_emy' ? 'user_youssef' : 'user_emy',
      name: userProfile.partnerName,
      partnerName: userProfile.name,
      track: userProfile.partnerTrack,
      partnerTrack: userProfile.track,
      pin: userProfile.partnerPin,
      partnerPin: userProfile.pin,
    };

    setIsLoadingData(true);
    try {
      const remote = (await fetchRemoteProfile(swapped.id)) || swapped;
      const finalProfile: UserProfile = { ...remote, isLoggedIn: true };
      setUserProfile(finalProfile);
      await loadAllRemoteData(finalProfile);

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.1 },
        colors: ['#8b5cf6', '#10b981', '#3b82f6'],
      });
    } catch (err) {
      console.error('فشل تبديل الحساب:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleResetNewWeek = async () => {
    if (!userProfile || !myWeeklyData || !partnerWeeklyData) return;

    if (
      !window.confirm(
        'هل أنت متأكد من إنهاء الفترة الحالية وأرشفة النتائج في حائط البطولات وبدء أسبوع جديد؟'
      )
    ) {
      return;
    }

    const myMetrics = calculateWeeklyScore(myWeeklyData.subjectGoals);
    const partnerMetrics = calculateWeeklyScore(partnerWeeklyData.subjectGoals);

    let winnerName = userProfile.name;
    let winnerScore = myMetrics.finalScore;
    let isTie = false;

    if (partnerMetrics.finalScore > myMetrics.finalScore) {
      winnerName = userProfile.partnerName;
      winnerScore = partnerMetrics.finalScore;
    } else if (partnerMetrics.finalScore === myMetrics.finalScore) {
      isTie = true;
    }

    const activePeriodName = currentWeekInfo.activePeriod?.name || myWeeklyData.weekTitle;
    const nextWeekNumber = myWeeklyData.weekNumber + 1;

    const newRecord: PastWeekRecord = {
      weekId: `week-archive-${Date.now()}`,
      weekTitle: `${activePeriodName} - Final Result`,
      startDate: currentWeekInfo.activePeriod?.startDate || new Date().toISOString().split('T')[0],
      endDate: currentWeekInfo.activePeriod?.endDate || new Date().toISOString().split('T')[0],
      userMetrics: {
        userName: userProfile.name,
        totalTarget: myMetrics.totalTarget,
        totalCompleted: myMetrics.totalCompleted,
        completionRate: myMetrics.completionRate,
        bonusPoints: myMetrics.bonusPoints,
        finalScore: myMetrics.finalScore,
        notes: myWeeklyData.notes,
        subjectGoals: myWeeklyData.subjectGoals,
      },
      partnerMetrics: {
        partnerName: userProfile.partnerName,
        totalTarget: partnerMetrics.totalTarget,
        totalCompleted: partnerMetrics.totalCompleted,
        completionRate: partnerMetrics.completionRate,
        bonusPoints: partnerMetrics.bonusPoints,
        finalScore: partnerMetrics.finalScore,
        notes: partnerWeeklyData.notes,
        subjectGoals: partnerWeeklyData.subjectGoals,
      },
      winnerName,
      winnerScore,
      isTie,
      completedAt: new Date().toISOString().split('T')[0],
    };

    const updatedPast = [newRecord, ...pastWeeks];
    setPastWeeks(updatedPast);
    await persistPastWeeks(updatedPast);

    const newMyWeek = createInitialWeeklyData(`Current Week (${nextWeekNumber})`, nextWeekNumber, userProfile.track, 0);
    const newPartnerWeek = createInitialWeeklyData(
      `Current Week (${nextWeekNumber})`,
      nextWeekNumber,
      userProfile.partnerTrack,
      0
    );

    const savedMy = await persistWeek(weekKeyFor(userProfile.name), newMyWeek);
    setMyWeeklyData(savedMy);
    setPartnerWeeklyData(newPartnerWeek);
    await persistWeek(weekKeyFor(userProfile.partnerName), newPartnerWeek);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.3 },
      colors: ['#f59e0b', '#10b981', '#8b5cf6', '#ec4899'],
    });

    setActiveTab('HALL_OF_FAME');
  };

  // ----- إدارة فترات الأسبوع (يوسف فقط) -----
  const handleAddPeriod = async (name: string, startDate: string, endDate: string) => {
    if (!userProfile) return;
    const period = createPeriod(name, startDate, endDate, userProfile.name);
    const newConfig = addPeriod(scheduleConfig, period);
    setScheduleConfig(newConfig);
    await saveScheduleConfig(newConfig);
  };

  const handleUpdatePeriod = async (periodId: string, updates: { name?: string; startDate?: string; endDate?: string }) => {
    const newConfig = updatePeriod(scheduleConfig, periodId, updates);
    setScheduleConfig(newConfig);
    await saveScheduleConfig(newConfig);
  };

  const handleDeletePeriod = async (periodId: string) => {
    const newConfig = removePeriod(scheduleConfig, periodId);
    setScheduleConfig(newConfig);
    await saveScheduleConfig(newConfig);
  };

  // ----- شاشات الحالة -----
  if (!userProfile || isLoadingData) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center justify-center gap-4">
        {isLoadingData && <p className="text-sm text-slate-400 font-['Cairo']">جاري مزامنة بياناتك سحابياً من Firebase...</p>}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          userProfile={
            userProfile || {
              ...PRESET_USERS.EMY,
              isLoggedIn: false,
            }
          }
          onSaveProfile={handleLoginProfile}
        />
      </div>
    );
  }

  if (!myWeeklyData || !partnerWeeklyData) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400 font-['Cairo']">جاري تحميل بيانات الأسبوع...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-['Cairo',sans-serif] pb-2 sm:pb-4">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onSwitchProfile={handleSwitchProfile}
        onResetNewWeek={handleResetNewWeek}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-4 sm:pb-6">
        {(activeTab === 'MY_WEEK' || activeTab === 'PARTNER_WEEK') && (
          <>
            <WeekScheduleBanner
              userProfile={userProfile}
              scheduleConfig={scheduleConfig}
              currentWeekInfo={currentWeekInfo}
              onAddPeriod={handleAddPeriod}
              onUpdatePeriod={handleUpdatePeriod}
              onDeletePeriod={handleDeletePeriod}
            />

            <ChampionBanner
              latestWeek={latestWeek}
              onOpenHallOfFame={() => setActiveTab('HALL_OF_FAME')}
            />
          </>
        )}

        {activeTab === 'MY_WEEK' && (
          <MyWeekView
            weeklyData={myWeeklyData}
            isBeforeStart={!currentWeekInfo.hasActivePeriod}
            onUpdateWeeklyData={handleUpdateMyWeek}
            onOpenSetupModal={() => setIsSetupModalOpen(true)}
          />
        )}

        {activeTab === 'PARTNER_WEEK' && (
          <PartnerWeekView
            partnerData={partnerWeeklyData}
            userProfile={userProfile}
            userWeeklyData={myWeeklyData}
          />
        )}

        {activeTab === 'HISTORY' && <HistoryView pastWeeks={pastWeeks} userProfile={userProfile} />}
        {activeTab === 'HALL_OF_FAME' && <HallOfFameView pastWeeks={pastWeeks} userProfile={userProfile} />}
      </main>

      <footer
        className="mt-auto border-t border-slate-800/80 text-center text-xs text-slate-500 flex items-center justify-center mx-auto"
        style={{ width: '366.6px', height: '160px', paddingTop: '0px', paddingBottom: '50px' }}
      >
        <div
          className="max-w-7xl w-full mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderRadius: '8px', borderStyle: 'groove', height: '74.5875px' }}
        >
          <div className="text-sm font-bold text-emerald-400 font-['Cairo'] tracking-wide">
            طول ما احنا في ضهر بعض هنوصل مع بعض ❤️
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-bold text-xs bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-pink-400">إيمي أحمد</span>
            <span className="text-slate-500">&amp;</span>
            <span className="text-violet-400">يوسف اللواتي</span>
          </div>
        </div>
      </footer>

      <WeeklyGoalSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        weeklyData={myWeeklyData}
        onSaveWeeklyGoals={handleUpdateMyWeek}
      />

      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </div>
  );
}
