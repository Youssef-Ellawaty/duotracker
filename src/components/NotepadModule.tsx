import React, { useState, useEffect } from 'react';
import { BookOpen, Check, Save, Sparkles } from 'lucide-react';

interface NotepadModuleProps {
  initialNotes: string;
  onSaveNotes: (notes: string) => void;
  isReadOnly?: boolean;
}

export const NotepadModule: React.FC<NotepadModuleProps> = ({
  initialNotes,
  onSaveNotes,
  isReadOnly = false,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    onSaveNotes(val);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Weekly Notepad & Task List</h3>
            <p className="text-xs text-slate-400">Write your study notes, reminders, and weekly tasks</p>
          </div>
        </div>

        {/* Autosave Badge */}
        {!isReadOnly && (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {isSaved ? (
              <span className="text-emerald-400 flex items-center gap-1 animate-fadeIn">
                <Check className="w-3.5 h-3.5" /> Auto-saved
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1">
                <Save className="w-3.5 h-3.5" /> Instant Sync
              </span>
            )}
          </div>
        )}
      </div>

      {/* Text Area */}
      {isReadOnly ? (
        <div className="w-full min-h-[120px] p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
          {notes ? notes : 'No notes written for this week yet.'}
        </div>
      ) : (
        <textarea
          rows={4}
          value={notes}
          onChange={handleChange}
          placeholder="• Example: Finish Chapter 1 Physics exercises on Tuesday&#10;• Solve 30 Chemistry past paper questions..."
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500/80 transition-colors leading-relaxed placeholder:text-slate-600 resize-y"
        />
      )}
    </div>
  );
};
