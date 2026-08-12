import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Archive,
  Calendar,
  CheckCircle2,
  Crown,
  Trophy,
  Zap,
  Flame,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react';
import { PastWeekRecord, UserProfile } from '../../types';
import { SubjectIcon } from '../SubjectIcon';

interface HistoryViewProps {
  pastWeeks: PastWeekRecord[];
  userProfile: UserProfile;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ pastWeeks, userProfile }) => {
  const [activeSubTab, setActiveSubTab] = useState<'MY_PAST' | 'PARTNER_PAST'>('MY_PAST');
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);

  const toggleWeekExpand = (id: string) => {
    setExpandedWeekId(expandedWeekId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-toggle switch */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 font-['Outfit']">
            <Archive className="w-6 h-6 text-blue-400" />
            <span>History & Weekly Archives</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse past archived weeks, completed sessions, and head-to-head records
          </p>
        </div>

        {/* Sub-toggle switch [My Past Weeks | Partner's Past Weeks] */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('MY_PAST')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'MY_PAST'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Past Weeks ({userProfile.name})
          </button>

          <button
            onClick={() => setActiveSubTab('PARTNER_PAST')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'PARTNER_PAST'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Partner's Past Weeks ({userProfile.partnerName})
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {pastWeeks.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-3xl border border-slate-800 text-slate-400 text-sm">
            No archived weeks recorded yet. Finishing a week will automatically archive your goals here!
          </div>
        ) : (
          pastWeeks.map((week) => {
            const isUser = activeSubTab === 'MY_PAST';
            const metrics = isUser ? week.userMetrics : week.partnerMetrics;
            const isWinner = week.winnerName === metrics.userName;
            const isExpanded = expandedWeekId === week.weekId;

            return (
              <div
                key={week.weekId}
                className="glass-panel rounded-3xl border border-slate-800 overflow-hidden transition-all hover:border-slate-700"
              >
                {/* Week Card Header */}
                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {week.startDate} to {week.endDate}
                      </span>

                      {isWinner && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" /> Week Winner 👑
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-extrabold text-white">{week.weekTitle}</h3>
                  </div>

                  {/* Score Highlights */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-slate-800/80 pt-3 sm:pt-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total Score</div>
                      <div className="text-xl font-black text-amber-400 font-mono">
                        {metrics.finalScore} <span className="text-xs">pts</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">Completion</div>
                      <div className="text-xl font-black text-emerald-400 font-mono">
                        {metrics.completionRate}%
                      </div>
                    </div>

                    <button
                      onClick={() => toggleWeekExpand(week.weekId)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                      title="View subject details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Accordion */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-5 bg-slate-950/60 border-t border-slate-800/80 space-y-4"
                  >
                    {/* Metrics Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Target Sessions</span>
                        <strong className="text-white text-base font-mono font-bold">{metrics.totalTarget}</strong>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Completed Sessions</span>
                        <strong className="text-emerald-400 text-base font-mono font-bold">{metrics.totalCompleted}</strong>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Bonus Points</span>
                        <strong className="text-amber-400 text-base font-mono font-bold">+{metrics.bonusPoints}</strong>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Crowned Winner</span>
                        <strong className="text-yellow-300 text-sm font-bold flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5" /> {week.winnerName}
                        </strong>
                      </div>
                    </div>

                    {/* Subjects breakdown list */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 mb-2">Subject Breakdown:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {metrics.subjectGoals.map((sub) => (
                          <div
                            key={sub.subjectId}
                            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <SubjectIcon name={sub.iconName} className="w-4 h-4 text-emerald-400" />
                              <span className="font-bold text-slate-200">{sub.subjectNameEn || sub.subjectNameAr}</span>
                            </div>
                            <span className="font-mono text-slate-300">
                              {sub.completedSessions} / {sub.targetSessions === 0 ? 'Bonus' : sub.targetSessions}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Week Notes */}
                    {metrics.notes && (
                      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-300">
                        <span className="text-slate-400 font-bold block mb-1">Archived Notepad Notes:</span>
                        <p className="whitespace-pre-line leading-relaxed">{metrics.notes}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
