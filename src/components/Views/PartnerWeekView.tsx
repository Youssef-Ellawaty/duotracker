import React from 'react';
import { Users, Zap, CheckCircle2, Flame, Award, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile, WeeklyData } from '../../types';
import { SubjectCard } from '../SubjectCard';
import { NotepadModule } from '../NotepadModule';
import { calculateWeeklyScore } from '../../utils/scoreCalculator';
import { getTrackForName } from '../../utils/storage';

interface PartnerWeekViewProps {
  partnerData: WeeklyData;
  userProfile: UserProfile;
  userWeeklyData: WeeklyData;
}

export const PartnerWeekView: React.FC<PartnerWeekViewProps> = ({
  partnerData,
  userProfile,
  userWeeklyData,
}) => {
  const partnerMetrics = calculateWeeklyScore(partnerData.subjectGoals);
  const userMetrics = calculateWeeklyScore(userWeeklyData.subjectGoals);
  const partnerTrack = getTrackForName(userProfile.partnerName, userProfile.partnerTrack);

  const scoreDiff = userMetrics.finalScore - partnerMetrics.finalScore;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/40 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live View
            </span>
            <span className="text-xs text-slate-400">{partnerData.weekTitle}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 font-['Outfit']">
            Partner's Dashboard: <span className="text-violet-400">{userProfile.partnerName}</span>
          </h2>
        </div>

        <div className="px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          <span>Track: {partnerTrack === 'SCI_MATH' ? 'علمي رياضة (Math)' : 'علمي علوم (Biology)'}</span>
        </div>
      </div>

      {/* Head-to-Head Comparison Card */}
      <div className="glass-panel p-5 rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/30 via-slate-900/90 to-emerald-950/30 glow-violet">
        <h3 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>مقارنة الأداء المباشر للأسبوع الحالي</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Your Box */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-right">
            <div className="text-xs text-emerald-400 font-bold mb-1">أنت ({userProfile.name})</div>
            <div className="text-2xl font-black text-white font-mono">
              {userMetrics.finalScore} <span className="text-xs font-normal text-slate-400">نقطة</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-semibold">
              نسبة الإنجاز {userMetrics.completionRate}% + بونص {userMetrics.bonusPoints}
            </p>
          </div>

          {/* Partner Box */}
          <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-right">
            <div className="text-xs text-violet-400 font-bold mb-1">الشريك ({userProfile.partnerName})</div>
            <div className="text-2xl font-black text-white font-mono">
              {partnerMetrics.finalScore} <span className="text-xs font-normal text-slate-400">نقطة</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-semibold">
              نسبة الإنجاز {partnerMetrics.completionRate}% + بونص {partnerMetrics.bonusPoints}
            </p>
          </div>
        </div>

        {/* Live Standing Text */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs font-extrabold">
          {scoreDiff > 0 ? (
            <span className="text-emerald-400">
              🔥 أداء ممتاز! أنت متقدم بفارق {scoreDiff} نقطة!
            </span>
          ) : scoreDiff < 0 ? (
            <span className="text-violet-300">
              ⚡ {userProfile.partnerName} متقدم بـ {Math.abs(scoreDiff)} نقطة. سجل جلسات إضافية لتتفوق!
            </span>
          ) : (
            <span className="text-amber-300">
              🤝 تعادل تام برصيد {userMetrics.finalScore} نقطة لكل منهما!
            </span>
          )}
        </div>
      </div>

      {/* Partner Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2">مستهدف الشريك</div>
          <div className="text-2xl font-black text-white font-mono">{partnerMetrics.totalTarget}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2">الجلسات المكتملة</div>
          <div className="text-2xl font-black text-violet-400 font-mono">{partnerMetrics.totalCompleted}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2">نسبة الإكمال</div>
          <div className="text-2xl font-black text-white font-mono">{partnerMetrics.completionRate}%</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2">نقاط البونص</div>
          <div className="text-2xl font-black text-amber-400 font-mono">+{partnerMetrics.bonusPoints}</div>
        </div>
      </div>

      {/* Partner Subject Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-400" />
          <span>تفاصيل مواد الشريك</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partnerData.subjectGoals.map((item) => (
            <SubjectCard
              key={item.subjectId}
              item={item}
              isPartnerView={true}
            />
          ))}
        </div>
      </div>

      {/* Partner Notes Readonly */}
      <NotepadModule
        initialNotes={partnerData.notes}
        onSaveNotes={() => {}}
        isReadOnly={true}
      />
    </div>
  );
};
