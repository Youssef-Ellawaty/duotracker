import React from 'react';
import { motion } from 'motion/react';
import {
  CalendarDays,
  Users,
  Archive,
  Trophy,
  UserCheck,
  RotateCcw,
  Database,
  Sparkles,
  Zap,
  LogOut,
} from 'lucide-react';
import { TabView, UserProfile } from '../types';

interface NavbarProps {
  activeTab: TabView;
  setActiveTab: (tab: TabView) => void;
  userProfile: UserProfile;
  onOpenLoginModal: () => void;
  onOpenSupabaseModal?: () => void;
  onSwitchProfile: () => void;
  onResetNewWeek: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  onOpenLoginModal,
  onOpenSupabaseModal,
  onSwitchProfile,
  onResetNewWeek,
  onLogout,
}) => {
  const tabs = [
    {
      id: 'MY_WEEK' as TabView,
      labelAr: 'My Week',
      labelEn: 'My Week',
      icon: CalendarDays,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'PARTNER_WEEK' as TabView,
      labelAr: "Partner's Week",
      labelEn: "Partner's Week",
      icon: Users,
      badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    },
    {
      id: 'HISTORY' as TabView,
      labelAr: 'History & Archives',
      labelEn: 'History & Archives',
      icon: Archive,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
      id: 'HALL_OF_FAME' as TabView,
      labelAr: 'Hall of Fame',
      labelEn: 'Hall of Fame',
      icon: Trophy,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
  ];

  return (
    <>
      {/* Top Main Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-2 sm:px-6 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-violet-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>

            <div>
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white font-['Outfit']">
                Duo<span className="text-emerald-400">Tracker</span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Weekly study goals & head-to-head partner tracker
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-800 to-slate-800/90 rounded-xl border border-slate-700/60 shadow-inner"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{tab.labelEn}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* User Controls & Profile Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Reset Week Button */}
            <button
              onClick={onResetNewWeek}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors hidden md:flex items-center gap-1.5 text-xs font-semibold"
              title="Archive current week and start a new week"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>New Week</span>
            </button>

            {/* User Profile Badge (Locked - Read Only) */}
            <div
              className="px-2 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-200 select-none max-w-[140px] sm:max-w-none"
              title={`Logged in as ${userProfile.name}`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-[9px] sm:text-[10px] shrink-0">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="text-white text-[11px] sm:text-xs font-bold leading-none truncate">{userProfile.name}</div>
                <div className="text-[9px] sm:text-[10px] text-emerald-400 font-normal leading-none mt-0.5 truncate">
                  {userProfile.track === 'SCI_MATH' ? 'Sci Math' : 'Sci Bio'}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors shrink-0"
              title="Log out from account"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-800/90 px-2 py-2">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-emerald-400 scale-110' : 'text-slate-400'}`} />
                <span className="text-[11px] font-semibold text-center leading-tight truncate w-full">
                  {tab.labelAr}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
