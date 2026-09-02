import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  FileText,
  Trash2,
  Users,
  Flame,
  Check,
  Zap,
  TrendingDown,
} from 'lucide-react';
import { SubjectBacklogItem, UserBacklogData, UserProfile } from '../../types';
import { SubjectIcon } from '../SubjectIcon';
import confetti from 'canvas-confetti';

interface BacklogViewProps {
  myBacklog: UserBacklogData;
  partnerBacklog: UserBacklogData;
  userProfile: UserProfile;
  onUpdateMyBacklog: (updated: UserBacklogData) => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({
  myBacklog,
  partnerBacklog,
  userProfile,
  onUpdateMyBacklog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'MY_BACKLOG' | 'PARTNER_BACKLOG'>('MY_BACKLOG');
  const [editingNotesSubjectId, setEditingNotesSubjectId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>('');

  const currentData = activeSubTab === 'MY_BACKLOG' ? myBacklog : partnerBacklog;
  const isReadOnly = activeSubTab === 'PARTNER_BACKLOG';

  const totalPending = (currentData.items || []).reduce((acc, item) => acc + (item.pendingCount || 0), 0);
  const totalCleared = (currentData.items || []).reduce((acc, item) => acc + (item.clearedCount || 0), 0);

  const handleIncrement = (subjectId: string, delta: number = 1) => {
    if (isReadOnly) return;
    const updatedItems = myBacklog.items.map((item) => {
      if (item.subjectId === subjectId) {
        return {
          ...item,
          pendingCount: Math.max(0, (item.pendingCount || 0) + delta),
        };
      }
      return item;
    });

    onUpdateMyBacklog({
      ...myBacklog,
      items: updatedItems,
    });
  };

  const handleDecrement = (subjectId: string) => {
    if (isReadOnly) return;
    let didCelebrate = false;

    const updatedItems = myBacklog.items.map((item) => {
      if (item.subjectId === subjectId) {
        const currentPending = item.pendingCount || 0;
        if (currentPending <= 0) return item;

        didCelebrate = true;
        return {
          ...item,
          pendingCount: currentPending - 1,
          clearedCount: (item.clearedCount || 0) + 1,
        };
      }
      return item;
    });

    if (didCelebrate) {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#8b5cf6'],
      });
    }

    onUpdateMyBacklog({
      ...myBacklog,
      items: updatedItems,
    });
  };

  const handleClearSubject = (subjectId: string) => {
    if (isReadOnly) return;
    const item = myBacklog.items.find((i) => i.subjectId === subjectId);
    if (!item || item.pendingCount === 0) return;

    const clearedNow = item.pendingCount;
    const updatedItems = myBacklog.items.map((i) => {
      if (i.subjectId === subjectId) {
        return {
          ...i,
          pendingCount: 0,
          clearedCount: (i.clearedCount || 0) + clearedNow,
        };
      }
      return i;
    });

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#6ee7b7', '#fcd34d'],
    });

    onUpdateMyBacklog({
      ...myBacklog,
      items: updatedItems,
    });
  };

  const handleOpenNotes = (item: SubjectBacklogItem) => {
    setEditingNotesSubjectId(item.subjectId);
    setNotesDraft(item.notes || '');
  };

  const handleSaveNotes = (subjectId: string) => {
    if (isReadOnly) return;
    const updatedItems = myBacklog.items.map((item) => {
      if (item.subjectId === subjectId) {
        return {
          ...item,
          notes: notesDraft.trim(),
        };
      }
      return item;
    });

    onUpdateMyBacklog({
      ...myBacklog,
      items: updatedItems,
    });
    setEditingNotesSubjectId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header & Sub-Tabs Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-3 sm:p-4 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>السيشنز المتراكمة (Backlog)</span>
              {totalPending > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {totalPending} متبقية
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> بدون متراكمات
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              تتبع وتصفية الحصص والمحاضرات المتراكمة لكل مادة وإضافتها أو إنقاصها بسهولة
            </p>
          </div>
        </div>

        {/* SubTab Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-center w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('MY_BACKLOG')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'MY_BACKLOG'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>متراكماتي ({userProfile.name})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('PARTNER_BACKLOG')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'PARTNER_BACKLOG'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>متراكمات {userProfile.partnerName}</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Pending */}
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 relative overflow-hidden flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>إجمالي السيشنات المتراكمة</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
              {totalPending} <span className="text-xs font-bold text-slate-400">جلسة</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {totalPending === 0
                ? 'أداء ممتاز! لا توجد محاضرات متأخرة'
                : 'جاهزون لتصفيتها جلسة بجلسة'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Total Cleared */}
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 relative overflow-hidden flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تمت تصفيتها وإنجازها</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
              {totalCleared} <span className="text-xs font-bold text-slate-400">جلسة تم إنهاؤها</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              كل جلسة تنجزها تقربك خطوة من هدفك
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Track & Academic Branch */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-violet-400 mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>الشعبة والمواد المخصصة</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
              {currentData.track === 'SCI_MATH' ? 'علمي رياضة (Math & Mech)' : 'علمي علوم (Bio & Geo)'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {currentData.items.length} مواد مسجلة بحسب المسار الأكاديمي
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Helper Banner */}
      {!isReadOnly && (
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              💡 <strong>طريقة الاستخدام:</strong> اضغط على <strong>+</strong> لإضافة سيشن متراكم، واضغط على <strong>-</strong> عند إنجاز وتصفية أي سيشن ليتم الاحتفال بإنجازها سحابياً!
            </span>
          </div>
        </div>
      )}

      {/* Grid of Subject Backlog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {currentData.items.map((item) => {
          const isZero = (item.pendingCount || 0) === 0;
          const isEditingNotes = editingNotesSubjectId === item.subjectId;

          return (
            <motion.div
              key={item.subjectId}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`glass-panel p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isZero
                  ? 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700'
                  : 'border-amber-500/30 bg-slate-900/80 shadow-lg shadow-amber-500/5'
              }`}
            >
              {/* Top Row: Icon + Subject Title */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} p-0.5 shadow-md shrink-0`}>
                      <div className="w-full h-full bg-slate-950/80 rounded-[10px] flex items-center justify-center text-white">
                        <SubjectIcon name={item.iconName} className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight">{item.subjectNameAr}</h3>
                      <p className="text-[11px] text-slate-400">{item.subjectNameEn}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isZero ? (
                    <span className="px-2 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                      <Check className="w-3 h-3" />
                      خالص تماماً
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-xl text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                      <AlertCircle className="w-3 h-3" />
                      {item.pendingCount} متبقي
                    </span>
                  )}
                </div>

                {/* Counter & Action Controls */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2 mb-3">
                  <div className="text-right">
                    <div className="text-[11px] font-medium text-slate-400">السيشنز المتراكمة:</div>
                    <div className="text-2xl font-black text-white font-['Outfit'] flex items-baseline gap-1">
                      <span className={isZero ? 'text-slate-400' : 'text-amber-400'}>{item.pendingCount || 0}</span>
                      <span className="text-[10px] font-semibold text-slate-500">سيشن</span>
                    </div>
                  </div>

                  {!isReadOnly ? (
                    <div className="flex items-center gap-1.5">
                      {/* Decrement / Solved 1 */}
                      <button
                        onClick={() => handleDecrement(item.subjectId)}
                        disabled={isZero}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all ${
                          isZero
                            ? 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/10'
                        }`}
                        title="تصفية جلسة متراكمة (Mark 1 Solved)"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      {/* Increment / Add 1 */}
                      <button
                        onClick={() => handleIncrement(item.subjectId, 1)}
                        className="w-9 h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold active:scale-95 cursor-pointer transition-all shadow-sm shadow-amber-500/10"
                        title="إضافة جلسة متراكمة (Add 1 Backlog Session)"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      {/* Quick +5 */}
                      <button
                        onClick={() => handleIncrement(item.subjectId, 5)}
                        className="px-2 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center text-xs font-bold active:scale-95 cursor-pointer transition-all"
                        title="إضافة 5 جلسات دفعة واحدة"
                      >
                        +5
                      </button>
                    </div>
                  ) : (
                    <div className="text-left text-xs text-slate-400 font-semibold px-2">
                      {(item.pendingCount || 0) === 0 ? '✨ منجز بالكامل' : `⏳ ${item.pendingCount} قيد التصفية`}
                    </div>
                  )}
                </div>

                {/* Notes / Lessons description display */}
                <div className="space-y-1.5">
                  {item.notes ? (
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1 break-words font-medium">{item.notes}</div>
                    </div>
                  ) : null}

                  {/* Notes Editor Accordion / Modal */}
                  <AnimatePresence>
                    {isEditingNotes && !isReadOnly && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2 mt-2"
                      >
                        <label className="text-[11px] font-bold text-amber-300 block">
                          تحديد أرقام الدروس أو أسماء المحاضرات المتراكمة:
                        </label>
                        <input
                          type="text"
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="مثال: الفصل الثاني الدرس 3 و 4 + واجب الحصة"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingNotesSubjectId(null)}
                            className="px-2.5 py-1 rounded-md text-[11px] text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={() => handleSaveNotes(item.subjectId)}
                            className="px-3 py-1 rounded-md text-[11px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 cursor-pointer"
                          >
                            حفظ الملاحظة
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom Quick Actions */}
              {!isReadOnly && !isEditingNotes && (
                <div className="flex items-center justify-between gap-1 pt-2.5 mt-2 border-t border-slate-800/60 text-[11px]">
                  <button
                    onClick={() => handleOpenNotes(item)}
                    className="text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{item.notes ? 'تعديل أسماء الدروس' : '+ كتابة تفاصيل الدروس'}</span>
                  </button>

                  {!isZero && (
                    <button
                      onClick={() => handleClearSubject(item.subjectId)}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
                      title="تصفير وتصفية جميع متراكمات هذه المادة"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>تصفية الكل</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Motivational Bottom Box */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white">
              «المتراكم يتصفى ساعة بساعة وجلسة بجلسة»
            </div>
            <div className="text-[11px] text-slate-400">
              كلما قللت المتراكمات كلما زاد تركيزك وتفوقك في المذاكرة الأسبوعية
            </div>
          </div>
        </div>
        <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
          مزامنة سحابية مباشرة عبر Firebase ⚡
        </div>
      </div>
    </div>
  );
};
