import { SubjectDef, TrackType } from '../types';

export const ALL_SUBJECTS: SubjectDef[] = [
  {
    id: 'physics',
    nameAr: 'الفيزياء',
    nameEn: 'Physics',
    tracks: ['SCI_MATH', 'SCI_BIO'],
    iconName: 'Zap',
    color: 'from-amber-500 to-yellow-600',
  },
  {
    id: 'chemistry',
    nameAr: 'الكيمياء',
    nameEn: 'Chemistry',
    tracks: ['SCI_MATH', 'SCI_BIO'],
    iconName: 'FlaskConical',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'math',
    nameAr: 'الرياضيات (البحتة)',
    nameEn: 'Pure Math',
    tracks: ['SCI_MATH'],
    iconName: 'Calculator',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'mechanics',
    nameAr: 'الميكانيكا (التطبيقية)',
    nameEn: 'Mechanics',
    tracks: ['SCI_MATH'],
    iconName: 'Cog',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'biology',
    nameAr: 'الأحياء',
    nameEn: 'Biology',
    tracks: ['SCI_BIO'],
    iconName: 'Dna',
    color: 'from-green-500 to-emerald-700',
  },
  {
    id: 'geology',
    nameAr: 'الجيولوجيا وعلوم البيئة',
    nameEn: 'Geology',
    tracks: ['SCI_BIO'],
    iconName: 'Mountain',
    color: 'from-stone-500 to-amber-700',
  },
  {
    id: 'arabic',
    nameAr: 'اللغة العربية',
    nameEn: 'Arabic',
    tracks: ['SCI_MATH', 'SCI_BIO'],
    iconName: 'BookOpen',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'english',
    nameAr: 'اللغة الإنجليزية',
    nameEn: 'English',
    tracks: ['SCI_MATH', 'SCI_BIO'],
    iconName: 'Languages',
    color: 'from-blue-500 to-sky-600',
  },
  {
    id: 'french',
    nameAr: 'اللغة الفرنسية',
    nameEn: 'French',
    tracks: ['SCI_MATH', 'SCI_BIO'],
    iconName: 'Globe',
    color: 'from-violet-500 to-purple-600',
  },
];

export function getSubjectsForTrack(track: TrackType): SubjectDef[] {
  return ALL_SUBJECTS.filter((sub) => sub.tracks.includes(track));
}
