/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Utensils,
  QrCode,
  ShoppingBag,
  Send,
  Phone,
  CheckCircle,
  Shield,
  Layers,
  Sparkles,
  ChefHat,
  Store,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
  Eye,
  Plus,
  Minus,
  Trash2,
  FileText,
  Database,
  GitBranch,
  Building2,
  Share2,
  Sliders,
  DollarSign,
  Info,
  Server,
  RefreshCw,
  Key
} from 'lucide-react';
import { Restaurant, Category, Product, CartItem } from './types';
import { getSupabaseClient, getSupabaseConfig, saveSupabaseConfig } from './supabase/client';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { RestaurantOwnerDashboard } from './components/RestaurantOwnerDashboard';

// مطاعم نموذجية لإظهار كيف يعمل نظام الـ Multi-tenant
const SAMPLE_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    slug: 'shawarma-karrada',
    name: 'شاورما وقص الكرادة',
    tagline: 'أشهى قص عراقي على الفحم ولحم بلدي 100%',
    description: 'مطعم متخصص في الشاورما العراقية والوجبات السريعة بأعلى معايير الجودة والنظافة في بغداد.',
    phoneWhatsapp: '9647712345678',
    address: 'بغداد - الكرادة داخل - تقاطع مسبح',
    city: 'بغداد',
    themeColor: '#ea580c', // برتقالي مشهي
    templateId: 'modern-card',
    isActive: true,
    currency: 'د.ع',
    openTime: '12:00 م - 2:00 ص',
    createdAt: '2026-11-01',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rest-2',
    slug: 'mansour-burger',
    name: 'بيرغر هاوس المنصور',
    tagline: 'بيرغر لحم أنجوس طازج وخلطات سرية لا تقاوم',
    description: 'تجربة البيرغر الأمريكي بنكهات شرقية مميزة ومقبلات خاصة.',
    phoneWhatsapp: '9647801234567',
    address: 'بغداد - المنصور - شارع 14 رمضان',
    city: 'بغداد',
    themeColor: '#e11d48', // أحمر عصري
    templateId: 'minimal-list',
    isActive: true,
    currency: 'د.ع',
    openTime: '1:00 م - 3:00 ص',
    createdAt: '2026-11-01',
    logoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
  }
];

const SAMPLE_CATEGORIES: Category[] = [
  { id: 'cat-1', restaurantId: 'rest-1', name: 'الكص والشاورما', sortOrder: 1 },
  { id: 'cat-2', restaurantId: 'rest-1', name: 'وجبات وسندويشات', sortOrder: 2 },
  { id: 'cat-3', restaurantId: 'rest-1', name: 'مقبلات وعصائر', sortOrder: 3 },
];

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    restaurantId: 'rest-1',
    categoryId: 'cat-1',
    name: 'سندويش كص لحم عراقي',
    description: 'كص لحم بلدي طازج مع طماطم وطحينية وصمون عراقي حار مقرمش.',
    price: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'p-2',
    restaurantId: 'rest-1',
    categoryId: 'cat-1',
    name: 'وجبة كص لحم عربي دبل',
    description: 'صحن كص لحم مشوي عالفحم مع بطاطا مقرمشة، مخللات وثومية وصمون.',
    price: 8500,
    imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'p-3',
    restaurantId: 'rest-1',
    categoryId: 'cat-1',
    name: 'سندويش كص دجاج بصلصة الثوم',
    description: 'دجاج متبل بالخلطة اللبنانية مع مخلل خيار وبطاطا مقلية وصلصة ثوم خاصة.',
    price: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    id: 'p-4',
    restaurantId: 'rest-1',
    categoryId: 'cat-2',
    name: 'بيرغر لحم مشوي دبل جبن',
    description: 'قطعتين لحم عراقي صافي مع جبنة شيدر ذائبة وصوص البرغر الخاص.',
    price: 7500,
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
  },
  {
    id: 'p-5',
    restaurantId: 'rest-1',
    categoryId: 'cat-3',
    name: 'صحن بطاطا ودجز حارة',
    description: 'أصابع بطاطا بتتبيلة بهارات حارة خاصة وكاتشب ومايونيز.',
    price: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    id: 'p-6',
    restaurantId: 'rest-1',
    categoryId: 'cat-3',
    name: 'شنينة عراقية باردة (لبن بالنعناع)',
    description: 'لبن عراقي مخفوق منعش مع النعناع والثلج.',
    price: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'superadmin' | 'owner' | 'simulator' | 'guide'>('owner');
  
  // حالة الاتصال بقاعدة بيانات Supabase
  const [dbConfig, setDbConfig] = useState(getSupabaseConfig());
  const [inputUrl, setInputUrl] = useState(dbConfig.url);
  const [inputAnonKey, setInputAnonKey] = useState(dbConfig.anonKey);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // قائمة المطاعم والأصناف
  const [restaurantsList, setRestaurantsList] = useState<Restaurant[]>(SAMPLE_RESTAURANTS);
  const [categoriesList, setCategoriesList] = useState<Category[]>(SAMPLE_CATEGORIES);
  const [productsList, setProductsList] = useState<Product[]>(SAMPLE_PRODUCTS);

  // حالة المحاكي للمطعم النشط
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant>(SAMPLE_RESTAURANTS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTemplate, setActiveTemplate] = useState<'modern-card' | 'minimal-list'>('modern-card');
  const [cart, setCart] = useState<CartItem[]>([
    { product: SAMPLE_PRODUCTS[0], quantity: 2 },
    { product: SAMPLE_PRODUCTS[4], quantity: 1 },
  ]);
  const [customerName, setCustomerName] = useState('أحمد العراقي');
  const [customerAddress, setCustomerAddress] = useState('الكرادة - قرب ساحة كهرمانة');
  const [customerNotes, setCustomerNotes] = useState('الصمون مقسب وبدون بصل رجاءً');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // محاولة جلب البيانات الحقيقية من Supabase عند توفر المفاتيح
  const loadDataFromSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      setIsConnecting(true);
      const { data: dbRestaurants, error: rError } = await client
        .from('restaurants')
        .select('*')
        .eq('is_active', true);

      if (rError) throw rError;

      if (dbRestaurants && dbRestaurants.length > 0) {
        const formatted: Restaurant[] = dbRestaurants.map((r: any) => ({
          id: r.id,
          slug: r.slug,
          name: r.name,
          tagline: r.tagline || '',
          description: r.description || '',
          phoneWhatsapp: r.phone_whatsapp,
          address: r.address || '',
          city: r.city || 'بغداد',
          themeColor: r.theme_color || '#ea580c',
          templateId: r.template_id || 'modern-card',
          isActive: r.is_active,
          currency: r.currency || 'د.ع',
          logoUrl: r.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150',
          coverUrl: r.cover_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
          createdAt: r.created_at,
        }));
        setRestaurantsList(formatted);
        setSelectedRestaurant(formatted[0]);

        // جلب الأقسام
        const { data: dbCats } = await client
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });
        
        if (dbCats && dbCats.length > 0) {
          const formattedCats: Category[] = dbCats.map((c: any) => ({
            id: c.id,
            restaurantId: c.restaurant_id,
            name: c.name,
            sortOrder: c.sort_order,
          }));
          setCategoriesList(formattedCats);
        }

        // جلب الوجبات
        const { data: dbProds } = await client
          .from('products')
          .select('*')
          .eq('is_available', true);

        if (dbProds && dbProds.length > 0) {
          const formattedProds: Product[] = dbProds.map((p: any) => ({
            id: p.id,
            restaurantId: p.restaurant_id,
            categoryId: p.category_id,
            name: p.name,
            description: p.description || '',
            price: Number(p.price) || 0,
            imageUrl: p.image_url,
            isAvailable: p.is_available,
            isPopular: p.is_popular,
          }));
          setProductsList(formattedProds);
          setCart([
            { product: formattedProds[0], quantity: 1 }
          ]);
        }

        setConnectionMessage('تم الاتصال بنجاح! تم تحميل المطاعم والوجبات من قاعدة بياناتك الحقيقية 🟢');
      }
    } catch (err: any) {
      console.error('Supabase query error:', err);
      setConnectionMessage(`تنبيه: ${err.message || 'حدث خطأ في جلب البيانات'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  React.useEffect(() => {
    if (dbConfig.isConfigured) {
      loadDataFromSupabase();
    }
  }, [dbConfig.isConfigured]);

  const handleSaveConnection = () => {
    if (!inputUrl.trim() || !inputAnonKey.trim()) {
      alert('يرجى لصق كل من Project URL و anon key');
      return;
    }
    saveSupabaseConfig(inputUrl, inputAnonKey);
    setDbConfig(getSupabaseConfig());
    setShowConfigModal(false);
    setTimeout(() => {
      loadDataFromSupabase();
    }, 200);
  };

  // حساب المجموع
  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // توليد نص رسالة الواتساب
  const generateWhatsAppMessage = () => {
    let msg = `*طلب جديد من المنيو الإلكتروني 🍽️*\n`;
    msg += `المطعم: *${selectedRestaurant.name}*\n`;
    msg += `-------------------------\n`;
    cart.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.product.name} × ${item.quantity} = ${(item.product.price * item.quantity).toLocaleString()} ${selectedRestaurant.currency}\n`;
    });
    msg += `-------------------------\n`;
    msg += `*المجموع الكلي:* *${totalAmount.toLocaleString()} ${selectedRestaurant.currency}*\n\n`;
    msg += `👤 *اسم الزبون:* ${customerName}\n`;
    msg += `📍 *عنوان التوصيل:* ${customerAddress}\n`;
    if (customerNotes) {
      msg += `📝 *ملاحظات:* ${customerNotes}\n`;
    }
    msg += `\n_تم الإرسال عبر منصة MENU IRAQ_`;
    return msg;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* الشريط العلوي - Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-black text-xl">
              🇮🇶
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg md:text-xl text-white tracking-wide">MENU IRAQ</h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  SaaS منصة
                </span>
              </div>
              <p className="text-xs text-slate-400">نظام المنيو الإلكتروني وطلبات الواتساب للمطاعم</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className={`text-xs px-2.5 py-1 rounded-full font-bold border flex items-center gap-1.5 transition-all ${
                dbConfig.isConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{dbConfig.isConfigured ? 'Supabase متصل 🟢' : 'ربط Supabase 🔗'}</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>خطواتك</span>
            </button>
          </div>
        </div>

        {/* أشرطة التنقل على الهواتف - Mobile-Friendly Tabs */}
        <div className="max-w-6xl mx-auto mt-3 flex items-center gap-1 md:gap-2 border-t border-slate-800/80 pt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('owner')}
            className={`py-2 px-3 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'owner'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span>لوحة صاحب المطعم (Dashboard)</span>
          </button>
          <button
            onClick={() => setActiveTab('superadmin')}
            className={`py-2 px-3 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'superadmin'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>لوحة المدير العام (Super Admin)</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-2 px-3 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'simulator'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>منيو الزبون وسلة الطلب</span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-3 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>فكرة النظام</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2 px-3 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'guide'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <span>المراحل</span>
          </button>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* ===================== التبويب: لوحة صاحب المطعم Restaurant Owner ===================== */}
        {activeTab === 'owner' && (
          <RestaurantOwnerDashboard
            restaurant={selectedRestaurant}
            categories={categoriesList}
            products={productsList}
            onUpdateRestaurant={(updated) => {
              setSelectedRestaurant(updated);
              setRestaurantsList((prev) =>
                prev.map((r) => (r.id === updated.id ? updated : r))
              );
            }}
            onUpdateCategories={setCategoriesList}
            onUpdateProducts={setProductsList}
            onPreviewMenu={() => setActiveTab('simulator')}
          />
        )}

        {/* ===================== التبويب: لوحة المدير العام Super Admin ===================== */}
        {activeTab === 'superadmin' && (
          <SuperAdminPanel
            restaurants={restaurantsList}
            onRestaurantsChange={setRestaurantsList}
            onPreviewRestaurant={(restaurant) => {
              setSelectedRestaurant(restaurant);
              setActiveTab('simulator');
            }}
          />
        )}
        
        {/* ===================== التبويب 1: نظرة عامة وهندسة النظام ===================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* بطاقة الترحيب والفكرة */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-5 md:p-8">
              <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>مشروع SaaS تجاري حقيقي قابل للبيع والاشتراك الشهري</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  أهلاً بك يا بطل! بنينا لك أساس أقوى منصة منيو للمطاعم في العراق 🇮🇶
                </h2>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                  أنت الآن صاحب المشروع وأنا مهندسك ومُعلّمك الشخصي. هذا التطبيق ليس مجرد صفحة عادية، بل نظام <strong className="text-amber-400">Multi-Tenant SaaS</strong>. 
                  معنى ذلك أنك تبني الكود <span className="underline decoration-amber-500 underline-offset-4 font-bold text-white">مرة واحدة فقط</span>، 
                  وتستطيع بيعه لعشرات ومئات المطاعم (في بغداد، أربيل، البصرة، الموصل، وكل المحافظات) بدون ما تعيد برمجة أي شيء!
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>جرّب محاكي المنيو والواتساب الآن</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('guide')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all border border-slate-700 flex items-center gap-2"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>خطوتك الأولى لحفظ الكود باسمك</span>
                  </button>
                </div>
              </div>
            </div>

            {/* كيف يعمل الـ Multi-Tenant للمطاعم بتبسيط عراقي؟ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">1. كود واحد وقاعدة بيانات واحدة</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ما نحتاج نسوي موقع جديد لكل مطعم. السيستم مبرمج بذكاء يفهم من هو المطعم من خلال الرابط (Slug)، ويجلب وجباته وصوره تلقائياً.
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg text-[11px] font-mono text-blue-300 border border-slate-800">
                  menuiraq.com/<span className="text-amber-400 font-bold">shawarma-karrada</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">2. عزل وحماية البيانات (RLS)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  كل مطعم عنده معرف خاص به (Restaurant ID). صاحب مطعم الكرادة مستحيل يشوف أو يعدل وجبات أو مبيعات مطعم المنصور. الحماية مشفرة بقاعدة البيانات.
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg text-[11px] font-mono text-emerald-300 border border-slate-800">
                  WHERE restaurant_id = current_restaurant
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">3. ميزانية $0 واشتراك شهري</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  الأدوات كلها مجانية (Vite + Supabase Free + GitHub). تكلفة الخادم عليك صفر دولار، بينما أنت تبيع الاشتراك للمطعم بـ 25,000 إلى 50,000 د.ع شهرياً!
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg text-[11px] font-mono text-amber-300 border border-slate-800">
                  100 مطعم × 30 ألف د.ع = 3 مليون د.ع شهرياً
                </div>
              </div>
            </div>

            {/* الثلاث لوحات الأساسية للنظام */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <span>أركان المنصة الثلاثة التي سنبنيها معك خطوة بخطوة:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">اللوحة 1</span>
                    <span className="text-[10px] text-slate-400">حسابك أنت فقط</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">لوحة المدير العام (Super Admin)</h4>
                  <p className="text-xs text-slate-400">
                    أنت المدير الوحيد، من موبايلك تضغط "إضافة مطعم"، تكتب اسمه ورقم تلفونه وينشأ حسابه والمنيو فوراً، وتفعّل أو توقف اشتراكه.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">اللوحة 2</span>
                    <span className="text-[10px] text-slate-400">لكل صاحب مطعم</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">لوحة صاحب المطعم (Dashboard)</h4>
                  <p className="text-xs text-slate-400">
                    يدخل برقم هاتفه، يرفع لوغو وصور وجباته، يحدد الأسعار بالدينار، يطبع كود الـ QR، ويختار ثيم ولون المنيو الذي يعجبه.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">الواجهة 3</span>
                    <span className="text-[10px] text-slate-400">للزبائن على الطاولة أو البيت</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">منيو الزبون السريع + سلة الواتساب</h4>
                  <p className="text-xs text-slate-400">
                    يفتح بثانية بدون تحميل أي تطبيق، يختار الوجبات، يضيف للسلة، وبكبسة زر يروح الطلب مرتب ومحسوب لواتساب المطعم.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== التبويب 2: محاكي المنيو الحي ===================== */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-fadeIn">
            {/* شريط التحكم بالمحاكي */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 block">اختر المطعم لعرض المنيو:</span>
                    {dbConfig.isConfigured && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                        بيانات سحابية حية
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {restaurantsList.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRestaurant(r)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                          selectedRestaurant.id === r.id
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* تبديل القالب */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">نوع القالب:</span>
                <button
                  onClick={() => setActiveTemplate('modern-card')}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 ${
                    activeTemplate === 'modern-card'
                      ? 'bg-slate-700 text-white border border-slate-600'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>بطاقات مصورة (Modern)</span>
                </button>
                <button
                  onClick={() => setActiveTemplate('minimal-list')}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 ${
                    activeTemplate === 'minimal-list'
                      ? 'bg-slate-700 text-white border border-slate-600'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>قائمة أنيقة (Minimal)</span>
                </button>
              </div>
            </div>

            {/* هيكل المحاكي: مظهر هاتف ذكي للزبون */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* شاشة الهاتف (منيو الزبون) */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="w-full max-w-sm rounded-[36px] bg-slate-900 border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col min-h-[640px] max-h-[750px]">
                  
                  {/* كاميرا الهاتف وحواف الشاشة */}
                  <div className="bg-slate-950 px-6 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800">
                    <span>12:54</span>
                    <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto"></div>
                    <span>5G 98%</span>
                  </div>

                  {/* غلاف المطعم ومعلوماته */}
                  <div className="relative h-32 bg-slate-800 overflow-hidden">
                    <img
                      src={selectedRestaurant.coverUrl}
                      alt="غلاف المطعم"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                    <div className="absolute bottom-2 right-3 left-3 flex items-center gap-2.5">
                      <img
                        src={selectedRestaurant.logoUrl}
                        alt="لوغو المطعم"
                        className="w-12 h-12 rounded-xl border-2 border-white/20 object-cover shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm text-white truncate">{selectedRestaurant.name}</h4>
                        <p className="text-[11px] text-amber-300 truncate">{selectedRestaurant.tagline}</p>
                      </div>
                    </div>
                  </div>

                  {/* شريط الأقسام */}
                  <div className="bg-slate-950 px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-800">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      الكل
                    </button>
                    {categoriesList
                      .filter((c) => c.restaurantId === selectedRestaurant.id || !c.restaurantId)
                      .map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                          selectedCategory === cat.id
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* قائمة الوجبات (تتغير حسب القالب المختار) */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-950">
                    {productsList
                      .filter(
                        (p) =>
                          (p.restaurantId === selectedRestaurant.id || !p.restaurantId) &&
                          (selectedCategory === 'all' || p.categoryId === selectedCategory)
                      )
                      .map((product) => (
                      <div
                        key={product.id}
                        className={
                          activeTemplate === 'modern-card'
                            ? 'bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex gap-3 p-2.5 items-center hover:border-slate-700 transition-all'
                            : 'bg-slate-900/60 border-b border-slate-800 p-2.5 flex justify-between items-center'
                        }
                      >
                        {activeTemplate === 'modern-card' && product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-xs text-white truncate">{product.name}</h5>
                            {product.isPopular && (
                              <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded font-semibold">
                                الأكثر طلباً
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{product.description}</p>
                          <div className="text-amber-400 font-bold text-xs mt-1">
                            {product.price.toLocaleString()} {selectedRestaurant.currency}
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart(product)}
                          className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm transition-all"
                          title="إضافة للسلة"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* الشريط السفلي داخل المنيو: السلة السريعة */}
                  <div className="bg-slate-900 p-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <ShoppingBag className="w-5 h-5 text-amber-400" />
                        {totalItemsCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                            {totalItemsCount}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">المجموع:</span>
                        <span className="text-xs font-black text-white">
                          {totalAmount.toLocaleString()} {selectedRestaurant.currency}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const el = document.getElementById('order-summary');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md shadow-emerald-500/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إتمام الطلب</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* تفاصيل السلة ورسالة الواتساب المولدة تلقائياً */}
              <div id="order-summary" className="lg:col-span-5 space-y-4">
                
                {/* بطاقة السلة وإعدادات الزبون */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      <span>محتويات سلة الزبون ({totalItemsCount} عناصر)</span>
                    </h4>
                    <span className="text-xs text-amber-400 font-bold">
                      {totalAmount.toLocaleString()} {selectedRestaurant.currency}
                    </span>
                  </div>

                  {cart.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      السلة فارغة، اضغط على زر (+) في أي وجبة لإضافتها.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="font-bold text-white truncate">{item.product.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {(item.product.price * item.quantity).toLocaleString()} {selectedRestaurant.currency}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-white w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* بيانات التوصيل */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">اسم الزبون:</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">عنوان التوصيل أو رقم الطاولة:</label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">ملاحظات إضافية:</label>
                      <input
                        type="text"
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* معاينة رسالة الواتساب المولدة آلياً */}
                <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>شكل الرسالة التلقائية في واتساب المطعم:</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(generateWhatsAppMessage(), 'whatsapp-msg')}
                      className="text-[11px] text-emerald-300 hover:text-white bg-emerald-900/40 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                    >
                      {copiedText === 'whatsapp-msg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>نسخ النص</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-emerald-900/40 text-xs font-mono text-emerald-200 whitespace-pre-line leading-relaxed">
                    {generateWhatsAppMessage()}
                  </div>

                  {/* زر تجربة إرسال الواتساب الفعلي */}
                  <a
                    href={`https://wa.me/${selectedRestaurant.phoneWhatsapp}?text=${encodeURIComponent(generateWhatsAppMessage())}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>تجربة فتح الواتساب الحقيقي للطلب</span>
                  </a>
                </div>

                {/* كود الـ QR الخاص بهذا المطعم */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center shadow-md">
                    <QrCode className="w-14 h-14 text-slate-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-white">باركود QR لطاولات {selectedRestaurant.name}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      يُطبع ويلصق على الطاولات. عند مسحه بالموبايل ينفتح منيو هذا المطعم مباشرة.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ===================== التبويب 3: خطوات المالك وحفظ GitHub ===================== */}
        {activeTab === 'guide' && (
          <div className="space-y-6 animate-fadeIn">
            {/* بطاقة توجيه واضحة لصاحب المشروع */}
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    أحسنت! 🎯 تم إنشاء المستودع بنجاح: menu-iraq
                  </span>
                  <h3 className="text-xl font-black text-white mt-2">
                    المرحلة 1 - الخطوة 2: رفع ومزامنة الكود مع حسابك
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                  <GitBranch className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                المستودع تم ربطه محلياً (<code className="text-amber-400">https://github.com/sufl20072007-lgtm/menu-iraq.git</code>) وجهزنا كل ملفات المنصة. حتى نسمح للنظام برفع الملفات لحسابك، نحتاج رمز وصول سريع (Token) من GitHub.
              </p>
            </div>

            {/* دليل الخطوة الأولى بالضغطات والأزرار المحددة لهاتف الأندرويد */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="font-bold text-base text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                  1
                </span>
                <span>خطواتك عبر هاتف Android (دقيقة ومحددة بالزر والمكان):</span>
              </h4>

              <div className="space-y-3 text-xs md:text-sm text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                    أ
                  </div>
                  <div>
                    <strong className="text-white">افتح متصفح هاتفك</strong> (مثل Google Chrome) واذهب إلى الرابط:
                    <div className="mt-1 flex items-center gap-2">
                      <a
                        href="https://github.com/new"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 underline font-mono text-xs flex items-center gap-1"
                      >
                        github.com/new <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-slate-500 text-[11px]">(صفحة إنشاء مستودع جديد)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                    ب
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div>
                      في خانة <strong className="text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Repository name</strong> اكتب اسم المشروع:
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/20 font-bold">
                        menu-iraq
                      </span>
                      <button
                        onClick={() => copyToClipboard('menu-iraq', 'repo-name')}
                        className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded flex items-center gap-1"
                      >
                        {copiedText === 'repo-name' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>نسخ الاسم</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                    ج
                  </div>
                  <div>
                    اختر <strong className="text-white">Public</strong> (عام) أو <strong className="text-white">Private</strong> (خاص بك وحدك)، ولا تضع علامة صح أمام "Add a README file" لأننا جهزنا ملف README احترافي بالفعل.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                    د
                  </div>
                  <div>
                    انزل لأسفل الشاشة واضغط على الزر الأخضر:
                    <div className="mt-1.5">
                      <span className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg inline-block text-xs">
                        Create repository
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex items-start gap-3 bg-amber-950/10">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs shrink-0 mt-0.5 font-black">
                    هـ
                  </div>
                  <div className="space-y-1">
                    <strong className="text-amber-300">الخطوة الأخيرة:</strong>
                    <p className="text-slate-300">
                      انسخ رابط المستودع الذي سيظهر لك (يكون شكله هكذا: <code className="text-amber-400">https://github.com/حسابك/menu-iraq.git</code>) 
                      وأرسله لي في رسالتك القادمة، أو اكتب لي: <span className="text-white font-bold underline">"سويت المستودع وهذا الرابط..."</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* خريطة المراحل الثمانية للمشروع كاملاً */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>خريطة المراحل الثمانية لـ MENU IRAQ (حتى الإطلاق والبيع):</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 1, title: 'تأسيس المشروع و GitHub', status: 'جاري العمل الآن', active: true, done: false },
                  { id: 2, title: 'قاعدة بيانات Supabase و RLS', status: 'المرحلة القادمة', active: false, done: false },
                  { id: 3, title: 'لوحة المدير العام Super Admin', status: 'قريباً', active: false, done: false },
                  { id: 4, title: 'لوحة صاحب المطعم وتخصيص المنيو', status: 'قريباً', active: false, done: false },
                  { id: 5, title: 'نظام القوالب وسرعة العرض', status: 'قريباً', active: false, done: false },
                  { id: 6, title: 'سلة الواتساب وباركود QR', status: 'قريباً', active: false, done: false },
                  { id: 7, title: 'عداد الزيارات وإحصائيات المبيعات', status: 'قريباً', active: false, done: false },
                  { id: 8, title: 'الفحص الأمني والنشر الحقيقي', status: 'الهدف النهائي', active: false, done: false },
                ].map((phase) => (
                  <div
                    key={phase.id}
                    className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-2 ${
                      phase.active
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">مرحلة {phase.id}</span>
                      {phase.active && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>}
                    </div>
                    <div className="font-bold text-white text-[13px]">{phase.title}</div>
                    <div className="text-[10px] text-slate-400">{phase.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ملف المتابعة PROJECT_PROGRESS.md */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h5 className="font-bold text-xs text-white">ملف PROJECT_PROGRESS.md مُنشأ ومحدّث</h5>
                  <p className="text-[11px] text-slate-400">
                    يحفظ كل خطوة بدقة. لو انقطعت المحادثة أو فتحت محادثة جديدة، نواصل فوراً بدون أن يضيع عليك أي عمل.
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono">
                جاهز ومحفوظ
              </span>
            </div>

          </div>
        )}

      </main>

      {/* نافذة إعداد مفاتيح Supabase */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 md:p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">ربط قاعدة بيانات Supabase الحقيقية</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              انسخ <strong className="text-amber-400">Project URL</strong> و <strong className="text-amber-400">anon public key</strong> من إعدادات مشروعك في Supabase (من صفحة Project Settings ➔ API):
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">1. رابط المشروع (Project URL):</label>
                <input
                  type="text"
                  placeholder="https://xxxxxxxx.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">2. المفتاح العام (anon public key):</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={inputAnonKey}
                  onChange={(e) => setInputAnonKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {connectionMessage && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 text-xs font-medium">
                  {connectionMessage}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveConnection}
                disabled={isConnecting}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الاتصال...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>حفظ وتفعيل الاتصال</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* التذييل - Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 px-4 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>منصة MENU IRAQ – نظام SaaS متعدد المطاعم 🇮🇶</span>
          <span className="text-amber-400/80 font-medium">خطوة بخطوة من الصفر حتى البيع التجاري للمطاعم</span>
        </div>
      </footer>
    </div>
  );
}
