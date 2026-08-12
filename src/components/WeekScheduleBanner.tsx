import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Play, ShieldAlert, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';
import {
  CurrentWeekCalculation,
  WeekScheduleConfig,
  saveScheduleConfig,
} from '../utils/schedule';

interface WeekScheduleBannerProps {
  userProfile: UserProfile;
  scheduleConfig: WeekScheduleConfig;
  currentWeekInfo: CurrentWeekCalculation;
  onUpdateSchedule: (newConfig: WeekScheduleConfig) => void;
}

export const WeekScheduleBanner: React.FC<WeekScheduleBannerProps> = ({
  userProfile,
  scheduleConfig,
  currentWeekInfo,
  onUpdateSchedule,
}) => {
  const isYoussef = userProfile.name.toLowerCase().includes('youssef');

  // Form state for Youssef to configure week dates
  const [startDate, setStartDate] = useState(
    scheduleConfig.week1StartDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    scheduleConfig.week1EndDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const handleLaunchWeek1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const newConfig: WeekScheduleConfig = {
      isStarted: true,
      startedBy: userProfile.name,
      week1StartDate: startDate,
      week1EndDate: endDate,
      cutoffHour: 5, // 5:00 AM cutoff
      createdAt: new Date().toISOString(),
    };

    saveScheduleConfig(newConfig);
    onUpdateSchedule(newConfig);
  };

  // Case 1: Week not started yet
  if (!scheduleConfig.isStarted) {
    if (isYoussef) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-3xl border-2 border-violet-500/40 bg-gradient-to-br from-violet-950/40 via-slate-900/90 to-emerald-950/30 shadow-2xl relative overflow-hidden my-4"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-violet-400" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
                تحكم يوسف اللواتي (Master Launch)
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                إطلاق الأسبوع الأول (Start Week 1)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                لا يبدأ الأسبوع إلا بأمر وتحديد الفترة من حساب يوسف اللواتي. حدد تاريخ البداية والنهاية، علمًا بأن التحديث اليومي ونهاية الأسبوع يكون الساعة <strong>5:00 فجراً</strong>.
              </p>
            </div>

            <form onSubmit={handleLaunchWeek1} className="pt-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تاريخ بداية الأسبوع الأول:</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">يبدأ الساعة 5:00 فجراً</span>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>تاريخ نهاية الأسبوع الأول:</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">ينتهي 5:00 فجراً اليوم التالي</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-violet-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>إطلاق وبدء الأسبوع الأول رسمياً</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      );
    }

    // If Emy is logged in and week is not launched
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-500/10 shadow-xl my-4 text-center space-y-3"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white">في انتظار إطلاق الأسبوع الأول بواسطة يوسف اللواتي ⏳</h3>
          <p className="text-xs text-amber-200/80 mt-1 max-w-lg mx-auto">
            لا يبدأ الأسبوع الأول إلا بأمر وتحديد الفترة الزمانية الخاصة بالأسبوع من حساب يوسف اللواتي.
          </p>
        </div>
      </motion.div>
    );
  }

  // Case 2: Week IS Started -> Display active timing banner
  return (
    <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 bg-slate-900/60 my-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 font-black">
          {currentWeekInfo.weekNumber}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">{currentWeekInfo.weekTitle}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              نشط الآن
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-3">
            <span>من: <strong className="text-slate-200">{currentWeekInfo.startDateFormatted}</strong></span>
            <span>إلى: <strong className="text-slate-200">{currentWeekInfo.endDateFormatted}</strong></span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">متبقي على بداية الأسبوع التالي</div>
          <div className="text-xs font-black text-amber-400 font-mono mt-0.5">
            {currentWeekInfo.timeRemainingStr}
          </div>
        </div>

        {isYoussef && (
          <button
            onClick={() => {
              if (window.confirm('هل تريد إعادة ضبط تواريخ الأسبوع الأول؟')) {
                const resetConfig: WeekScheduleConfig = {
                  ...scheduleConfig,
                  isStarted: false,
                };
                saveScheduleConfig(resetConfig);
                onUpdateSchedule(resetConfig);
              }
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="إعادة ضبط جدول الأسبوع"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
