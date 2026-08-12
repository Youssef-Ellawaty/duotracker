import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Check, X, ShieldCheck, Sparkles, Activity, AlertCircle } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../utils/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isSaved, setIsSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string; testing?: boolean }>({});

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isConnected = Boolean(url.trim() && anonKey.trim());
    saveSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected,
    });
    setIsSaved(true);

    // Auto test connection
    setTestResult({ testing: true });
    const res = await testSupabaseConnection();
    setTestResult(res);

    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleRunTest = async () => {
    saveSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected: Boolean(url.trim() && anonKey.trim()),
    });
    setTestResult({ testing: true });
    const res = await testSupabaseConnection();
    setTestResult(res);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg glass-panel rounded-3xl border border-slate-700/80 p-5 sm:p-7 shadow-2xl overflow-hidden my-6"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">إعدادات ربط Supabase</h2>
              <p className="text-xs text-slate-400">
                ربط المزامنة الفورية بين اللابتوب والموبايل وبين الطرفين
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>كود SQL المطلوب إدخاله في Supabase</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              انسخ الكود التالي وضعه في <strong>Supabase SQL Editor</strong> واضغط <strong>RUN</strong> لإنشاء الجداول وإلغاء حظر الكتابة (RLS):
            </p>
            <code className="block p-2.5 rounded-lg bg-slate-950 font-mono text-[10px] text-emerald-300 border border-slate-800 whitespace-pre overflow-x-auto selection:bg-emerald-500/30">
              {`-- 1. جدول خطط الأسابيع والإنجاز والدرجات والبونص
CREATE TABLE IF NOT EXISTS duotracker_weeks (
  id TEXT PRIMARY KEY,
  week_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول سجل الأسابيع السابقة وحائط البطولات
CREATE TABLE IF NOT EXISTS duotracker_history (
  id TEXT PRIMARY KEY,
  records JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول الحسابات والشُعب الدراسية (علمي رياضة / علمي علوم)
CREATE TABLE IF NOT EXISTS duotracker_profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  pin TEXT,
  track TEXT, -- 'SCI_MATH' (علمي رياضة) أو 'SCI_BIO' (علمي علوم)
  partner_name TEXT,
  partner_pin TEXT,
  partner_track TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. إلغاء حظر RLS لمنع رفض الاتصال
ALTER TABLE duotracker_weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE duotracker_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE duotracker_profiles DISABLE ROW LEVEL SECURITY;`}
            </code>
          </div>

          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Project URL (رابط المشروع)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Anon Key (المفتاح العام)
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            {testResult.message && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed font-semibold">{testResult.message}</div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleRunTest}
                disabled={testResult.testing}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Activity className="w-4 h-4 text-amber-400" />
                <span>اختبار الاتصال الآن</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم حفظ الإعدادات!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>حفظ واختبار الاتصال</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

