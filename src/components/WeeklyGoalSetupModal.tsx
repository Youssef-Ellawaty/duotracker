import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Sparkles, Check, X, Info, Plus, Minus, BookOpen } from 'lucide-react';
import { SubjectGoal, WeeklyData } from '../types';
import { SubjectIcon } from './SubjectIcon';

interface WeeklyGoalSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyData: WeeklyData;
  onSaveWeeklyGoals: (updatedData: WeeklyData) => void;
}

export const WeeklyGoalSetupModal: React.FC<WeeklyGoalSetupModalProps> = ({
  isOpen,
  onClose,
  weeklyData,
  onSaveWeeklyGoals,
}) => {
  const [goals, setGoals] = useState<SubjectGoal[]>(weeklyData.subjectGoals);
  const [notes, setNotes] = useState(weeklyData.notes || '');

  useEffect(() => {
    if (isOpen) {
      setGoals(weeklyData.subjectGoals);
      setNotes(weeklyData.notes || '');
    }
  }, [isOpen, weeklyData]);

  if (!isOpen) return null;

  const handleTargetChange = (subjectId: string, delta: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.subjectId === subjectId) {
          const newTarget = Math.max(0, Math.min(10, g.targetSessions + delta));
          return {
            ...g,
            targetSessions: newTarget,
          };
        }
        return g;
      })
    );
  };

  const handleSave = () => {
    onSaveWeeklyGoals({
      ...weeklyData,
      subjectGoals: goals,
      notes,
    });
    onClose();
  };

  const plannedCount = goals.filter((g) => g.targetSessions > 0).length;
  const zeroCount = goals.filter((g) => g.targetSessions === 0).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl glass-panel rounded-3xl border border-slate-700/80 p-4 sm:p-7 shadow-2xl my-4 sm:my-8 max-w-full overflow-hidden"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-3 pr-8 sm:pr-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Target className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl font-extrabold text-white truncate">
                {plannedCount > 0 ? 'تعديل أهداف الأسبوع (Edit Goals)' : 'تحديد أهداف الأسبوع (Set Goals)'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                حدد عدد الجلسات المستهدفة (من 0 إلى 10) لكل مادة هذا الأسبوع
              </p>
            </div>
          </div>

          {/* Business Logic Alert banner */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs flex items-start gap-2.5 mb-4">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">خاصية البونص الإضافي:</p>
              <p className="text-slate-300 leading-snug">
                المواد ذات القيمة <strong>0</strong> تصنف في قسم <span className="text-emerald-400 font-bold">البونص الأسبوعي</span>. وأي جلسة تنجزها بها تمنحك 100% نقاط بونص!
              </p>
            </div>
          </div>

          {/* Subject Target Inputs */}
          <div className="space-y-2.5 mb-4 max-h-[320px] overflow-y-auto pr-1">
            {goals.map((item) => (
              <div
                key={item.subjectId}
                className={`flex items-center justify-between gap-2 p-2.5 sm:p-3.5 rounded-2xl border transition-all ${
                  item.targetSessions > 0
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-slate-950/60 border-slate-800/60 opacity-80'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                    <SubjectIcon name={item.iconName} className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.subjectNameEn || item.subjectNameAr}
                      </span>
                      {item.targetSessions === 0 && (
                        <span className="text-[9px] sm:text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-500/30 shrink-0">
                          بونص
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">
                      {item.targetSessions > 0
                        ? `المستهدف: ${item.targetSessions} جلسة`
                        : 'غير مخطط - احتياطي البونص'}
                    </div>
                  </div>
                </div>

                {/* Counter Control */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTargetChange(item.subjectId, -1)}
                    disabled={item.targetSessions <= 0}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-6 sm:w-8 text-center font-extrabold text-sm sm:text-base text-emerald-400 font-mono">
                    {item.targetSessions}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleTargetChange(item.subjectId, 1)}
                    disabled={item.targetSessions >= 10}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Initial Notes Field */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Weekly Notepad & Task Reminders</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write custom reminders, chapters to revise, or weekly targets..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
            />
          </div>

          {/* Summary & Save */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Planned Core Subjects: <strong className="text-white font-bold">{plannedCount}</strong> | Bonus Reserve Subjects: <strong className="text-emerald-400 font-bold">{zeroCount}</strong>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Apply Goals</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
