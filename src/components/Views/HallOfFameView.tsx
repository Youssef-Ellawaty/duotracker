import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Medal, Flame, Sparkles, Award, Star } from 'lucide-react';
import { PastWeekRecord, UserProfile } from '../../types';
import confetti from 'canvas-confetti';

interface HallOfFameViewProps {
  pastWeeks: PastWeekRecord[];
  userProfile: UserProfile;
}

export const HallOfFameView: React.FC<HallOfFameViewProps> = ({ pastWeeks, userProfile }) => {
  // Compute overall wins
  let userWins = 0;
  let partnerWins = 0;

  pastWeeks.forEach((w) => {
    if (w.winnerName === userProfile.name) userWins++;
    else if (w.winnerName === userProfile.partnerName) partnerWins++;
  });

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.3 },
      colors: ['#f59e0b', '#fbbf24', '#10b981', '#8b5cf6'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900 to-yellow-950/20 glow-amber">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Championship Honors
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 font-['Outfit']">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>Weekly Hall of Fame</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Roll of honor showcasing weekly winners, crowned champions, and score history
          </p>
        </div>

        <button
          onClick={triggerCelebration}
          className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Celebrate Crown 👑</span>
        </button>
      </div>

      {/* Head-to-Head Trophy Standings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* User Wins Box */}
        <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900 text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3">
            <Crown className="w-7 h-7" />
          </div>
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Your Titles ({userProfile.name})
          </div>
          <div className="text-4xl font-black text-white font-mono my-1">
            {userWins} <span className="text-sm font-semibold text-slate-400">Wins</span>
          </div>
          <p className="text-xs text-slate-400">Crowned weekly champion {userWins} times</p>
        </div>

        {/* Partner Wins Box */}
        <div className="glass-card p-6 rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/20 to-slate-900 text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 mx-auto mb-3">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="text-xs font-bold text-violet-400 uppercase tracking-wider">
            Partner's Titles ({userProfile.partnerName})
          </div>
          <div className="text-4xl font-black text-white font-mono my-1">
            {partnerWins} <span className="text-sm font-semibold text-slate-400">Wins</span>
          </div>
          <p className="text-xs text-slate-400">Crowned weekly champion {partnerWins} times</p>
        </div>
      </div>

      {/* Past Champions Roll of Honor */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Medal className="w-5 h-5 text-amber-400" />
          <span>Past Weekly Champions Roll of Honor</span>
        </h3>

        <div className="space-y-3">
          {pastWeeks.map((week, idx) => {
            const isUserWinner = week.winnerName === userProfile.name;

            return (
              <motion.div
                key={week.weekId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/30 flex-shrink-0">
                    👑
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{week.startDate}</span>
                      <span className="text-xs font-bold text-amber-400">({week.weekTitle})</span>
                    </div>

                    <h4 className="text-base font-extrabold text-white mt-0.5 flex items-center gap-2">
                      <span>Crowned Winner:</span>
                      <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                        {week.winnerName}
                      </span>
                      {isUserWinner && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                          You!
                        </span>
                      )}
                    </h4>
                  </div>
                </div>

                {/* Badges & Scores */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-slate-800/80 pt-3 sm:pt-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>Mastery Badge</span>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Winning Score</div>
                    <div className="text-xl font-black text-amber-300 font-mono">
                      {week.winnerScore}%
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
