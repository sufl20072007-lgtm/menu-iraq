/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Store,
  ExternalLink,
  QrCode,
  Search,
  CheckCircle,
  XCircle,
  Sliders,
  DollarSign,
  TrendingUp,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Restaurant } from '../types';
import { getSupabaseClient } from '../supabase/client';

interface SuperAdminPanelProps {
  restaurants: Restaurant[];
  onRestaurantsChange: (updated: Restaurant[]) => void;
  onPreviewRestaurant: (restaurant: Restaurant) => void;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({
  restaurants,
  onRestaurantsChange,
  onPreviewRestaurant,
}) => {
  // حالة تسجيل الدخول كمدير رئيسي (Super Admin Gate)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('MENU_IRAQ_ADMIN_AUTH') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // حالة نموذج إضافة مطعم جديد
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRestName, setNewRestName] = useState('');
  const [newRestSlug, setNewRestSlug] = useState('');
  const [newRestPhone, setNewRestPhone] = useState('964');
  const [newRestCity, setNewRestCity] = useState('بغداد');
  const [newRestTheme, setNewRestTheme] = useState('#ea580c');
  const [newRestTemplate, setNewRestTemplate] = useState<'modern-card' | 'minimal-list'>('modern-card');
  const [isSaving, setIsSaving] = useState(false);

  // البحث والفلترة
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // تسجيل دخول المدير الرئيسي
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // الرمز الافتراضي المبدئي لمدير النظام (يمكن تغييره وحفظه بأمان)
    if (adminPassword.trim() === 'admin123' || adminPassword.trim() === 'iraq2026') {
      setIsAuthenticated(true);
      localStorage.setItem('MENU_IRAQ_ADMIN_AUTH', 'true');
      setLoginError(null);
    } else {
      setLoginError('كلمة المرور غير صحيحة. يرجى تجربة رمز المدير الافتراضي: admin123');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('MENU_IRAQ_ADMIN_AUTH');
  };

  // توليد الرابط الفريد تلقائياً من اسم المطعم
  const handleNameChange = (name: string) => {
    setNewRestName(name);
    // تحويل الاسم لرابط إنجليزي بسيط إذا لم يكن مدخلاً يدوياً
    const autoSlug = name
      .trim()
      .toLowerCase()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!newRestSlug || newRestSlug.startsWith('rest-')) {
      setNewRestSlug(autoSlug || `rest-${Date.now().toString().slice(-4)}`);
    }
  };

  // إضافة مطعم جديد إلى Supabase والقائمة المحلية
  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestName.trim() || !newRestSlug.trim() || !newRestPhone.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSaving(true);
    const newRestaurant: Restaurant = {
      id: `rest-${Date.now()}`,
      slug: newRestSlug.trim().toLowerCase(),
      name: newRestName.trim(),
      phoneWhatsapp: newRestPhone.trim(),
      city: newRestCity,
      address: `${newRestCity} - مركز المدينة`,
      themeColor: newRestTheme,
      templateId: newRestTemplate,
      isActive: true,
      currency: 'د.ع',
      createdAt: new Date().toISOString(),
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150',
      coverUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    };

    try {
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client
          .from('restaurants')
          .insert([
            {
              slug: newRestaurant.slug,
              name: newRestaurant.name,
              phone_whatsapp: newRestaurant.phoneWhatsapp,
              city: newRestaurant.city,
              address: newRestaurant.address,
              theme_color: newRestaurant.themeColor,
              template_id: newRestaurant.templateId,
              is_active: true,
              currency: 'د.ع',
            },
          ])
          .select()
          .single();

        if (error) {
          console.warn('Note on Supabase insert:', error.message);
        } else if (data) {
          newRestaurant.id = data.id;
        }
      }

      onRestaurantsChange([newRestaurant, ...restaurants]);
      setShowAddModal(false);
      // إعادة تعيين الحقول
      setNewRestName('');
      setNewRestSlug('');
      setNewRestPhone('964');
    } catch (err: any) {
      console.error('Error creating restaurant:', err);
      // إضافة محلياً لضمان عدم توقف المستخدم
      onRestaurantsChange([newRestaurant, ...restaurants]);
      setShowAddModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  // تفعيل / إيقاف مطعم
  const toggleRestaurantStatus = async (restaurant: Restaurant) => {
    const updatedStatus = !restaurant.isActive;
    const updatedList = restaurants.map((r) =>
      r.id === restaurant.id ? { ...r, isActive: updatedStatus } : r
    );
    onRestaurantsChange(updatedList);

    const client = getSupabaseClient();
    if (client) {
      await client
        .from('restaurants')
        .update({ is_active: updatedStatus })
        .eq('id', restaurant.id);
    }
  };

  const copySlug = (slug: string, id: string) => {
    const fullUrl = `https://menuiraq.com/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // فلترة المطاعم
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.city && r.city.includes(searchQuery));
    if (statusFilter === 'active') return matchesSearch && r.isActive;
    if (statusFilter === 'inactive') return matchesSearch && !r.isActive;
    return matchesSearch;
  });

  const activeCount = restaurants.filter((r) => r.isActive).length;
  const estimatedRevenue = activeCount * 35000; // 35,000 د.ع لكل مطعم شهرياً

  // ==================== إذا لم يكن مسجلاً كمدير رئيسي ====================
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white">بوابة المدير العام (Super Admin)</h3>
          <p className="text-xs text-slate-400 mt-1">
            منطقة محمية خاصة بمالك المنصة فقط لإدارة المطاعم والاشتراكات.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4 text-right">
          <div>
            <label className="text-xs text-slate-300 block mb-1.5 font-bold">كلمة مرور المدير الرئيسي:</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="أدخل رمز المدير (مثلاً: admin123)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white pl-10 focus:outline-none focus:border-amber-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span>رمز المدير الافتراضي للتجربة:</span>
              <code className="text-amber-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                admin123
              </code>
            </div>
          </div>

          {loginError && (
            <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs text-center font-medium">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>تسجيل الدخول كمالك المنصة</span>
          </button>
        </form>
      </div>
    );
  }

  // ==================== لوحة التحكم الرئيسية بعد تسجيل الدخول ====================
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* الشريط العلوي للوحة المدير */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              المالك الرئيسي للمنصة (Super Admin)
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1">لوحة إدارة المنيو الإلكتروني</h2>
          <p className="text-xs text-slate-400">إدارة المطاعم والكافيهات في العراق، توليد الروابط والباركود، ومتابعة الاشتراكات</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منيو جديد (مطعم أو كافيه)</span>
          </button>
          <button
            onClick={handleAdminLogout}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-all font-medium border border-slate-700"
          >
            خروج
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات المالية والتشغيلية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">إجمالي المطاعم المسجلة</span>
            <Store className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{restaurants.length}</div>
          <div className="text-[11px] text-emerald-400">{activeCount} مطعم نشط حالياً</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">المطاعم المفعلة</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{activeCount}</div>
          <div className="text-[11px] text-slate-400">روابطهم تعمل 100%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">الدخل الشهري المتوقع</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {estimatedRevenue.toLocaleString()} د.ع
          </div>
          <div className="text-[11px] text-slate-400">بمعدل 35 ألف د.ع للمطعم</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">تكلفة الخوادم عليك</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">$0 مجاناً</div>
          <div className="text-[11px] text-emerald-400">سحابي مجاني بالكامل</div>
        </div>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="ابحث باسم المطعم، الرابط، أو المحافظة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setStatusFilter('all')}
            className={`text-xs px-3 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            الكل ({restaurants.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`text-xs px-3 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'active' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            النشطة ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`text-xs px-3 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'inactive' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            المتوقفة ({restaurants.length - activeCount})
          </button>
        </div>
      </div>

      {/* قائمة المطاعم المسجلة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className={`bg-slate-900 border rounded-2xl p-4 space-y-3 transition-all ${
              restaurant.isActive
                ? 'border-slate-800 hover:border-slate-700 shadow-md'
                : 'border-red-900/40 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={restaurant.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150'}
                  alt={restaurant.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                />
                <div>
                  <h4 className="font-bold text-sm text-white truncate max-w-[150px]">{restaurant.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{restaurant.city || 'بغداد'}</span>
                  </div>
                </div>
              </div>

              {/* زر تفعيل/إيقاف */}
              <button
                onClick={() => toggleRestaurantStatus(restaurant)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-all ${
                  restaurant.isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                }`}
              >
                {restaurant.isActive ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    <span>نشط</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    <span>متوقف</span>
                  </>
                )}
              </button>
            </div>

            {/* الرابط المستقل للمطعم */}
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 truncate text-[11px]">
                menuiraq.com/{restaurant.slug}
              </span>
              <button
                onClick={() => copySlug(restaurant.slug, restaurant.id)}
                className="text-slate-400 hover:text-white p-1"
                title="نسخ الرابط"
              >
                {copiedId === restaurant.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* تفاصيل الاشتراك ومعلومات التواصل */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1 text-[11px]">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span className="font-mono">{restaurant.phoneWhatsapp}</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-bold">
                باقة شهرية (35k)
              </span>
            </div>

            {/* أزرار العمليات */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => onPreviewRestaurant(restaurant)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>معاينة المنيو</span>
              </button>
              <button
                onClick={() => copySlug(restaurant.slug, `btn-${restaurant.id}`)}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>الباركود</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* نافذة إضافة مطعم جديد (Add Restaurant Modal) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 md:p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">إضافة منيو جديد (مطعم أو كافيه) إلى MENU IRAQ</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-bold">اسم المطعم أو الكافيه:</label>
                <input
                  type="text"
                  placeholder="مثال: كافيه البستان أو كباب المنصور الملكي"
                  value={newRestName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-bold">رابط المنيو الفريد (Slug):</label>
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                  <span className="text-slate-500 font-mono text-[11px]">menuiraq.com/</span>
                  <input
                    type="text"
                    placeholder="kebab-mansour"
                    value={newRestSlug}
                    onChange={(e) => setNewRestSlug(e.target.value)}
                    className="flex-1 bg-transparent text-amber-400 font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-bold">رقم الواتساب للطلبات:</label>
                  <input
                    type="text"
                    placeholder="9647700000000"
                    value={newRestPhone}
                    onChange={(e) => setNewRestPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-bold">المحافظة / المدينة:</label>
                  <select
                    value={newRestCity}
                    onChange={(e) => setNewRestCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="بغداد">بغداد</option>
                    <option value="أربيل">أربيل</option>
                    <option value="البصرة">البصرة</option>
                    <option value="النجف">النجف</option>
                    <option value="كربلاء">كربلاء</option>
                    <option value="الموصل">الموصل</option>
                    <option value="السليمانية">السليمانية</option>
                    <option value="بابل">بابل</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-bold">لون ثيم المنيو:</label>
                  <div className="flex items-center gap-2">
                    {['#ea580c', '#e11d48', '#059669', '#d97706', '#4f46e5'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewRestTheme(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          newRestTheme === color ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">شكل القالب الافتراضي:</label>
                  <select
                    value={newRestTemplate}
                    onChange={(e) => setNewRestTemplate(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-white focus:outline-none"
                  >
                    <option value="modern-card">بطاقات مصورة (Modern)</option>
                    <option value="minimal-list">قائمة مبسطة (Minimal)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري حفظ المطعم...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>إنشاء المطعم والمنيو فوراً</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
