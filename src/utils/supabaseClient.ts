/**
 * Supabase Client Integration Helper for DuoTracker.
 * Allows effortless optional connection to Supabase database for Vercel/Cloud deployment
 * while preserving full client-side LocalStorage functionality offline or without keys.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PastWeekRecord, WeeklyData } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

const SUPABASE_CONFIG_KEY = 'duotracker_supabase_config_v1';

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load Supabase config', e);
  }
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return {
    url: envUrl,
    anonKey: envKey,
    isConnected: Boolean(envUrl && envKey),
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    cachedClient = null; // Reset cached client on config change
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;
  if (!cachedClient) {
    try {
      cachedClient = createClient(config.url, config.anonKey);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return cachedClient;
}

// Automatic background sync helper methods with user-specific keys to avoid overwriting
export async function syncWeekToSupabase(weekKey: string, weekData: WeeklyData): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('duotracker_weeks').upsert({
      id: weekKey,
      week_data: weekData,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Supabase auto-sync week failed:', err);
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
      .single();

    if (error || !data) return null;
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
    await client.from('duotracker_history').upsert({
      id: 'past_weeks_global',
      records: pastWeeks,
      updated_at: new Date().toISOString(),
    });
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
      .single();

    if (error || !data) return null;
    return data.records as PastWeekRecord[];
  } catch (err) {
    console.warn('Supabase fetch history failed:', err);
    return null;
  }
}

export async function syncScheduleToSupabase(schedule: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('duotracker_weeks').upsert({
      id: 'schedule_config_global',
      week_data: schedule,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Supabase auto-sync schedule failed:', err);
  }
}

export async function fetchScheduleFromSupabase(): Promise<any | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('duotracker_weeks')
      .select('week_data')
      .eq('id', 'schedule_config_global')
      .single();

    if (error || !data) return null;
    return data.week_data;
  } catch (err) {
    console.warn('Supabase fetch schedule failed:', err);
    return null;
  }
}

