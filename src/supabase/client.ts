/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// يمكن تهيئة الرابط والمفتاح من متغيرات البيئة أو من حفظ محلي في المتصفح
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('MENU_IRAQ_SUPABASE_URL') || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('MENU_IRAQ_SUPABASE_ANON_KEY') || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
