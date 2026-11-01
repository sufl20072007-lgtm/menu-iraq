/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// تنظيف الرابط وإزالة /rest/v1 إذا كان موجوداً
const cleanUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

// قراءة بيانات الاتصال من متغيرات البيئة أو التخزين المحلي
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem('MENU_IRAQ_SUPABASE_URL') || '';
  const localKey = localStorage.getItem('MENU_IRAQ_SUPABASE_ANON_KEY') || '';

  const rawUrl = localUrl || envUrl || 'https://muhyhswbxwmrmntywwxq.supabase.co';
  const url = cleanUrl(rawUrl);
  const anonKey = (localKey || envKey || 'sb_publishable_hj9rSh0DNkxDAIA1N-horA_7i9hfgWW').trim();

  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('MENU_IRAQ_SUPABASE_URL', cleanUrl(url));
  localStorage.setItem('MENU_IRAQ_SUPABASE_ANON_KEY', anonKey.trim());
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('MENU_IRAQ_SUPABASE_URL');
  localStorage.removeItem('MENU_IRAQ_SUPABASE_ANON_KEY');
};

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
};
