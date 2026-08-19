/**
 * Supabase Client Integration Helper for DuoTracker.
 * Allows effortless optional connection to Supabase database for Vercel/Cloud deployment
 * while preserving full client-side LocalStorage functionality offline or without keys.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PastWeekRecord, UserProfile, WeeklyData } from '../types';
import { WeekScheduleConfig } from './schedule';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

const SUPABASE_CONFIG_KEY = 'duotracker_supabase_config_v1';

export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/^["']|["']$/g, '');
  // Remove any trailing slashes
  url = url.replace(/\/+$/, '');
  // Remove any appended /rest/v1 or /v1 or /rest paths
  url = url.replace(/\/rest\/v1.*$/i, '');
  url = url.replace(/\/rest\/?$/i, '');
  url = url.replace(/\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
}

export function sanitizeSupabaseKey(rawKey: string): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        const cleanUrl = sanitizeSupabaseUrl(parsed.url);
        const cleanKey = sanitizeSupabaseKey(parsed.anonKey);
        return {
          url: cleanUrl,
          anonKey: cleanKey,
          isConnected: Boolean(cleanUrl && cleanKey),
        };
      }
    }
  } catch (e) {
    console.error('Failed to load Supabase config', e);
  }

  const cleanEnvUrl = sanitizeSupabaseUrl(envUrl);
  const cleanEnvKey = sanitizeSupabaseKey(envKey);

  return {
    url: cleanEnvUrl,
    anonKey: cleanEnvKey,
    isConnected: Boolean(cleanEnvUrl && cleanEnvKey),
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    const cleanUrl = sanitizeSupabaseUrl(config.url);
    const cleanKey = sanitizeSupabaseKey(config.anonKey);
    const sanitizedConfig = {
      url: cleanUrl,
      anonKey: cleanKey,
      isConnected: Boolean(cleanUrl && cleanKey),
    };
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(sanitizedConfig));
    cachedClient = null; // Reset cached client on config change
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  const url = sanitizeSupabaseUrl(config.url);
  const anonKey = sanitizeSupabaseKey(config.anonKey);

  if (!url || !anonKey) return null;

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, anonKey);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return cachedClient;
}

// Automatic background sync helper methods with user-specific keys to avoid overwriting
export async function syncWeekToSupabase(weekKey: string, weekData: WeeklyData): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not initialized' };

  try {
    const { error } = await client.from('duotracker_weeks').upsert({
      id: weekKey,
      week_data: weekData,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase auto-sync week error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase auto-sync week exception:', err);
    return { success: false, error: err?.message || 'Unknown sync error' };
  }
}

export async function fetchWeekFromSupabase(weekKey: string): Promise<WeeklyData | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('duotracker_weeks')
      .select('week_data')
      .eq('id', weekKey)
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn('Supabase fetch week error:', error);
      return null;
    }
    return data.week_data as WeeklyData;
  } catch (err) {
    console.warn('Supabase fetch week failed:', err);
    return null;
  }
}

export async function syncPastWeeksToSupabase(pastWeeks: PastWeekRecord[]): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const { error } = await client.from('duotracker_history').upsert({
      id: 'past_weeks_global',
      records: pastWeeks,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error('Supabase auto-sync history error:', error);
  } catch (err) {
    console.warn('Supabase auto-sync history failed:', err);
  }
}

export async function fetchPastWeeksFromSupabase(): Promise<PastWeekRecord[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('duotracker_history')
      .select('records')
      .eq('id', 'past_weeks_global')
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn('Supabase fetch history error:', error);
      return null;
    }
    return data.records as PastWeekRecord[];
  } catch (err) {
    console.warn('Supabase fetch history failed:', err);
    return null;
  }
}

export async function syncProfileToSupabase(profile: UserProfile): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const profileId = profile.id || `profile_${profile.name.replace(/\s+/g, '_')}`;
    const { error } = await client.from('duotracker_profiles').upsert({
      id: profileId,
      name: profile.name,
      pin: profile.pin,
      track: profile.track, // 'SCI_MATH' (علمي رياضة) or 'SCI_BIO' (علمي علوم)
      partner_name: profile.partnerName,
      partner_pin: profile.partnerPin,
      partner_track: profile.partnerTrack,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('duotracker_profiles')) {
        console.warn('Supabase profile table (duotracker_profiles) does not exist yet. Please run the SQL script in Supabase SQL Editor.');
      } else {
        console.error('Supabase profile sync error:', error);
      }
    }
  } catch (err) {
    console.warn('Supabase profile sync exception:', err);
  }
}

export async function fetchProfileFromSupabase(profileIdOrName: string): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    let { data, error } = await client
      .from('duotracker_profiles')
      .select('*')
      .eq('id', profileIdOrName)
      .maybeSingle();

    if (!data) {
      const byName = await client
        .from('duotracker_profiles')
        .select('*')
        .eq('name', profileIdOrName)
        .maybeSingle();
      data = byName.data;
    }

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      pin: data.pin,
      track: data.track,
      partnerName: data.partner_name,
      partnerPin: data.partner_pin,
      partnerTrack: data.partner_track,
      isLoggedIn: true,
    };
  } catch (err) {
    console.warn('Supabase fetch profile exception:', err);
    return null;
  }
}

export function subscribeToTable(
  table: 'duotracker_weeks' | 'duotracker_history' | 'duotracker_profiles',
  onChange: () => void
): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const channelName = `realtime-${table}-${Math.random().toString(36).slice(2, 8)}`;
  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

export async function syncScheduleToSupabase(schedule: WeekScheduleConfig): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const { error } = await client.from('duotracker_weeks').upsert({
      id: 'schedule_config_global',
      week_data: schedule,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error('Supabase auto-sync schedule error:', error);
  } catch (err) {
    console.warn('Supabase auto-sync schedule failed:', err);
  }
}

export async function fetchScheduleFromSupabase(): Promise<WeekScheduleConfig | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('duotracker_weeks')
      .select('week_data')
      .eq('id', 'schedule_config_global')
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn('Supabase fetch schedule error:', error);
      return null;
    }
    return data.week_data as WeekScheduleConfig;
  } catch (err) {
    console.warn('Supabase fetch schedule failed:', err);
    return null;
  }
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'رابط (URL) أو مفتاح (Anon Key) الخاص بـ Supabase غير مكتمل.' };
  }

  try {
    const { error } = await client.from('duotracker_weeks').upsert({
      id: 'connection_test',
      week_data: { test: true, timestamp: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    });

    if (error) {
      if (error.code === 'PGRST125' || error.message?.includes('Invalid path')) {
        return {
          success: false,
          message: '❌ رابط Supabase غير صحيح! تم تلقائياً تصحيح المسار وإزالة أجزاء الرابط الزائدة. جرب الضغط على "حفظ واختبار الاتصال" مجدداً.',
        };
      }
      if (error.code === 'PGRST205' || (error.message && (error.message.includes('relation') || error.message.includes('schema cache')))) {
        return {
          success: false,
          message: '❌ جدول القواعد في Supabase غير كلي أو غير موجود بعد! الرجاء تشغيل كود SQL المطلوب في Supabase SQL Editor لإنشاء كافة الجداول.',
        };
      }
      if (error.message.includes('permission') || error.message.includes('RLS') || error.code === '42501') {
        return {
          success: false,
          message: '❌ تم حظر الكتابة بسبب Row Level Security (RLS)! يجب إضافة ALTER TABLE ... DISABLE ROW LEVEL SECURITY.',
        };
      }
      return { success: false, message: `❌ خطأ في الاتصال: ${error.message}` };
    }

    return { success: true, message: '✅ تم الاتصال واختبار الحفظ في Supabase بنجاح!' };
  } catch (err: any) {
    return { success: false, message: `❌ تعذر الاتصال: ${err.message || 'خطأ غير معروف'}` };
  }
}
