import React from 'react';
import { motion } from 'motion/react';
import { Crown, Trophy, Sparkles, Flame, ChevronLeft } from 'lucide-react';
import { PastWeekRecord } from '../types';
import confetti from 'canvas-confetti';

interface ChampionBannerProps {
  latestWeek: PastWeekRecord | null;
  onOpenHallOfFame: () => void;
}

export const ChampionBanner: React.FC<ChampionBannerProps> = ({ latestWeek, onOpenHallOfFame }) => {
  if (!latestWeek) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#f59e0b', '#10b981', '#8b5cf6', '#ec4899'],
    });
  };

  const isUserWinner = latestWeek.winnerName === latestWeek.userMetrics.userName;

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden mb-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/30 p-4 sm:p-5 backdrop-blur-md shadow-2xl glow-amber"
    >
      {/* Background Decorative Sparkles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        {/* Crown & Info */}
        <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left">
          <div
            onClick={triggerConfetti}
            className="cursor-pointer relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-105 transition-transform"
            title="Click for celebratory fireworks!"
          >
            <Crown className="w-7 h-7 sm:w-8 sm:h-8 fill-slate-950 animate-pulse" />
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-200 animate-spin" />
          </div>

          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Trophy className="w-3 h-3 text-amber-400" />
                Previous Week's Champion
              </span>
              <span className="text-xs text-slate-400 hidden md:inline">({latestWeek.weekTitle})</span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 flex items-center gap-2 justify-center sm:justify-start">
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                👑 {latestWeek.winnerName}
              </span>
              {isUserWinner && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                  You Won! 🎉
                </span>
              )}
            </h2>

            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-3 justify-center sm:justify-start">
              <span>
                Final Score: <strong className="text-amber-300 font-bold">{latestWeek.winnerScore}%</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 inline" />
                Outstanding Achievement
              </span>
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenHallOfFame}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center justify-center gap-2 text-sm font-semibold group hover:border-amber-500/60 cursor-pointer"
        >
          <span>View Hall of Fame</span>
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 rotate-180 sm:rotate-180" />
        </button>
      </div>
    </motion.div>
  );
};
