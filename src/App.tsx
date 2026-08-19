/**
 * DuoTracker - شخصان فقط، مزامنة لحظية عبر Supabase، بدون أي تخزين محلي للبيانات.
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
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { PastWeekRecord, TabView, UserProfile, WeeklyData } from './types';
import {
  PRESET_USERS,
  createInitialWeeklyData,
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
  getSupabaseConfig,
  fetchScheduleFromSupabase,
  subscribeToTable,
} from './utils/supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('MY_WEEK');

  const [supabaseReady, setSupabaseReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [scheduleConfig, setScheduleConfig] = useState<WeekScheduleConfig>(EMPTY_SCHEDULE_CONFIG);
  const [myWeeklyData, setMyWeeklyData] = useState<WeeklyData | null>(null);
  const [partnerWeeklyData, setPartnerWeeklyData] = useState<WeeklyData | null>(null);
  const [pastWeeks, setPastWeeks] = useState<PastWeekRecord[]>([]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const currentWeekInfo = calculateCurrentWeekInfo(scheduleConfig);

  // التحقق من إعداد Supabase عند فتح التطبيق (لا وجود لأي بيانات بدون سيرفر)
  useEffect(() => {
    const cfg = getSupabaseConfig();
    setSupabaseReady(cfg.isConnected);
    if (!cfg.isConnected) setIsSupabaseModalOpen(true);
  }, []);

  async function loadAllRemoteData(profile: UserProfile) {
    const [schedule, myWeek, partnerWeek, past] = await Promise.all([
      fetchScheduleFromSupabase(),
      fetchRemoteWeek(weekKeyFor(profile.name)),
      fetchRemoteWeek(weekKeyFor(profile.partnerName)),
      fetchRemotePastWeeks(),
    ]);

    setScheduleConfig(schedule || EMPTY_SCHEDULE_CONFIG);

    if (myWeek) {
      setMyWeeklyData(myWeek);
    } else {
      const initial = createInitialWeeklyData('Current Week (1)', 1, profile.track, 0);
      setMyWeeklyData(initial);
      await persistWeek(weekKeyFor(profile.name), initial);
    }

    if (partnerWeek) {
      setPartnerWeeklyData(partnerWeek);
    } else {
      const initial = createInitialWeeklyData('Current Week (1)', 1, profile.partnerTrack, 0);
      setPartnerWeeklyData(initial);
    }

    const cleanPast = (past || []).filter(
      (rec) => rec.winnerName !== 'أحمد محمود' && rec.winnerName !== 'عمر خالد'
    );
    setPastWeeks(cleanPast);
  }

  // تسجيل الدخول: يجلب أحدث نسخة من البروفايل من السيرفر (لا تسجيل دخول تلقائي محفوظ محلياً)
  const handleLoginProfile = async (updated: UserProfile) => {
    if (!supabaseReady) {
      setIsSupabaseModalOpen(true);
      return;
    }
    setIsLoadingData(true);
    try {
      const remote = (await fetchRemoteProfile(updated.id)) || updated;
      const finalProfile: UserProfile = { ...remote, isLoggedIn: true };
      setUserProfile(finalProfile);
      await persistProfile(finalProfile);
      await loadAllRemoteData(finalProfile);
      setIsLoginModalOpen(false);
    } finally {
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

  // اشتراك المزامنة اللحظية: أي تعديل من أي جهاز (الشريك أو نفس الشخص من جهاز آخر) ينعكس فوراً
  useEffect(() => {
    if (!userProfile || !supabaseReady) return;

    const refreshWeeksAndSchedule = async () => {
      const [myWeek, partnerWeek, schedule] = await Promise.all([
        fetchRemoteWeek(weekKeyFor(userProfile.name)),
        fetchRemoteWeek(weekKeyFor(userProfile.partnerName)),
        fetchScheduleFromSupabase(),
      ]);
      if (myWeek) setMyWeeklyData(myWeek);
      if (partnerWeek) setPartnerWeeklyData(partnerWeek);
      if (schedule) setScheduleConfig(schedule);
    };

    const refreshHistory = async () => {
      const past = await fetchRemotePastWeeks();
      if (past) setPastWeeks(past);
    };

    const unsubWeeks = subscribeToTable('duotracker_weeks', refreshWeeksAndSchedule);
    const unsubHistory = subscribeToTable('duotracker_history', refreshHistory);

    // شبكة أمان: إعادة جلب دورية خفيفة من السيرفر فقط (وليست تخزيناً محلياً) في حال انقطاع القناة اللحظية
    const interval = setInterval(() => {
      refreshWeeksAndSchedule();
      refreshHistory();
    }, 15000);

    return () => {
      unsubWeeks();
      unsubHistory();
      clearInterval(interval);
    };
  }, [userProfile, supabaseReady]);

  const latestWeek = pastWeeks.length > 0 ? pastWeeks[0] : null;

  const handleUpdateMyWeek = async (data: WeeklyData) => {
    if (!userProfile) return;
    setMyWeeklyData(data);
    const saved = await persistWeek(weekKeyFor(userProfile.name), data);
    setMyWeeklyData(saved);
  };

  const handleSaveProfile = async (updated: UserProfile) => {
    setUserProfile(updated);
    await persistProfile(updated);

    if (myWeeklyData && updated.track !== userProfile?.track) {
      const refreshedMy = createInitialWeeklyData(myWeeklyData.weekTitle, myWeeklyData.weekNumber, updated.track);
      const saved = await persistWeek(weekKeyFor(updated.name), refreshedMy);
      setMyWeeklyData(saved);
    }
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
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleResetNewWeek = async () => {
    if (!userProfile || !myWeeklyData || !partnerWeeklyData) return;

    if (
      !window.confirm(
        'Are you sure you want to finish the current period, archive performance records to the Hall of Fame, and reset weekly goals?'
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
  if (!supabaseReady) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-black text-white">التطبيق يحتاج اتصال Supabase ليعمل</h1>
        <p className="text-sm text-slate-400 max-w-md">
          حتى تتم مزامنة البيانات لحظياً بين جهازي إيمي ويوسف بدون أي حفظ محلي، يجب ربط قاعدة بيانات Supabase أولاً.
          يُفضّل ضبط <code>VITE_SUPABASE_URL</code> و<code>VITE_SUPABASE_ANON_KEY</code> كمتغيرات بيئة على Vercel.
        </p>
        <button
          onClick={() => setIsSupabaseModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
        >
          فتح إعدادات الربط
        </button>
        <SupabaseConfigModal
          isOpen={isSupabaseModalOpen}
          onClose={() => {
            setIsSupabaseModalOpen(false);
            const cfg = getSupabaseConfig();
            setSupabaseReady(cfg.isConnected);
          }}
        />
      </div>
    );
  }

  if (!userProfile || isLoadingData) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center justify-center gap-4">
        {isLoadingData && <p className="text-sm text-slate-400">جاري تحميل بياناتك من السيرفر...</p>}
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
        <p className="text-sm text-slate-400">جاري تحميل بيانات الأسبوع...</p>
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
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
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

      <SupabaseConfigModal isOpen={isSupabaseModalOpen} onClose={() => setIsSupabaseModalOpen(false)} />
    </div>
  );
}
