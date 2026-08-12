import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Target,
  CheckCircle2,
  Zap,
  Flame,
  Award,
  Plus,
  Edit3,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { SubjectGoal, WeeklyData } from '../../types';
import { SubjectCard } from '../SubjectCard';
import { NotepadModule } from '../NotepadModule';
import { calculateWeeklyScore } from '../../utils/scoreCalculator';

interface MyWeekViewProps {
  weeklyData: WeeklyData;
  isBeforeStart?: boolean;
  onUpdateWeeklyData: (data: WeeklyData) => void;
  onOpenSetupModal: () => void;
}

export const MyWeekView: React.FC<MyWeekViewProps> = ({
  weeklyData,
  isBeforeStart = false,
  onUpdateWeeklyData,
  onOpenSetupModal,
}) => {
  const [showExtraSection, setShowExtraSection] = useState(true);

  const metrics = calculateWeeklyScore(weeklyData.subjectGoals);

  const plannedGoals = weeklyData.subjectGoals.filter((g) => g.targetSessions > 0);
  const extraGoals = weeklyData.subjectGoals.filter((g) => g.targetSessions === 0);

  const handleIncrement = (subjectId: string) => {
    const updatedGoals = weeklyData.subjectGoals.map((g) => {
      if (g.subjectId === subjectId) {
        return {
          ...g,
          completedSessions: g.completedSessions + 1,
        };
      }
      return g;
    });

    onUpdateWeeklyData({
      ...weeklyData,
      subjectGoals: updatedGoals,
    });
  };

  const handleDecrement = (subjectId: string) => {
    const updatedGoals = weeklyData.subjectGoals.map((g) => {
      if (g.subjectId === subjectId && g.completedSessions > 0) {
        return {
          ...g,
          completedSessions: g.completedSessions - 1,
        };
      }
      return g;
    });

    onUpdateWeeklyData({
      ...weeklyData,
      subjectGoals: updatedGoals,
    });
  };

  const handleNotesChange = (notes: string) => {
    onUpdateWeeklyData({
      ...weeklyData,
      notes,
    });
  };

  const hasSetGoals = metrics.totalTarget > 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Active Week
            </span>
            <span className="text-xs text-slate-400">{weeklyData.weekTitle}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Outfit']">My Weekly Goals Dashboard</h2>
        </div>

        {/* Set Goals vs Edit Goals Button Control */}
        {!hasSetGoals ? (
          <button
            onClick={onOpenSetupModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 shrink-0"
          >
            <Target className="w-4 h-4" />
            <span>تحديد أهداف الأسبوع (Set Goals)</span>
          </button>
        ) : (
          <button
            onClick={onOpenSetupModal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-95 shrink-0"
          >
            <Edit3 className="w-4 h-4 text-emerald-400" />
            <span>تعديل الأهداف (Edit Goals)</span>
          </button>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Planned Target */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Planned Goal</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {metrics.totalTarget} <span className="text-xs font-normal text-slate-500">sessions</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across {plannedGoals.length} core subjects</p>
        </div>

        {/* Total Completed */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {metrics.totalCompleted} <span className="text-xs font-normal text-slate-500">sessions</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total logged sessions</p>
        </div>

        {/* Completion Rate */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Goal Progress</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {metrics.completionRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Target completion rate</p>
        </div>

        {/* Final Score + Bonus */}
        <div className="glass-card-amber p-4 rounded-2xl">
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-xs font-semibold">Total Final Score</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
            {metrics.finalScore} <span className="text-xs font-normal">pts</span>
          </div>
          <p className="text-[11px] text-amber-400/90 mt-1 font-bold">
            Includes +{metrics.bonusPoints} bonus overachievement points!
          </p>
        </div>
      </div>

      {/* Main Planned Subject Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>Planned Core Subjects</span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {plannedGoals.length} Core Subjects
          </span>
        </div>

        {plannedGoals.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-3xl border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">لم يتم تحديد أهداف هذا الأسبوع بعد</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                اضغط على زر <strong>"تحديد أهداف الأسبوع (Set Goals)"</strong> لتحديد الجلسات المستهدفة للمواد الدراسية.
              </p>
            </div>
            <button
              onClick={onOpenSetupModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Target className="w-4 h-4" />
              <span>تحديد أهداف الأسبوع الآن (Set Goals)</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plannedGoals.map((item) => (
              <SubjectCard
                key={item.subjectId}
                item={item}
                isBeforeStart={isBeforeStart}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            ))}
          </div>
        )}
      </div>

      {/* Collapsed Section for 0-Target / Extra Bonus Subjects */}
      {extraGoals.length > 0 && (
        <div className="glass-panel rounded-3xl border border-slate-800/80 p-5 space-y-4">
          <button
            type="button"
            onClick={() => setShowExtraSection(!showExtraSection)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                  <span>Bonus Reserve & Extra Subjects</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {extraGoals.length} subjects
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Sessions completed in these subjects award 100% bonus score to boost your lead!
                </p>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-900 text-slate-400 group-hover:text-white transition-colors">
              {showExtraSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {showExtraSection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
            >
              {extraGoals.map((item) => (
                <SubjectCard
                  key={item.subjectId}
                  item={item}
                  isBeforeStart={isBeforeStart}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                />
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Sticky Notepad Module */}
      <NotepadModule
        initialNotes={weeklyData.notes}
        onSaveNotes={handleNotesChange}
      />
    </div>
  );
};
