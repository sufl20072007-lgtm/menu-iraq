/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// قراءة بيانات الاتصال من التخزين المحلي أو متغيرات البيئة
export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('MENU_IRAQ_SUPABASE_URL') || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('MENU_IRAQ_SUPABASE_ANON_KEY') || '';
  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('MENU_IRAQ_SUPABASE_URL', url.trim());
  localStorage.setItem('MENU_IRAQ_SUPABASE_ANON_KEY', anonKey.trim());
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('MENU_IRAQ_SUPABASE_URL');
  localStorage.removeItem('MENU_IRAQ_SUPABASE_ANON_KEY');
};

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  try {
    return createClient(url, anonKey);
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
};
