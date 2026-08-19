import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Plus, ShieldAlert, Sparkles, Trash2, Pencil, Check, X, ListChecks } from 'lucide-react';
import { UserProfile } from '../types';
import { CurrentWeekCalculation, WeekPeriod, WeekScheduleConfig } from '../utils/schedule';

interface WeekScheduleBannerProps {
  userProfile: UserProfile;
  scheduleConfig: WeekScheduleConfig;
  currentWeekInfo: CurrentWeekCalculation;
  onAddPeriod: (name: string, startDate: string, endDate: string) => void;
  onUpdatePeriod: (periodId: string, updates: { name?: string; startDate?: string; endDate?: string }) => void;
  onDeletePeriod: (periodId: string) => void;
}

export const WeekScheduleBanner: React.FC<WeekScheduleBannerProps> = ({
  userProfile,
  scheduleConfig,
  currentWeekInfo,
  onAddPeriod,
  onUpdatePeriod,
  onDeletePeriod,
}) => {
  const isYoussef = userProfile.name.toLowerCase().includes('youssef');
  const [showManager, setShowManager] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; startDate: string; endDate: string }>({
    name: '',
    startDate: '',
    endDate: '',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;
    onAddPeriod(name.trim(), startDate, endDate);
    setName('');
  };

  const startEdit = (p: WeekPeriod) => {
    setEditingId(p.id);
    setEditValues({ name: p.name, startDate: p.startDate, endDate: p.endDate });
  };

  const saveEdit = (id: string) => {
    onUpdatePeriod(id, editValues);
    setEditingId(null);
  };

  const sortedPeriods = [...(scheduleConfig.periods || [])].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="space-y-4 my-4">
      {/* Active/Next Status Card */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-black ${
              currentWeekInfo.hasActivePeriod
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
            }`}
          >
            {currentWeekInfo.ordinal || '—'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{currentWeekInfo.weekTitle}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  currentWeekInfo.hasActivePeriod
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}
              >
                {currentWeekInfo.hasActivePeriod ? 'نشط الآن' : 'بانتظار'}
              </span>
            </div>
            {currentWeekInfo.startDateFormatted !== '--' && (
              <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-3">
                <span>من: <strong className="text-slate-200">{currentWeekInfo.startDateFormatted}</strong></span>
                <span>إلى: <strong className="text-slate-200">{currentWeekInfo.endDateFormatted}</strong></span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {currentWeekInfo.timeRemainingStr && (
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {currentWeekInfo.hasActivePeriod ? 'متبقي على النهاية' : 'متبقي على البدء'}
              </div>
              <div className="text-xs font-black text-amber-400 font-mono mt-0.5">
                {currentWeekInfo.timeRemainingStr}
              </div>
            </div>
          )}

          {isYoussef && (
            <button
              onClick={() => setShowManager((s) => !s)}
              className="p-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/40 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="إدارة فترات الأسابيع"
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إدارة الفترات</span>
            </button>
          )}
        </div>
      </div>

      {/* Youssef's Period Manager */}
      {isYoussef && (
        <AnimatePresence>
          {showManager && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel p-6 rounded-3xl border-2 border-violet-500/40 bg-gradient-to-br from-violet-950/40 via-slate-900/90 to-emerald-950/30 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="w-32 h-32 text-violet-400" />
              </div>

              <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
                    تحكم يوسف اللواتي (إدارة فترات المذاكرة)
                  </span>
                </div>

                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  أضف فترة مذاكرة جديدة باسم مخصص وتاريخ بداية ونهاية حرّين تماماً — لا يشترط أن تبدأ الفترة الجديدة
                  مباشرة بعد انتهاء السابقة. القطع اليومي/الأسبوعي يكون الساعة <strong>5:00 فجراً</strong>.
                </p>

                {/* Add Form */}
                <form onSubmit={handleAdd} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">اسم الفترة:</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: الأسبوع الأول، أسبوع المراجعة النهائية..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تاريخ البداية:</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        <span>تاريخ النهاية:</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-violet-600/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة الفترة</span>
                  </button>
                </form>

                {/* Periods List */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300">كل الفترات المضافة:</h4>
                  {sortedPeriods.length === 0 && (
                    <p className="text-xs text-slate-500">لا توجد فترات بعد.</p>
                  )}
                  {sortedPeriods.map((p) => {
                    const isEditing = editingId === p.id;
                    const isActive = currentWeekInfo.activePeriod?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isActive ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-900/70 border-slate-800'
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex flex-col sm:flex-row gap-2 flex-1">
                            <input
                              value={editValues.name}
                              onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs flex-1"
                            />
                            <input
                              type="date"
                              value={editValues.startDate}
                              onChange={(e) => setEditValues((v) => ({ ...v, startDate: e.target.value }))}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                            />
                            <input
                              type="date"
                              value={editValues.endDate}
                              onChange={(e) => setEditValues((v) => ({ ...v, endDate: e.target.value }))}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                            />
                          </div>
                        ) : (
                          <div className="text-xs">
                            <span className="font-bold text-white">{p.name}</span>
                            {isActive && <span className="text-emerald-400 mr-2">(نشطة الآن)</span>}
                            <div className="text-slate-400 mt-0.5">{p.startDate} → {p.endDate}</div>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(p.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(p)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                                title="تعديل"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`حذف فترة "${p.name}"؟`)) onDeletePeriod(p.id);
                                }}
                                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Emy: waiting message when no active period */}
      {!isYoussef && !currentWeekInfo.hasActivePeriod && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-500/10 shadow-xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">في انتظار تحديد فترة مذاكرة جديدة بواسطة يوسف اللواتي ⏳</h3>
          </div>
        </div>
      )}
    </div>
  );
};
