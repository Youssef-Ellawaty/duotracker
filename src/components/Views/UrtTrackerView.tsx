import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Users,
  Clock,
  HelpCircle,
  Award,
  Sparkles,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TrackType, UrtRow, UserProfile, UserUrtTrackerData } from '../../types';
import { getUrtTablesForTrack, UrtTableConfig } from '../../utils/storage';
import { SubjectIcon } from '../SubjectIcon';
import confetti from 'canvas-confetti';

interface UrtTrackerViewProps {
  myUrt: UserUrtTrackerData;
  partnerUrt: UserUrtTrackerData;
  userProfile: UserProfile;
  onUpdateMyUrt: (updated: UserUrtTrackerData) => void;
}

export const UrtTrackerView: React.FC<UrtTrackerViewProps> = ({
  myUrt,
  partnerUrt,
  userProfile,
  onUpdateMyUrt,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'MY_URT' | 'PARTNER_URT'>('MY_URT');
  const [activeSubjectKey, setActiveSubjectKey] = useState<string>('ALL'); // 'ALL' or specific subjectKey
  
  // Track currently active data and view mode
  const isReadOnly = activeSubTab === 'PARTNER_URT';
  const currentData = activeSubTab === 'MY_URT' ? myUrt : partnerUrt;
  const currentTrack: TrackType = currentData?.track || (activeSubTab === 'MY_URT' ? userProfile.track : userProfile.partnerTrack);
  const tableConfigs = getUrtTablesForTrack(currentTrack);

  // New row draft state per subject
  const [newRowDrafts, setNewRowDrafts] = useState<Record<string, { title: string; questionsCount: string; score: string; duration: string }>>({});
  const [showAddForm, setShowAddForm] = useState<Record<string, boolean>>({});

  // Editing row state
  const [editingRow, setEditingRow] = useState<{
    subjectKey: string;
    rowId: string;
    title: string;
    questionsCount: string;
    score: string;
    duration: string;
  } | null>(null);

  // Get rows for a subject
  const getSubjectRows = (subjectKey: string): UrtRow[] => {
    return currentData?.tables?.[subjectKey] || [];
  };

  // Calculations
  const allTables = currentData?.tables || {};
  let totalTestsCount = 0;
  let totalQuestionsCount = 0;

  tableConfigs.forEach((cfg) => {
    const rows = allTables[cfg.key] || [];
    totalTestsCount += rows.length;
    rows.forEach((r) => {
      const qNum = parseInt(r.questionsCount.replace(/\D/g, ''), 10);
      if (!isNaN(qNum)) totalQuestionsCount += qNum;
    });
  });

  // Handle adding a new row
  const handleAddRow = (subjectKey: string) => {
    if (isReadOnly) return;
    const draft = newRowDrafts[subjectKey] || { title: '', questionsCount: '', score: '', duration: '' };

    if (!draft.title.trim()) {
      return; // Require at least a title
    }

    const newRow: UrtRow = {
      id: `urt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: draft.title.trim(),
      questionsCount: draft.questionsCount.trim() || '—',
      score: draft.score.trim() || '—',
      duration: draft.duration.trim() || '—',
      createdAt: new Date().toISOString(),
    };

    const currentRows = myUrt.tables?.[subjectKey] || [];
    const updatedTables = {
      ...(myUrt.tables || {}),
      [subjectKey]: [...currentRows, newRow],
    };

    onUpdateMyUrt({
      ...myUrt,
      tables: updatedTables,
      lastUpdated: new Date().toISOString(),
    });

    // Reset draft and close form
    setNewRowDrafts((prev) => ({
      ...prev,
      [subjectKey]: { title: '', questionsCount: '', score: '', duration: '' },
    }));
    setShowAddForm((prev) => ({
      ...prev,
      [subjectKey]: false,
    }));

    confetti({
      particleCount: 35,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#a855f7', '#ec4899', '#3b82f6', '#10b981'],
    });
  };

  // Handle saving an edited row
  const handleSaveEdit = () => {
    if (isReadOnly || !editingRow) return;
    const { subjectKey, rowId, title, questionsCount, score, duration } = editingRow;

    if (!title.trim()) return;

    const currentRows = myUrt.tables?.[subjectKey] || [];
    const updatedRows = currentRows.map((r) => {
      if (r.id === rowId) {
        return {
          ...r,
          title: title.trim(),
          questionsCount: questionsCount.trim() || '—',
          score: score.trim() || '—',
          duration: duration.trim() || '—',
        };
      }
      return r;
    });

    onUpdateMyUrt({
      ...myUrt,
      tables: {
        ...(myUrt.tables || {}),
        [subjectKey]: updatedRows,
      },
      lastUpdated: new Date().toISOString(),
    });

    setEditingRow(null);
  };

  // Handle deleting a row
  const handleDeleteRow = (subjectKey: string, rowId: string) => {
    if (isReadOnly) return;
    const currentRows = myUrt.tables?.[subjectKey] || [];
    const updatedRows = currentRows.filter((r) => r.id !== rowId);

    onUpdateMyUrt({
      ...myUrt,
      tables: {
        ...(myUrt.tables || {}),
        [subjectKey]: updatedRows,
      },
      lastUpdated: new Date().toISOString(),
    });

    if (editingRow?.rowId === rowId) {
      setEditingRow(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4 py-3">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-fuchsia-950/40 border border-fuchsia-500/30 p-4 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 shrink-0">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  URT Tracker
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                  {currentTrack === 'SCI_MATH' ? 'علمي رياضة' : 'علمي علوم'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                سجل اختبارات وجلسات URT لـ 4 مواد أساسية (فيزياء، كيمياء، {currentTrack === 'SCI_MATH' ? 'ماث، ميكا' : 'بايو، جيو'}) مع تتبع دقيق للدرجات والأوقات
              </p>
            </div>
          </div>

          {/* Sub-tab Switcher: My URT vs Partner's URT */}
          <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800 self-start md:self-auto shadow-inner">
            <button
              onClick={() => setActiveSubTab('MY_URT')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeSubTab === 'MY_URT'
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>سجلاتي ({userProfile.name.split(' ')[0]})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('PARTNER_URT')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeSubTab === 'PARTNER_URT'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>سجلات الشريك ({userProfile.partnerName.split(' ')[0]})</span>
            </button>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">إجمالي الاختبارات المسجلة</span>
            <div className="text-xl sm:text-2xl font-black text-fuchsia-400 flex items-center gap-1.5 mt-0.5">
              <Award className="w-5 h-5 text-fuchsia-400" />
              <span>{totalTestsCount}</span>
              <span className="text-xs text-slate-400 font-normal">اختبار</span>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">مجموع الأسئلة المحلولة</span>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 flex items-center gap-1.5 mt-0.5">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <span>{totalQuestionsCount}</span>
              <span className="text-xs text-slate-400 font-normal">سؤال</span>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">الجداول الفعالة</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>4</span>
              <span className="text-xs text-slate-400 font-normal">مواد تخصصية</span>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">حالة المزامنة السحابية</span>
            <div className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Firestore متصل بلحظة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs for Subjects */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveSubjectKey('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeSubjectKey === 'ALL'
              ? 'bg-fuchsia-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          عرض جميع الجداول (4)
        </button>
        {tableConfigs.map((cfg) => {
          const count = (getSubjectRows(cfg.key) || []).length;
          return (
            <button
              key={cfg.key}
              onClick={() => setActiveSubjectKey(cfg.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeSubjectKey === cfg.key
                  ? 'bg-slate-800 text-white border border-fuchsia-500/50 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              <span>{cfg.nameAr}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* The 4 Tables Display */}
      <div className="space-y-6">
        {tableConfigs
          .filter((cfg) => activeSubjectKey === 'ALL' || activeSubjectKey === cfg.key)
          .map((cfg) => {
            const rows = getSubjectRows(cfg.key);
            const isFormOpen = showAddForm[cfg.key] || false;
            const draft = newRowDrafts[cfg.key] || { title: '', questionsCount: '', score: '', duration: '' };

            return (
              <div
                key={cfg.key}
                className="rounded-2xl bg-slate-950/90 border border-slate-800/90 overflow-hidden shadow-xl"
              >
                {/* Table Header Bar */}
                <div className="p-3.5 sm:p-4 bg-slate-900/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${cfg.color} p-0.5 shadow-md flex items-center justify-center`}>
                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                        <SubjectIcon name={cfg.iconName} className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-black text-white">
                          جدول {cfg.nameAr}
                        </h2>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${cfg.accentBg} border ${cfg.borderColor}`}>
                          {cfg.nameEn}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {rows.length} {rows.length === 1 ? 'اختبار مسجل' : 'اختبارات مسجلة'}
                      </span>
                    </div>
                  </div>

                  {/* Add Row Button (Only for My URT) */}
                  {!isReadOnly && (
                    <button
                      onClick={() =>
                        setShowAddForm((prev) => ({
                          ...prev,
                          [cfg.key]: !isFormOpen,
                        }))
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-fuchsia-600/90 hover:bg-fuchsia-600 text-white active:scale-95 transition-all shadow-md shadow-fuchsia-600/20"
                    >
                      {isFormOpen ? (
                        <>
                          <X className="w-4 h-4" />
                          <span>إلغاء</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>إضافة اختبار / صف جديد</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Inline Quick Add Row Form */}
                <AnimatePresence>
                  {isFormOpen && !isReadOnly && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-slate-900/95 border-b border-fuchsia-500/30 p-3 sm:p-4"
                    >
                      <div className="text-xs font-bold text-fuchsia-400 mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>إدخال بيانات الصف الجديد لـ {cfg.nameAr} (يتم الترقيم تلقائياً)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        {/* Title */}
                        <div className="sm:col-span-1">
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            العنوان / اسم الاختبار *
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: Quiz الفصل الأول"
                            value={draft.title}
                            onChange={(e) =>
                              setNewRowDrafts((prev) => ({
                                ...prev,
                                [cfg.key]: { ...draft, title: e.target.value },
                              }))
                            }
                            className="w-full bg-slate-950 border border-slate-700 focus:border-fuchsia-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                            autoFocus
                          />
                        </div>

                        {/* Questions count */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            عدد الأسئلة
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: 50 سؤال"
                            value={draft.questionsCount}
                            onChange={(e) =>
                              setNewRowDrafts((prev) => ({
                                ...prev,
                                [cfg.key]: { ...draft, questionsCount: e.target.value },
                              }))
                            }
                            className="w-full bg-slate-950 border border-slate-700 focus:border-fuchsia-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                          />
                        </div>

                        {/* Score */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            الدرجة
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: 48/50 أو 96%"
                            value={draft.score}
                            onChange={(e) =>
                              setNewRowDrafts((prev) => ({
                                ...prev,
                                [cfg.key]: { ...draft, score: e.target.value },
                              }))
                            }
                            className="w-full bg-slate-950 border border-slate-700 focus:border-fuchsia-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                          />
                        </div>

                        {/* Duration */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            الوقت
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: 45 دقيقة"
                            value={draft.duration}
                            onChange={(e) =>
                              setNewRowDrafts((prev) => ({
                                ...prev,
                                [cfg.key]: { ...draft, duration: e.target.value },
                              }))
                            }
                            className="w-full bg-slate-950 border border-slate-700 focus:border-fuchsia-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-3">
                        <button
                          onClick={() =>
                            setShowAddForm((prev) => ({
                              ...prev,
                              [cfg.key]: false,
                            }))
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={() => handleAddRow(cfg.key)}
                          disabled={!draft.title.trim()}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white shadow-md transition-all active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>إضافة الصف للحفظ</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-800/80 bg-slate-900/40 text-slate-400 font-bold">
                        <th className="py-3 px-3 text-center w-12 text-slate-500">#</th>
                        <th className="py-3 px-3 min-w-[140px]">العنوان</th>
                        <th className="py-3 px-3 min-w-[100px]">عدد الأسئلة</th>
                        <th className="py-3 px-3 min-w-[100px]">الدرجة</th>
                        <th className="py-3 px-3 min-w-[100px]">الوقت</th>
                        {!isReadOnly && (
                          <th className="py-3 px-3 text-center w-24">إجراءات</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={isReadOnly ? 5 : 6}
                            className="py-10 text-center text-slate-500"
                          >
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Target className="w-8 h-8 text-slate-600" />
                              <p className="text-xs sm:text-sm text-slate-400">
                                لا توجد صفوف أو اختبارات مسجلة في جدول {cfg.nameAr} بعد.
                              </p>
                              {!isReadOnly && (
                                <button
                                  onClick={() =>
                                    setShowAddForm((prev) => ({
                                      ...prev,
                                      [cfg.key]: true,
                                    }))
                                  }
                                  className="mt-1 px-3 py-1.5 rounded-lg text-xs font-bold text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/30 hover:bg-fuchsia-500/20 transition-all"
                                >
                                  + إضافة أول اختبار
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        rows.map((row, index) => {
                          const isRowEditing =
                            editingRow?.subjectKey === cfg.key && editingRow?.rowId === row.id;

                          if (isRowEditing) {
                            return (
                              <tr
                                key={row.id}
                                className="bg-fuchsia-950/20 border-y border-fuchsia-500/30"
                              >
                                <td className="py-2.5 px-3 text-center font-black text-fuchsia-400">
                                  {index + 1}
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    type="text"
                                    value={editingRow.title}
                                    onChange={(e) =>
                                      setEditingRow({ ...editingRow, title: e.target.value })
                                    }
                                    className="w-full bg-slate-900 border border-fuchsia-500/60 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                  />
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    type="text"
                                    value={editingRow.questionsCount}
                                    onChange={(e) =>
                                      setEditingRow({ ...editingRow, questionsCount: e.target.value })
                                    }
                                    className="w-full bg-slate-900 border border-fuchsia-500/60 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                  />
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    type="text"
                                    value={editingRow.score}
                                    onChange={(e) =>
                                      setEditingRow({ ...editingRow, score: e.target.value })
                                    }
                                    className="w-full bg-slate-900 border border-fuchsia-500/60 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                  />
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    type="text"
                                    value={editingRow.duration}
                                    onChange={(e) =>
                                      setEditingRow({ ...editingRow, duration: e.target.value })
                                    }
                                    className="w-full bg-slate-900 border border-fuchsia-500/60 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                  />
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={handleSaveEdit}
                                      className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                                      title="حفظ"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setEditingRow(null)}
                                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
                                      title="إلغاء"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr
                              key={row.id}
                              className="hover:bg-slate-900/40 transition-colors group"
                            >
                              {/* Row Number */}
                              <td className="py-3 px-3 text-center font-bold text-slate-500 group-hover:text-fuchsia-400">
                                {index + 1}
                              </td>

                              {/* Title */}
                              <td className="py-3 px-3 font-semibold text-slate-100">
                                <span>{row.title}</span>
                              </td>

                              {/* Questions Count */}
                              <td className="py-3 px-3 font-mono text-cyan-300">
                                <span className="inline-flex items-center gap-1">
                                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400/70" />
                                  <span>{row.questionsCount}</span>
                                </span>
                              </td>

                              {/* Score */}
                              <td className="py-3 px-3 font-bold text-emerald-400">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{row.score}</span>
                                </span>
                              </td>

                              {/* Duration */}
                              <td className="py-3 px-3 font-mono text-amber-300">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-400/70" />
                                  <span>{row.duration}</span>
                                </span>
                              </td>

                              {/* Actions */}
                              {!isReadOnly && (
                                <td className="py-3 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() =>
                                        setEditingRow({
                                          subjectKey: cfg.key,
                                          rowId: row.id,
                                          title: row.title,
                                          questionsCount: row.questionsCount,
                                          score: row.score,
                                          duration: row.duration,
                                        })
                                      }
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                                      title="تعديل الصف"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRow(cfg.key, row.id)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                      title="حذف الصف"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with Summary */}
                {rows.length > 0 && (
                  <div className="p-3 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold">
                      إجمالي الاختبارات: <strong className="text-white">{rows.length}</strong>
                    </span>
                    {!isReadOnly && (
                      <button
                        onClick={() =>
                          setShowAddForm((prev) => ({
                            ...prev,
                            [cfg.key]: true,
                          }))
                        }
                        className="text-fuchsia-400 hover:text-fuchsia-300 font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة صف آخر</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
