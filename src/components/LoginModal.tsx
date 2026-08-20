import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, Lock, KeyRound, Sparkles, AlertCircle, ShieldCheck, Zap, ArrowRight, Check } from 'lucide-react';
import { TrackType, UserProfile } from '../types';
import { PRESET_USERS } from '../utils/storage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<'EMY' | 'YOUSSEF'>(
    userProfile.name.toLowerCase().includes('youssef') ? 'YOUSSEF' : 'EMY'
  );
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<TrackType>(
    userProfile.track || (userProfile.name.toLowerCase().includes('youssef') ? 'SCI_MATH' : 'SCI_BIO')
  );

  if (!isOpen) return null;

  const handleSelectAccount = (acc: 'EMY' | 'YOUSSEF') => {
    setSelectedAccount(acc);
    setSelectedTrack(acc === 'EMY' ? 'SCI_BIO' : 'SCI_MATH');
    setErrorMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (pinInput.trim() !== '132026' && pinInput.trim() !== '123456') {
      setErrorMsg('كلمة المرور غير صحيحة');
      return;
    }

    const preset = PRESET_USERS[selectedAccount];
    const updatedProfile: UserProfile = {
      ...preset,
      track: selectedTrack,
      partnerTrack: selectedAccount === 'EMY' ? 'SCI_MATH' : 'SCI_BIO',
      isLoggedIn: true,
    };

    onSaveProfile(updatedProfile);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-violet-600/10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md glass-panel rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden my-auto"
        >
          {/* Header Brand */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-violet-600 p-0.5 mx-auto mb-3 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Zap className="w-7 h-7 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight font-['Outfit']">
              Duo<span className="text-emerald-400">Tracker</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              اختر حسابك وادخل كلمة المرور للدخول
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            {/* Account Selector Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-3 text-center">
                1. اختر حسابك (Select Your Account)
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Account 1: Emy Ahmed */}
                <button
                  type="button"
                  onClick={() => handleSelectAccount('EMY')}
                  className={`relative p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer ${
                    selectedAccount === 'EMY'
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/50'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-md transition-transform ${
                    selectedAccount === 'EMY'
                      ? 'bg-emerald-500 text-slate-950 scale-105'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    EA
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white">Emy Ahmed</div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">إيمي أحمد</div>
                  </div>
                  {selectedAccount === 'EMY' && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>

                {/* Account 2: Youssef Ellawaty */}
                <button
                  type="button"
                  onClick={() => handleSelectAccount('YOUSSEF')}
                  className={`relative p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer ${
                    selectedAccount === 'YOUSSEF'
                      ? 'bg-violet-500/15 border-violet-500 text-white shadow-xl shadow-violet-500/10 ring-2 ring-violet-500/50'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-md transition-transform ${
                    selectedAccount === 'YOUSSEF'
                      ? 'bg-violet-500 text-white scale-105'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    YE
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white">Youssef Ellawaty</div>
                    <div className="text-[11px] text-violet-400 font-semibold mt-0.5">يوسف اللواتي</div>
                  </div>
                  {selectedAccount === 'YOUSSEF' && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* PIN Code Entry */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300">
                  2. ادخل كلمة المرور (PIN)
                </label>
              </div>

              <div className="relative">
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="ادخل كلمة المرور"
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-center text-lg font-mono tracking-widest focus:outline-none focus:border-emerald-500 transition-colors shadow-inner placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-xs"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 justify-center"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </div>

            {/* Academic Track Choice */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                الشعبة الدراسية (Specialization)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTrack('SCI_MATH')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    selectedTrack === 'SCI_MATH'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  علمي رياضة
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTrack('SCI_BIO')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    selectedTrack === 'SCI_BIO'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  علمي علوم
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>تسجيل الدخول</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

