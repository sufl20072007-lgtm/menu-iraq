/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Send,
  Phone,
  MapPin,
  Clock,
  Search,
  Sparkles,
  Utensils,
  Check,
  Copy,
  ChevronRight,
  ArrowRight,
  QrCode,
  Share2,
  ExternalLink,
  Flame,
  Bike,
  Store,
  Layers,
  X
} from 'lucide-react';
import { Restaurant, Category, Product, CartItem, CustomerOrderData } from '../types';
import { QRCodeCard } from './QRCodeCard';

interface CustomerMenuViewProps {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onClearCart: () => void;
}

export const CustomerMenuView: React.FC<CustomerMenuViewProps> = ({
  restaurant,
  categories,
  products,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onClearCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // تحديد قناة الدخول: هل دخل من باركود الطاولة أم من رابط الموقع/السوشيال ميديا؟
  const [accessChannel, setAccessChannel] = useState<'qr_table' | 'web_delivery'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'delivery') return 'web_delivery';
      if (params.get('mode') === 'table' || params.has('table') || params.get('qr') === '1') return 'qr_table';
    }
    return 'qr_table'; // افتراضياً تجربة مسح باركود الطاولة
  });

  // رقم الطاولة المستخرج من الرابط (إن وُجد)
  const initialTable = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('table') || '1'
    : '1';

  // بيانات استمارة الطلب
  const [orderData, setOrderData] = useState<CustomerOrderData>({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    orderType: accessChannel === 'qr_table' ? 'dine_in' : 'delivery',
    tableNumber: initialTable,
    notes: '',
  });

  // حالة إظهار شبكة اختيار الطاولة اليدوية (مخفية افتراضياً لأن الباركود يحددها تلقائياً)
  const [showManualTablePicker, setShowManualTablePicker] = useState<boolean>(false);

  // مزامنة نوع الطلب تلقائياً مع قناة الدخول
  React.useEffect(() => {
    setOrderData((prev) => ({
      ...prev,
      orderType: accessChannel === 'qr_table' ? 'dine_in' : 'delivery',
    }));
  }, [accessChannel]);

  // الحسابات المالية
  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // تصفية الوجبات والمشروبات حسب المطعم أو الكافيه والقسم والبحث
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const belongsToRest = p.restaurantId === restaurant.id || !p.restaurantId;
      if (!belongsToRest) return false;
      if (!p.isAvailable) return false; // العناصر المتوفرة فقط

      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, restaurant.id, selectedCategory, searchQuery]);

  // أرقام تعبيرية منسقة للواتساب
  const getNumberEmoji = (num: number) => {
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return emojis[num - 1] || `${num}.`;
  };

  // توليد رسالة الواتساب المنسقة بخط فائق الترتيب والوضوح
  const generateWhatsAppMessage = () => {
    let msg = `*━━━━━━━━━━━━━━━━━━━━━*\n`;
    msg += `*🍽️ طلب جديد من المنيو الإلكتروني ☕*\n`;
    msg += `*━━━━━━━━━━━━━━━━━━━━━*\n\n`;
    msg += `🏛️ *المحل:* *${restaurant.name}*\n`;
    
    if (accessChannel === 'qr_table') {
      msg += `📍 *نوع الطلب:* *داخل الصالة - طاولة رقم (${orderData.tableNumber || '1'})* 🍽️\n`;
    } else {
      msg += `🛵 *نوع الطلب:* *توصيل دليفري إلى البيت* 🏠\n`;
    }
    msg += `*─────────────────────*\n`;
    msg += `📋 *تفاصيل الطلبات:*\n\n`;

    cart.forEach((item, index) => {
      const numEmoji = getNumberEmoji(index + 1);
      const itemTotal = (item.product.price * item.quantity).toLocaleString();
      const unitPrice = item.product.price.toLocaleString();
      msg += `${numEmoji} *${item.product.name}*\n`;
      msg += `   ↳ *الكمية:* ${item.quantity} × ${unitPrice} = *${itemTotal} ${restaurant.currency}*\n\n`;
    });

    msg += `*─────────────────────*\n`;
    msg += `💰 *المجموع الكلي:* *${totalAmount.toLocaleString()} ${restaurant.currency}*\n`;
    msg += `*─────────────────────*\n`;

    if (accessChannel === 'qr_table') {
      if (orderData.notes && orderData.notes.trim()) {
        msg += `📝 *ملاحظات الطاولة:*\n${orderData.notes.trim()}\n`;
        msg += `*─────────────────────*\n`;
      }
    } else {
      if (orderData.customerName && orderData.customerName.trim()) {
        msg += `👤 *اسم الزبون:* ${orderData.customerName.trim()}\n`;
      }
      msg += `📱 *رقم هاتف المستلم:* ${orderData.customerPhone || 'غير محدد'}\n`;
      msg += `📍 *عنوان التوصيل:* ${orderData.deliveryAddress || 'غير محدد'}\n`;
      if (orderData.notes && orderData.notes.trim()) {
        msg += `📝 *ملاحظات التوصيل:*\n${orderData.notes.trim()}\n`;
      }
      msg += `*─────────────────────*\n`;
    }

    msg += `_📱 تم الإرسال عبر المنيو الإلكتروني الذكي MENU IRAQ_`;
    return msg;
  };

  const handleSendOrder = () => {
    if (cart.length === 0) return;
    const phone = restaurant.phoneWhatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(generateWhatsAppMessage());
    const waUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(waUrl, '_blank');
  };

  const themeColor = restaurant.themeColor || '#ea580c';
  const template = restaurant.templateId || 'modern-card';

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-24">
      {/* شريط الإجراءات العلوي للزبون */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: themeColor }} />
          <span className="text-xs font-bold text-white">منيو {restaurant.name} الإلكتروني</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border border-slate-700"
          >
            <QrCode className="w-3.5 h-3.5" style={{ color: themeColor }} />
            <span>كود QR</span>
          </button>
          <button
            onClick={() => {
              const url = accessChannel === 'qr_table' 
                ? `https://menuiraq.com/${restaurant.slug}?mode=table&table=${orderData.tableNumber || '1'}`
                : `https://menuiraq.com/${restaurant.slug}?mode=delivery`;
              navigator.clipboard.writeText(url);
              setCopiedUrl(true);
              setTimeout(() => setCopiedUrl(false), 2000);
            }}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border border-slate-700"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>مشاركة</span>
          </button>
        </div>
      </div>

      {/* شريط ذكي يفصل بين مصدر الدخول: باركود الطاولة مقابل رابط الدليفري */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accessChannel === 'qr_table' ? themeColor : '#2563eb' }} />
          <div>
            <div className="font-bold text-white text-xs">
              {accessChannel === 'qr_table' ? '📱 داخل الصالة (ممسوح من باركود الطاولة)' : '🌐 متصفح خارجي (رابط الموقع والسوشيال ميديا)'}
            </div>
            <div className="text-[11px] text-slate-400">
              {accessChannel === 'qr_table' 
                ? '✅ خيار الدليفري ملغي تماماً للزبون الجالس على الطاولة منعاً للالتباس' 
                : '✅ خيار الطاولات ملغي ومخصص حصرياً لطلبات التوصيل للمنازل'}
            </div>
          </div>
        </div>

        {/* محاكي تبديل طريقة الدخول لتجربة الواجهتين */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              setAccessChannel('qr_table');
              setOrderData((prev) => ({ ...prev, orderType: 'dine_in' }));
            }}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
              accessChannel === 'qr_table'
                ? 'text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              backgroundColor: accessChannel === 'qr_table' ? themeColor : undefined,
            }}
          >
            <span>🍽️</span>
            <span>طاولة الصالة</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAccessChannel('web_delivery');
              setOrderData((prev) => ({ ...prev, orderType: 'delivery' }));
            }}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
              accessChannel === 'web_delivery'
                ? 'text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              backgroundColor: accessChannel === 'web_delivery' ? '#2563eb' : undefined,
            }}
          >
            <span>🛵</span>
            <span>توصيل دليفري</span>
          </button>
        </div>
      </div>

      {/* غلاف المطعم ومعلوماته وهوية التصميم */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="h-40 md:h-52 w-full overflow-hidden relative">
          <img
            src={restaurant.coverUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="relative p-4 md:p-6 -mt-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="flex items-end gap-3.5">
            <img
              src={restaurant.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150'}
              alt={restaurant.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl shrink-0"
            />
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-black text-white">{restaurant.name}</h2>
              <p className="text-xs md:text-sm font-bold" style={{ color: themeColor }}>
                {restaurant.tagline || 'أشهى المأكولات والمشروبات'}
              </p>
              <div className="flex items-center gap-3 text-slate-400 text-xs">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{restaurant.address || restaurant.city || 'بغداد'}</span>
                </span>
                {restaurant.openTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{restaurant.openTime}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* هاتف الواتساب المباشر */}
          <a
            href={`https://wa.me/${restaurant.phoneWhatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            <Phone className="w-4 h-4" />
            <span>تواصل مع المطعم</span>
          </a>
        </div>
      </div>

      {/* شريط البحث السريع عن الأكلات */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="ابحث عن وجبتك المفضلة (مثلاً: كص، برغر، مقبلات، فتوش)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white focus:outline-none shadow-sm"
          style={{ borderColor: searchQuery ? themeColor : undefined }}
        />
      </div>

      {/* شريط أقسام الطعام الملون بهوية المطعم */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
            selectedCategory === 'all'
              ? 'text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
          style={{
            backgroundColor: selectedCategory === 'all' ? themeColor : undefined,
          }}
        >
          الكل ({products.filter((p) => p.restaurantId === restaurant.id || !p.restaurantId).length})
        </button>

        {categories
          .filter((c) => c.restaurantId === restaurant.id || !c.restaurantId)
          .map((cat) => {
            const isCatSelected = selectedCategory === cat.id;
            const count = products.filter(
              (p) => (p.restaurantId === restaurant.id || !p.restaurantId) && p.categoryId === cat.id
            ).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                  isCatSelected
                    ? 'text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
                style={{
                  backgroundColor: isCatSelected ? themeColor : undefined,
                }}
              >
                <span>{cat.name}</span>
                <span className="opacity-70 text-[10px] mr-1.5">({count})</span>
              </button>
            );
          })}
      </div>

      {/* عرض الوجبات حسب القالب المختار */}
      {filteredProducts.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
          <Utensils className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="font-bold text-sm text-slate-300">لا توجد وجبات في هذا القسم حالياً</h4>
          <p className="text-xs text-slate-500">اختر قسماً آخر أو جرّب البحث باسم وجبة أخرى.</p>
        </div>
      ) : template === 'minimal-list' ? (
        // ==================== القالب 2: Minimal List (قائمة أنيقة ومبسطة) ====================
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 divide-y divide-slate-800/80 shadow-lg">
          {filteredProducts.map((product) => {
            const inCart = cart.find((i) => i.product.id === product.id);
            return (
              <div key={product.id} className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-800"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-white truncate">{product.name}</h4>
                      {product.isPopular && (
                        <span
                          className="text-[9px] px-1.5 py-0.2 rounded font-black text-white"
                          style={{ backgroundColor: themeColor }}
                        >
                          الأكثر طلباً
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{product.description}</p>
                    <div className="font-black text-sm mt-1" style={{ color: themeColor }}>
                      {product.price.toLocaleString()} {restaurant.currency}
                    </div>
                  </div>
                </div>

                {inCart ? (
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => onUpdateQuantity(product.id, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-white">{inCart.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(product.id, 1)}
                      className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold"
                      style={{ backgroundColor: themeColor }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onAddToCart(product)}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center gap-1 transition-transform active:scale-95 shrink-0"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>إضافة</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // ==================== القالب 1: Modern Cards (بطاقات الوجبات المصورة) ====================
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => {
            const inCart = cart.find((i) => i.product.id === product.id);
            return (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-3 flex gap-3.5 hover:border-slate-700 transition-all shadow-md items-center"
              >
                {product.imageUrl && (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-800">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    {product.isPopular && (
                      <span
                        className="absolute top-1 right-1 text-[9px] font-black text-white px-1.5 py-0.5 rounded-md shadow-md"
                        style={{ backgroundColor: themeColor }}
                      >
                        🔥 مميز
                      </span>
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">{product.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{product.description}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-black text-sm" style={{ color: themeColor }}>
                      {product.price.toLocaleString()} {restaurant.currency}
                    </span>

                    {inCart ? (
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-white">{inCart.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, 1)}
                          className="w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold"
                          style={{ backgroundColor: themeColor }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddToCart(product)}
                        className="w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-md transition-transform active:scale-90"
                        style={{ backgroundColor: themeColor }}
                        title="إضافة للسلة"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* الشريط السفلي العائم للسلة المباشرة (Sticky Floating Bottom Cart) */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
          <div
            onClick={() => setShowCartDrawer(true)}
            className="p-3.5 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer border border-white/20 text-white transition-all transform hover:scale-[1.01] active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center font-black text-sm">
                {totalItemsCount}
              </div>
              <div>
                <div className="text-xs font-bold opacity-90">سلة الطلبات</div>
                <div className="text-sm font-black">
                  {totalAmount.toLocaleString()} {restaurant.currency}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-xs bg-black/20 px-3 py-1.5 rounded-xl">
              <span>عرض السلة وإرسال الطلب</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* نافذة سلة المشتريات وإتمام الطلب للواتساب (Cart Drawer Modal) */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* رأس السلة */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" style={{ color: themeColor }} />
                <h3 className="font-bold text-sm text-white">سلة طلباتك ({totalItemsCount} عناصر)</h3>
              </div>
              <button
                onClick={() => setShowCartDrawer(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* محتوى السلة التفاعلي */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* قائمة الوجبات بالسلة */}
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 min-w-0 pl-2">
                      <div className="font-bold text-white truncate">{item.product.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {(item.product.price * item.quantity).toLocaleString()} {restaurant.currency}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded text-white flex items-center justify-center"
                          style={{ backgroundColor: themeColor }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* قسم بيانات الطلب المعزول تماماً حسب طريقة الدخول */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                {accessChannel === 'qr_table' ? (
                  // ==================== واجهة زبون الصالة (ممسوح من كود الطاولة) ====================
                  // خيار الدليفري ملغي بالكامل هنا لمنع اللخبطة
                  <div className="space-y-3">
                    {/* بطاقة تأكيد رقم الطاولة الملتقطة تلقائياً من الباركود */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-lg font-black shrink-0">
                          🍽️
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-white">
                              طاولة رقم <span className="text-amber-400 font-mono text-sm underline underline-offset-2">[{orderData.tableNumber || '1'}]</span>
                            </span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                              ✓ محددة تلقائياً من الباركود
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                            طاولتك مسجلة تلقائياً • الويتر سيجلب الأكل لمكانك مباشرة
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowManualTablePicker(!showManualTablePicker)}
                        className="text-[11px] text-slate-400 hover:text-amber-300 underline decoration-slate-600 hover:decoration-amber-400 shrink-0 font-medium px-1 cursor-pointer transition-colors"
                      >
                        {showManualTablePicker ? 'إغلاق الأرقام ✕' : 'تغيير الطاولة؟'}
                      </button>
                    </div>

                    {/* خيار تغيير الطاولة (يظهر فقط إذا أراد الزبون التغيير بعد انتقاله لطاولة ثانية) */}
                    {showManualTablePicker && (
                      <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-amber-500/30 space-y-3 text-xs animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <label className="text-amber-300 font-bold text-xs flex items-center gap-1.5">
                            <span>هل انتقلت لطاولة أخرى؟ اختر رقمها الجديد:</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowManualTablePicker(false)}
                            className="text-[10px] text-slate-400 hover:text-white"
                          >
                            تم ✓
                          </button>
                        </div>

                        {/* أزرار سريعة لأرقام الطاولات ديناميكياً */}
                        {(() => {
                          const count = restaurant.tablesCount && restaurant.tablesCount > 0 ? restaurant.tablesCount : 12;
                          const tableList = Array.from({ length: count }, (_, i) => String(i + 1));
                          return (
                            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 mb-2 max-h-44 overflow-y-auto p-1.5 bg-slate-900/60 rounded-xl border border-slate-800">
                              {tableList.map((num) => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => {
                                    setOrderData({ ...orderData, tableNumber: num });
                                    setShowManualTablePicker(false);
                                  }}
                                  className={`py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                                    orderData.tableNumber === num
                                      ? 'text-white shadow-md scale-105 ring-2 ring-white/30'
                                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                  }`}
                                  style={{
                                    backgroundColor: orderData.tableNumber === num ? themeColor : undefined,
                                  }}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          );
                        })()}

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 shrink-0">أو رقم طاولة أخرى:</span>
                          <input
                            type="text"
                            placeholder="مثلاً: VIP، الصالة العائلية..."
                            value={orderData.tableNumber}
                            onChange={(e) => setOrderData({ ...orderData, tableNumber: e.target.value })}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs font-bold text-center focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <div>
                        <label className="text-slate-300 block mb-1 font-medium">ملاحظات على الوجبات والمشروبات (اختياري):</label>
                        <input
                          type="text"
                          placeholder="مثلاً: شاي خفيف، بدون شكر، صمون مقسب، زيادة ثلج..."
                          value={orderData.notes}
                          onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // ==================== واجهة زبون الدليفري (رابط السوشيال ميديا أو الموقع) ====================
                  // خيار الطاولات ملغي بالكامل هنا
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🛵</span>
                        <div>
                          <div className="text-xs font-black text-white">طلب توصيل دليفري للبيت أو العمل</div>
                          <div className="text-[10px] text-blue-300">دخول عبر رابط الموقع • مخصص حصرياً للتوصيل الخارجي</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-xl border border-blue-500/30">
                        توصيل سريع
                      </span>
                    </div>

                    <div className="space-y-2.5 bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 text-xs">
                      <div>
                        <label className="text-slate-200 block mb-1 font-bold">عنوان التوصيل بالتفصيل: *</label>
                        <input
                          type="text"
                          placeholder="المحافظة، المنطقة، اسم الشارع، أقرب نقطة دالة أو بناية..."
                          value={orderData.deliveryAddress}
                          onChange={(e) => setOrderData({ ...orderData, deliveryAddress: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-200 block mb-1 font-bold">رقم هاتف المستلم: *</label>
                          <input
                            type="text"
                            placeholder="0770..."
                            value={orderData.customerPhone}
                            onChange={(e) => setOrderData({ ...orderData, customerPhone: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-300 block mb-1">اسمك الكريم (اختياري):</label>
                          <input
                            type="text"
                            placeholder="مثلاً: علي"
                            value={orderData.customerName}
                            onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1">ملاحظات التوصيل (اختياري):</label>
                        <input
                          type="text"
                          placeholder="أي تفاصيل خاصة بالسائق أو وقت الاستلام..."
                          value={orderData.notes}
                          onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* معاينة الفاتورة المنظمة قبل الإرسال بخط مرتب ومريح للعين */}
                <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-white">
                      <span>🧾</span>
                      <span>معاينة الفاتورة الإلكترونية:</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold">
                      {accessChannel === 'qr_table' ? `طاولة (${orderData.tableNumber || '1'})` : 'توصيل منزلي'}
                    </span>
                  </div>

                  {/* قائمة الأصناف مرتبة بفواصل نظيفة وخط واضح */}
                  <div className="space-y-1.5 text-xs divide-y divide-slate-800/60">
                    {cart.map((item, idx) => (
                      <div key={item.product.id} className="pt-1.5 first:pt-0 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-700">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-100 truncate">{item.product.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 bg-slate-950 px-1.5 py-0.5 rounded">
                            {item.quantity}×
                          </span>
                        </div>
                        <span className="font-bold font-mono text-emerald-400 text-xs shrink-0">
                          {(item.product.price * item.quantity).toLocaleString()} {restaurant.currency}
                        </span>
                      </div>
                    ))}
                  </div>

                  {orderData.notes && orderData.notes.trim() && (
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                      <span className="text-amber-400 font-bold ml-1">📝 ملاحظة:</span>
                      <span>{orderData.notes.trim()}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">المجموع المطلوب للدفع:</span>
                    <span className="text-base font-black text-white font-mono">
                      {totalAmount.toLocaleString()} {restaurant.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* زر إرسال الطلب النهائي لواتساب */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
              <button
                onClick={handleSendOrder}
                className="w-full py-3.5 rounded-xl text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 hover:opacity-95"
                style={{ backgroundColor: '#16a34a' }} // واتساب الأخضر الرسمي
              >
                <Send className="w-4 h-4" />
                <span>
                  {accessChannel === 'qr_table'
                    ? `إرسال طلب طاولة (${orderData.tableNumber || '1'}) إلى واتساب 🍽️`
                    : `إرسال طلب التوصيل إلى واتساب 🛵`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة باركود QR للطاولات (QR Modal) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-5 text-center space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>🍽️ باركود طاولة {orderData.tableNumber || '1'}</span>
                <span className="text-[11px] text-slate-400">({restaurant.name})</span>
              </h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white font-bold p-1">
                ✕
              </button>
            </div>

            <QRCodeCard
              url={`https://menuiraq.com/${restaurant.slug}?mode=table&table=${orderData.tableNumber || '1'}${restaurant.qrCodeToken ? `&v=${restaurant.qrCodeToken}` : ''}`}
              restaurantName={restaurant.name}
              tableNumber={orderData.tableNumber || '1'}
              themeColor={themeColor}
              qrCodeToken={restaurant.qrCodeToken}
              isTableMode={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
