/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChefHat,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  QrCode,
  Download,
  Share2,
  Palette,
  CheckCircle,
  XCircle,
  Save,
  Phone,
  MapPin,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Layers,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Check,
  Copy
} from 'lucide-react';
import { Restaurant, Category, Product } from '../types';
import { getSupabaseClient } from '../supabase/client';

interface RestaurantOwnerDashboardProps {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
  onUpdateRestaurant: (updated: Restaurant) => void;
  onUpdateCategories: (updated: Category[]) => void;
  onUpdateProducts: (updated: Product[]) => void;
  onPreviewMenu: () => void;
}

export const RestaurantOwnerDashboard: React.FC<RestaurantOwnerDashboardProps> = ({
  restaurant,
  categories,
  products,
  onUpdateRestaurant,
  onUpdateCategories,
  onUpdateProducts,
  onPreviewMenu,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'branding' | 'qrcode'>('products');
  
  // حالة تعديل معلومات المطعم
  const [formData, setFormData] = useState({
    name: restaurant.name,
    tagline: restaurant.tagline || '',
    description: restaurant.description || '',
    phoneWhatsapp: restaurant.phoneWhatsapp,
    address: restaurant.address,
    city: restaurant.city || 'بغداد',
    themeColor: restaurant.themeColor || '#ea580c',
    templateId: restaurant.templateId || 'modern-card',
    logoUrl: restaurant.logoUrl || '',
    coverUrl: restaurant.coverUrl || '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // حالة إضافة وجبة جديدة
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCatId, setNewProdCatId] = useState(categories[0]?.id || '');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdPopular, setNewProdPopular] = useState(false);

  // حالة إضافة قسم جديد
  const [newCatName, setNewCatName] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // فلترة الأقسام والمنتجات لهذا المطعم حصراً (Data Isolation)
  const myCategories = categories.filter((c) => c.restaurantId === restaurant.id || !c.restaurantId);
  const myProducts = products.filter((p) => p.restaurantId === restaurant.id || !p.restaurantId);

  // حفظ التعديلات في الهوية
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Restaurant = {
      ...restaurant,
      ...formData,
    };
    onUpdateRestaurant(updated);
    
    const client = getSupabaseClient();
    if (client) {
      await client
        .from('restaurants')
        .update({
          name: formData.name,
          tagline: formData.tagline,
          description: formData.description,
          phone_whatsapp: formData.phoneWhatsapp,
          address: formData.address,
          city: formData.city,
          theme_color: formData.themeColor,
          template_id: formData.templateId,
          logo_url: formData.logoUrl,
          cover_url: formData.coverUrl,
        })
        .eq('id', restaurant.id);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // إضافة وجبة جديدة
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice.trim()) {
      alert('يرجى كتابة اسم الوجبة والسعر');
      return;
    }

    const newProd: Product = {
      id: `p-${Date.now()}`,
      restaurantId: restaurant.id,
      categoryId: newProdCatId || myCategories[0]?.id || 'cat-1',
      name: newProdName.trim(),
      description: newProdDesc.trim(),
      price: parseInt(newProdPrice.replace(/[^0-9]/g, '')) || 0,
      imageUrl: newProdImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      isAvailable: true,
      isPopular: newProdPopular,
    };

    onUpdateProducts([...products, newProd]);
    setShowAddProductModal(false);

    // تفريغ الحقول
    setNewProdName('');
    setNewProdDesc('');
    setNewProdPrice('');
    setNewProdImage('');
    setNewProdPopular(false);

    const client = getSupabaseClient();
    if (client) {
      await client.from('products').insert([
        {
          restaurant_id: newProd.restaurantId,
          category_id: newProd.categoryId,
          name: newProd.name,
          description: newProd.description,
          price: newProd.price,
          image_url: newProd.imageUrl,
          is_available: true,
          is_popular: newProd.isPopular,
        },
      ]);
    }
  };

  // تبديل توفر الوجبة (متوفر / نفذ اليوم)
  const toggleProductAvailability = async (productId: string) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p
    );
    onUpdateProducts(updated);

    const target = updated.find((p) => p.id === productId);
    const client = getSupabaseClient();
    if (client && target) {
      await client
        .from('products')
        .update({ is_available: target.isAvailable })
        .eq('id', productId);
    }
  };

  // حذف وجبة
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوجبة؟')) return;
    const updated = products.filter((p) => p.id !== productId);
    onUpdateProducts(updated);

    const client = getSupabaseClient();
    if (client) {
      await client.from('products').delete().eq('id', productId);
    }
  };

  // إضافة قسم طعام جديد
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      restaurantId: restaurant.id,
      name: newCatName.trim(),
      sortOrder: myCategories.length + 1,
    };

    onUpdateCategories([...categories, newCat]);
    setNewCatName('');

    const client = getSupabaseClient();
    if (client) {
      await client.from('categories').insert([
        {
          restaurant_id: newCat.restaurantId,
          name: newCat.name,
          sort_order: newCat.sortOrder,
        },
      ]);
    }
  };

  const copyMenuUrl = () => {
    const url = `https://menuiraq.com/${restaurant.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* رأس لوحة تحكم المطعم */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={restaurant.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150'}
            alt={restaurant.name}
            className="w-12 h-12 rounded-xl object-cover border-2 border-slate-700 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black text-white">{restaurant.name}</h2>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                لوحة المطعم
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="font-mono text-amber-400">menuiraq.com/{restaurant.slug}</span>
              <span>•</span>
              <span>{myProducts.length} وجبة</span>
              <span>•</span>
              <span>{myCategories.length} أقسام</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyMenuUrl}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-slate-700"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>نسخ رابط المنيو</span>
          </button>
          <button
            onClick={onPreviewMenu}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
          >
            <Eye className="w-4 h-4" />
            <span>معاينة المنيو للزبائن</span>
          </button>
        </div>
      </div>

      {/* أزرار التبويبات الداخلية للوحة المطعم */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'products'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>الوجبات والأسعار ({myProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'categories'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>أقسام الطعام ({myCategories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'branding'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>الهوية والألوان والقالب</span>
        </button>

        <button
          onClick={() => setActiveTab('qrcode')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'qrcode'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>باركود الطاولات (QR)</span>
        </button>
      </div>

      {/* ==================== تبويب 1: إدارة الوجبات ==================== */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>قائمة وجبات {restaurant.name}</span>
            </h3>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة وجبة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myProducts.map((product) => {
              const cat = myCategories.find((c) => c.id === product.categoryId);
              return (
                <div
                  key={product.id}
                  className={`bg-slate-900 border rounded-2xl p-3.5 space-y-3 transition-all ${
                    product.isAvailable ? 'border-slate-800' : 'border-red-900/40 opacity-70'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-white truncate">{product.name}</h4>
                        {product.isPopular && (
                          <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded font-bold">
                            مميز
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{product.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-xs text-amber-400">
                          {product.price.toLocaleString()} {restaurant.currency}
                        </span>
                        {cat && (
                          <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                            {cat.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    {/* زر تبديل التوفر بنقرة واحدة */}
                    <button
                      onClick={() => toggleProductAvailability(product.id)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                        product.isAvailable
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {product.isAvailable ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>متوفر بالصالة</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>نفذ اليوم (مخفي)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="حذف الوجبة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== تبويب 2: إدارة الأقسام ==================== */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h4 className="font-bold text-xs text-white mb-2">إضافة قسم طعام جديد للمنيو:</h4>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="مثلاً: وجبات عائلية، مشاوي، مقبلات، حلويات..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة القسم</span>
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {myCategories.map((cat, idx) => {
              const count = myProducts.filter((p) => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white text-sm">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg">
                      {count} وجبات بداخل القسم
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== تبويب 3: الهوية والقالب والألوان ==================== */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>تخصيص هوية المنيو والقالب لمطعم {restaurant.name}</span>
            </h4>
            {saveSuccess && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>تم حفظ التعديلات بنجاح!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 block mb-1 font-bold">اسم المطعم الظاهر للزبائن:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">عبارة تحت الاسم (Tagline):</label>
              <input
                type="text"
                placeholder="أشهى كص عراقي ومشاوي عالفحم"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">رقم الواتساب لاستقبال الطلبات:</label>
              <input
                type="text"
                value={formData.phoneWhatsapp}
                onChange={(e) => setFormData({ ...formData, phoneWhatsapp: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">العنوان أو الفرع:</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">رابط لوغو المطعم (صورة الشعار):</label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-[11px] font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">رابط صورة الغلاف (Banner):</label>
              <input
                type="text"
                value={formData.coverUrl}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-[11px] font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* اختيار القالب */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-slate-300 block mb-2 font-bold">اختيار قالب تصميم المنيو:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, templateId: 'modern-card' })}
                className={`p-3 rounded-xl border text-right transition-all ${
                  formData.templateId === 'modern-card'
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="font-bold">1. بطاقات حديثة (Modern Cards)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">يعرض صور الوجبات كبيرة مع زر الإضافة السريع للسلة</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, templateId: 'minimal-list' })}
                className={`p-3 rounded-xl border text-right transition-all ${
                  formData.templateId === 'minimal-list'
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="font-bold">2. قائمة مبسطة وأنيقة (Minimal List)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">قائمة كلاسيكية تركز على الأسماء والأسعار وسرعة التصفح</div>
              </button>
            </div>
          </div>

          {/* ألوان الثيم */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-slate-300 block mb-1.5 font-bold">لون هوية المنيو:</label>
            <div className="flex items-center gap-3">
              {[
                { name: 'برتقالي مشهي', hex: '#ea580c' },
                { name: 'أحمر عصري', hex: '#e11d48' },
                { name: 'زمردي راقي', hex: '#059669' },
                { name: 'ذهبي بغدادي', hex: '#d97706' },
                { name: 'نيلي ملكي', hex: '#4f46e5' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setFormData({ ...formData, themeColor: c.hex })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    formData.themeColor === c.hex
                      ? 'border-white text-white'
                      : 'border-slate-800 text-slate-400 bg-slate-950'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.hex }}></span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات في المنيو</span>
            </button>
          </div>
        </form>
      )}

      {/* ==================== تبويب 4: باركود الطاولات ==================== */}
      {activeTab === 'qrcode' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-white">باركود QR لطاولات {restaurant.name}</h4>
            <p className="text-xs text-slate-400 mt-1">
              جاهز للطباعة واللصق على طاولات الصالة ليفتحه الزبائن فوراً بكاميرا الموبايل.
            </p>
          </div>

          {/* الباركود بصرياً */}
          <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl border-4 border-slate-700">
            <div className="w-48 h-48 bg-slate-950 flex flex-col items-center justify-center rounded-xl p-2 text-white">
              <QrCode className="w-36 h-36 text-white" />
              <div className="text-[10px] font-mono mt-1 text-amber-300">menuiraq.com/{restaurant.slug}</div>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => alert('تم تجهيز تصميم الباركود للطباعة على طاولات المطعم!')}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>تحميل الباركود للطباعة</span>
            </button>
            <button
              onClick={copyMenuUrl}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700"
            >
              نسخ الرابط
            </button>
          </div>
        </div>
      )}

      {/* نافذة إضافة وجبة جديدة (Modal) */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>إضافة وجبة جديدة للمنيو</span>
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-bold">اسم الوجبة:</label>
                <input
                  type="text"
                  placeholder="مثلاً: كص لحم عراقي دبل"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-bold">السعر بالدينار العراقي (د.ع):</label>
                <input
                  type="number"
                  placeholder="مثلاً: 6000"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-bold">القسم:</label>
                <select
                  value={newProdCatId}
                  onChange={(e) => setNewProdCatId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {myCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-bold">وصف الوجبة ومكوناتها:</label>
                <textarea
                  placeholder="لحم بلدي طازج مع صمون عراقي ومقبلات خاصة..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-bold">رابط صورة الوجبة (اختياري):</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-[11px] font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={newProdPopular}
                  onChange={(e) => setNewProdPopular(e.target.checked)}
                  className="rounded border-slate-800 text-amber-500 focus:ring-0"
                />
                <label htmlFor="popularCheck" className="text-slate-300 font-medium">
                  تمييز هذه الوجبة بشارة "الأكثر طلباً" 🔥
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة الوجبة للمنيو</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl"
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
