/**
 * DuoTracker - High-end Responsive Study Goal Tracker for Partners
 * Built with React 19, Tailwind CSS v4, Lucide Icons, and Framer Motion.
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChampionBanner } from './components/ChampionBanner';
import { MyWeekView } from './components/Views/MyWeekView';
import { PartnerWeekView } from './components/Views/PartnerWeekView';
import { HistoryView } from './components/Views/HistoryView';
import { HallOfFameView } from './components/Views/HallOfFameView';
import { LoginModal } from './components/LoginModal';
import { WeeklyGoalSetupModal } from './components/WeeklyGoalSetupModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import {
  PastWeekRecord,
  TabView,
  UserProfile,
  WeeklyData,
} from './types';
import {
  createInitialWeeklyData,
  loadMyWeek,
  loadPartnerWeek,
  loadPastWeeks,
  loadProfile,
  saveMyWeek,
  savePartnerWeek,
  savePastWeeks,
  saveProfile,
} from './utils/storage';
import { calculateWeeklyScore } from './utils/scoreCalculator';
import confetti from 'canvas-confetti';

import { WeekScheduleBanner } from './components/WeekScheduleBanner';
import {
  WeekScheduleConfig,
  loadScheduleConfig,
  saveScheduleConfig,
  calculateCurrentWeekInfo,
} from './utils/schedule';
import {
  fetchPastWeeksFromSupabase,
  fetchWeekFromSupabase,
  fetchScheduleFromSupabase,
} from './utils/supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('MY_WEEK');

  // LocalStorage State
  const [userProfile, setUserProfile] = useState<UserProfile>(loadProfile);
  const [scheduleConfig, setScheduleConfig] = useState<WeekScheduleConfig>(loadScheduleConfig);
  const currentWeekInfo = calculateCurrentWeekInfo(scheduleConfig);

  const [myWeeklyData, setMyWeeklyData] = useState<WeeklyData>(() => {
    const loaded = loadMyWeek(userProfile.track);
    if (currentWeekInfo.isStarted && currentWeekInfo.weekNumber > 0) {
      return {
        ...loaded,
        weekNumber: currentWeekInfo.weekNumber,
        weekTitle: currentWeekInfo.weekTitle,
      };
    }
    return loaded;
  });

  const [partnerWeeklyData, setPartnerWeeklyData] = useState<WeeklyData>(() => {
    const loaded = loadPartnerWeek(userProfile.partnerTrack);
    if (currentWeekInfo.isStarted && currentWeekInfo.weekNumber > 0) {
      return {
        ...loaded,
        weekNumber: currentWeekInfo.weekNumber,
        weekTitle: currentWeekInfo.weekTitle,
      };
    }
    return loaded;
  });
  const [pastWeeks, setPastWeeks] = useState<PastWeekRecord[]>(loadPastWeeks);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(() => !userProfile.isLoggedIn);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Handle Logout
  const handleLogout = () => {
    const loggedOutProfile: UserProfile = {
      ...userProfile,
      isLoggedIn: false,
    };
    setUserProfile(loggedOutProfile);
    saveProfile(loggedOutProfile);
    setIsLoginModalOpen(true);
  };

  // Automatic Supabase Data Fetching & Real-time Live Polling
  useEffect(() => {
    async function loadFromSupabase() {
      const userKey = `week_${userProfile.name.replace(/\s+/g, '_')}`;
      const partnerKey = `week_${userProfile.partnerName.replace(/\s+/g, '_')}`;

      const remoteSchedule = await fetchScheduleFromSupabase();
      if (remoteSchedule) {
        setScheduleConfig(remoteSchedule);
        saveScheduleConfig(remoteSchedule);
      }

      // Load user's own data
      const remoteMy = (await fetchWeekFromSupabase(userKey)) || (await fetchWeekFromSupabase('my_week'));
      if (remoteMy && !remoteMy.weekTitle.includes('3')) {
        setMyWeeklyData(remoteMy);
        saveMyWeek(remoteMy, userProfile.name);
      }

      // Load partner's data
      const remotePartner = (await fetchWeekFromSupabase(partnerKey)) || (await fetchWeekFromSupabase('partner_week'));
      if (remotePartner && !remotePartner.weekTitle.includes('3')) {
        setPartnerWeeklyData(remotePartner);
        savePartnerWeek(remotePartner, userProfile.partnerName);
      }

      const remotePast = await fetchPastWeeksFromSupabase();
      if (remotePast) {
        const cleanPast = remotePast.filter(
          (rec) =>
            !rec.weekId.startsWith('week-archive-') &&
            rec.winnerName !== 'أحمد محمود' &&
            rec.winnerName !== 'عمر خالد'
        );
        setPastWeeks(cleanPast);
        savePastWeeks(cleanPast);
      }
    }

    loadFromSupabase();

    // Auto-polling interval every 6 seconds to pull live updates from partner seamlessly
    const interval = setInterval(async () => {
      const partnerKey = `week_${userProfile.partnerName.replace(/\s+/g, '_')}`;
      const remotePartner = (await fetchWeekFromSupabase(partnerKey)) || (await fetchWeekFromSupabase('partner_week'));
      if (remotePartner) {
        setPartnerWeeklyData(remotePartner);
        savePartnerWeek(remotePartner, userProfile.partnerName);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [userProfile.name, userProfile.partnerName]);

  // Sync track changes
  useEffect(() => {
    saveProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveMyWeek(myWeeklyData, userProfile.name);
  }, [myWeeklyData, userProfile.name]);

  useEffect(() => {
    savePartnerWeek(partnerWeeklyData, userProfile.partnerName);
  }, [partnerWeeklyData, userProfile.partnerName]);

  useEffect(() => {
    savePastWeeks(pastWeeks);
  }, [pastWeeks]);

  // Latest archived week for Champion Banner
  const latestWeek = pastWeeks.length > 0 ? pastWeeks[0] : null;

  // Handle Profile Update
  const handleSaveProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    saveProfile(updated);

    // Refresh subject lists if track changed
    if (updated.track !== userProfile.track) {
      const refreshedMy = createInitialWeeklyData(myWeeklyData.weekTitle, myWeeklyData.weekNumber, updated.track);
      setMyWeeklyData(refreshedMy);
      saveMyWeek(refreshedMy);
    }
    if (updated.partnerTrack !== userProfile.partnerTrack) {
      const refreshedPartner = createInitialWeeklyData(partnerWeeklyData.weekTitle, partnerWeeklyData.weekNumber, updated.partnerTrack);
      setPartnerWeeklyData(refreshedPartner);
      savePartnerWeek(refreshedPartner);
    }
  };

  // Switch Profile / Perspective between User and Partner for testing and multi-partner session
  const handleSwitchProfile = () => {
    const updated: UserProfile = {
      ...userProfile,
      name: userProfile.partnerName,
      partnerName: userProfile.name,
      track: userProfile.partnerTrack,
      partnerTrack: userProfile.track,
      pin: userProfile.partnerPin,
      partnerPin: userProfile.pin,
    };

    // Swap active week data
    const tempMy = { ...myWeeklyData };
    const tempPartner = { ...partnerWeeklyData };

    setUserProfile(updated);
    setMyWeeklyData(tempPartner);
    setPartnerWeeklyData(tempMy);

    saveProfile(updated);
    saveMyWeek(tempPartner);
    savePartnerWeek(tempMy);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.1 },
      colors: ['#8b5cf6', '#10b981', '#3b82f6'],
    });
  };

  // Reset / Finish Week and Archive to Hall of Fame
  const handleResetNewWeek = () => {
    if (
      !window.confirm(
        'Are you sure you want to finish the current week, archive performance records to the Hall of Fame, and start a new week?'
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

    const nextWeekNumber = myWeeklyData.weekNumber + 1;

    const newRecord: PastWeekRecord = {
      weekId: `week-archive-${Date.now()}`,
      weekTitle: `Week ${myWeeklyData.weekNumber} - Final Result`,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
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

    // Update Past Weeks
    const updatedPast = [newRecord, ...pastWeeks];
    setPastWeeks(updatedPast);
    savePastWeeks(updatedPast);

    // Reset current active week data
    const newMyWeek = createInitialWeeklyData(
      `Current Week (${nextWeekNumber})`,
      nextWeekNumber,
      userProfile.track,
      3
    );
    const newPartnerWeek = createInitialWeeklyData(
      `Current Week (${nextWeekNumber})`,
      nextWeekNumber,
      userProfile.partnerTrack,
      3
    );

    setMyWeeklyData(newMyWeek);
    setPartnerWeeklyData(newPartnerWeek);

    saveMyWeek(newMyWeek);
    savePartnerWeek(newPartnerWeek);

    // Confetti celebration for the crowned winner
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.3 },
      colors: ['#f59e0b', '#10b981', '#8b5cf6', '#ec4899'],
    });

    setActiveTab('HALL_OF_FAME');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-['Cairo',sans-serif] pb-2 sm:pb-4">
      {/* Sticky Top Navbar */}
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

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-4 sm:pb-6">
        {/* Master Week Launch & Schedule Control Banner - MY_WEEK & PARTNER_WEEK ONLY */}
        {(activeTab === 'MY_WEEK' || activeTab === 'PARTNER_WEEK') && (
          <>
            <WeekScheduleBanner
              userProfile={userProfile}
              scheduleConfig={scheduleConfig}
              currentWeekInfo={currentWeekInfo}
              onUpdateSchedule={(newConfig) => setScheduleConfig(newConfig)}
            />

            {/* Top Champion Winner Banner */}
            <ChampionBanner
              latestWeek={latestWeek}
              onOpenHallOfFame={() => setActiveTab('HALL_OF_FAME')}
            />
          </>
        )}

        {/* Dynamic Tab Views */}
        {activeTab === 'MY_WEEK' && (
          <MyWeekView
            weeklyData={myWeeklyData}
            isBeforeStart={!scheduleConfig.isStarted || currentWeekInfo.isBeforeStart}
            onUpdateWeeklyData={(data) => {
              setMyWeeklyData(data);
              saveMyWeek(data, userProfile.name);
            }}
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

        {activeTab === 'HISTORY' && (
          <HistoryView pastWeeks={pastWeeks} userProfile={userProfile} />
        )}

        {activeTab === 'HALL_OF_FAME' && (
          <HallOfFameView pastWeeks={pastWeeks} userProfile={userProfile} />
        )}
      </main>

      {/* Footer */}
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

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      <WeeklyGoalSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        weeklyData={myWeeklyData}
        onSaveWeeklyGoals={(data) => {
          setMyWeeklyData(data);
          saveMyWeek(data);
        }}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
