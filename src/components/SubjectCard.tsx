import React from 'react';
import { motion } from 'motion/react';
import { Plus, Minus, Flame, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { SubjectGoal } from '../types';
import { SubjectIcon } from './SubjectIcon';
import confetti from 'canvas-confetti';

interface SubjectCardProps {
  item: SubjectGoal;
  isPartnerView?: boolean;
  isBeforeStart?: boolean;
  onIncrement?: (subjectId: string) => void;
  onDecrement?: (subjectId: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  item,
  isPartnerView = false,
  isBeforeStart = false,
  onIncrement,
  onDecrement,
}) => {
  const isZeroTarget = item.targetSessions === 0;
  const isCompleted = item.targetSessions > 0 && item.completedSessions >= item.targetSessions;
  const isOverachieved = item.targetSessions > 0 && item.completedSessions > item.targetSessions;

  const progressPercent = isZeroTarget
    ? item.completedSessions > 0 ? 100 : 0
    : Math.min(100, Math.round((item.completedSessions / item.targetSessions) * 100));

  const handleIncrementClick = () => {
    if (isBeforeStart) {
      alert('⚠️ يمكن وضع الأهداف والخطة الآن، ولكن لا يمكن تسجيل إنجاز المواد إلا عند بداية الأسبوع رسمياً!');
      return;
    }
    if (!onIncrement) return;
    
    // Celebratory effect when target reached or overachieved
    if (item.targetSessions > 0 && item.completedSessions + 1 === item.targetSessions) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
      });
    } else if (isZeroTarget && item.completedSessions === 0) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#8b5cf6', '#a78bfa', '#10b981'],
      });
    }

    onIncrement(item.subjectId);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`relative w-full overflow-hidden rounded-2xl p-4 sm:p-5 transition-all ${
        isPartnerView
          ? 'glass-card-violet hover:border-violet-500/40'
          : isOverachieved
          ? 'glass-card-amber hover:border-amber-500/50 glow-amber'
          : isCompleted
          ? 'glass-card-emerald hover:border-emerald-500/50 glow-emerald'
          : 'glass-card hover:border-slate-700'
      }`}
    >
      {/* Top Card Info */}
      <div className="flex items-start justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
            <SubjectIcon name={item.iconName} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate leading-tight">
                {item.subjectNameEn || item.subjectNameAr}
              </h3>
              {isOverachieved && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse shrink-0">
                  <Flame className="w-3 h-3 text-amber-400" />
                  +{item.completedSessions - item.targetSessions}
                </span>
              )}
              {isZeroTarget && item.completedSessions > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Bonus
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
              {isZeroTarget
                ? 'مادة بونص إضافية (+100% نقاط)'
                : `المستهدف الأسبوعي: ${item.targetSessions} جلسة`}
            </p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end gap-0.5 font-mono">
            <span className={`text-lg sm:text-2xl font-black ${
              isPartnerView
                ? 'text-violet-400'
                : isOverachieved
                ? 'text-amber-400'
                : isCompleted
                ? 'text-emerald-400'
                : 'text-white'
            }`}>
              {item.completedSessions}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              / {isZeroTarget ? '∞' : item.targetSessions}
            </span>
          </div>

          <div className="text-[10px] font-semibold text-slate-400">
            {isZeroTarget
              ? `${item.completedSessions} بونص`
              : `${progressPercent}%`}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-slate-950/80 rounded-full overflow-hidden mb-3.5 border border-slate-800/80">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isPartnerView
              ? 'bg-gradient-to-r from-violet-600 to-purple-400'
              : isOverachieved
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
              : isCompleted
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-emerald-600 to-cyan-500'
          }`}
        />
      </div>

      {/* Action Controls for Personal View */}
      {!isPartnerView && (
        <div className="flex items-center gap-2 pt-2.5 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              if (isBeforeStart) {
                alert('⚠️ لا يمكن تعديل الإنجاز قبل بداية الأسبوع الرسمية!');
                return;
              }
              onDecrement && onDecrement(item.subjectId);
            }}
            disabled={item.completedSessions <= 0}
            className="w-11 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed text-slate-300 border border-slate-800 transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
            title={isBeforeStart ? "يبدأ الأسبوع قريباً" : "Remove 1 session"}
            aria-label="Decrease session count"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleIncrementClick}
            title={isBeforeStart ? "يمكنك وضع الخطة الآن، ويبدأ تسجيل الإنجاز عند انطلاق الأسبوع" : "Add 1 session"}
            className={`flex-1 h-11 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 ${
              isBeforeStart
                ? 'bg-slate-800/80 text-slate-400 border border-slate-700/80'
                : isZeroTarget
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-purple-600/20'
                : isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {isBeforeStart
                ? 'يبدأ تسجيل الإنجاز قريباً ⏳'
                : isZeroTarget
                ? '+1 جلسة بونص'
                : '+1 جلسة مكتملة'}
            </span>
          </button>
        </div>
      )}

      {/* Partner View Status Badge */}
      {isPartnerView && (
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400">حالة الشريك:</span>
          {isCompleted ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> تم إنجاز الهدف! 🎯
            </span>
          ) : item.completedSessions > 0 ? (
            <span className="text-violet-300 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-violet-400" /> جارٍ المذاكرة ({item.completedSessions} جلسات)
            </span>
          ) : (
            <span className="text-slate-500">لم يبدأ بعد</span>
          )}
        </div>
      )}
    </motion.div>
  );
};
