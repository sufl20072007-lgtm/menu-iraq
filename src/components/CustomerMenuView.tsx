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

  // بيانات استمارة الطلب (افتراضياً طلب طاولة للمسح السريع داخل الصالة)
  const [orderData, setOrderData] = useState<CustomerOrderData>({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    orderType: 'dine_in',
    tableNumber: '1',
    notes: '',
  });

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

  // توليد رسالة الواتساب المنسقة باحترافية
  const generateWhatsAppMessage = () => {
    let msg = `*طلب جديد عبر المنيو الإلكتروني 🍽️☕*\n`;
    msg += `المحل: *${restaurant.name}*\n`;
    
    if (orderData.orderType === 'dine_in') {
      msg += `📍 *نوع الطلب:* *داخل الصالة - طاولة رقم (${orderData.tableNumber || '1'})* 🍽️\n`;
    } else {
      msg += `🛵 *نوع الطلب:* *توصيل دليفري*\n`;
    }
    msg += `--------------------------------\n`;

    cart.forEach((item, index) => {
      msg += `${index + 1}. *${item.product.name}* × ${item.quantity} = ${(
        item.product.price * item.quantity
      ).toLocaleString()} ${restaurant.currency}\n`;
    });

    msg += `--------------------------------\n`;
    msg += `*المجموع الكلي:* *${totalAmount.toLocaleString()} ${restaurant.currency}*\n\n`;

    if (orderData.orderType === 'dine_in') {
      // طلب الطاولة مبسط جداً بدون طلب رقم هاتف
      if (orderData.notes) {
        msg += `📝 *ملاحظات الطاولة:* ${orderData.notes}\n`;
      }
    } else {
      // طلب التوصيل دليفري
      if (orderData.customerName) {
        msg += `👤 *اسم الزبون:* ${orderData.customerName}\n`;
      }
      msg += `📱 *رقم الهاتف:* ${orderData.customerPhone || 'غير محدد'}\n`;
      msg += `📍 *عنوان التوصيل:* ${orderData.deliveryAddress || 'غير محدد'}\n`;
      if (orderData.notes) {
        msg += `📝 *ملاحظات التوصيل:* ${orderData.notes}\n`;
      }
    }

    msg += `\n_تم الطلب عبر المنيو الإلكتروني الذكي_`;
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
              navigator.clipboard.writeText(`https://menuiraq.com/${restaurant.slug}`);
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

              {/* اختيار نوع الطلب (داخل الصالة أو توصيل فقط) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">اختر نوع طلبك:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderData({ ...orderData, orderType: 'dine_in' })}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all text-xs font-bold flex items-center justify-center gap-1.5 ${
                      orderData.orderType === 'dine_in'
                        ? 'text-white shadow-lg ring-1 ring-white/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: orderData.orderType === 'dine_in' ? themeColor : undefined,
                      borderColor: orderData.orderType === 'dine_in' ? themeColor : undefined,
                    }}
                  >
                    <span>🍽️</span>
                    <span>داخل الصالة (طاولة)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderData({ ...orderData, orderType: 'delivery' })}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all text-xs font-bold flex items-center justify-center gap-1.5 ${
                      orderData.orderType === 'delivery'
                        ? 'text-white shadow-lg ring-1 ring-white/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: orderData.orderType === 'delivery' ? themeColor : undefined,
                      borderColor: orderData.orderType === 'delivery' ? themeColor : undefined,
                    }}
                  >
                    <span>🛵</span>
                    <span>توصيل دليفري</span>
                  </button>
                </div>
              </div>

              {/* استمارة الطلب المبسطة حسب نوع الطلب */}
              <div className="space-y-3 text-xs">
                {orderData.orderType === 'dine_in' ? (
                  // واجهة داخل الصالة: فائقة البساطة والسلاسة بلمسة واحدة بدون رقم هاتف
                  <div className="space-y-3 bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800/80">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white font-bold text-xs flex items-center gap-1.5">
                          <span>🍽️ اختر رقم طاولتك:</span>
                        </label>
                        <span className="text-xs text-amber-400 font-mono font-black bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          طاولة: {orderData.tableNumber || '1'}
                        </span>
                      </div>
                      
                      {/* أزرار سريعة لأرقام الطاولات بلمسة واحدة */}
                      <div className="grid grid-cols-6 gap-1.5 mb-2.5">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setOrderData({ ...orderData, tableNumber: num })}
                            className={`py-2 rounded-xl font-black text-xs transition-all ${
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

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 shrink-0">أو رقم طاولة أخرى:</span>
                        <input
                          type="text"
                          placeholder="مثلاً: 14، خارجي، VIP..."
                          value={orderData.tableNumber}
                          onChange={(e) => setOrderData({ ...orderData, tableNumber: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white text-xs font-bold text-center focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">ملاحظات على الطلب (اختياري):</label>
                      <input
                        type="text"
                        placeholder="مثلاً: بدون شكر، زيادة ثلج، صمون مقسب..."
                        value={orderData.notes}
                        onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ) : (
                  // استمارة التوصيل دليفري (تحتاج العنوان والهاتف للتوصيل)
                  <div className="space-y-2.5 bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800/80">
                    <div>
                      <label className="text-slate-200 block mb-1 font-bold">عنوان التوصيل بالتفصيل: *</label>
                      <input
                        type="text"
                        placeholder="المنطقة، الشارع، أقرب نقطة دالة أو بناية..."
                        value={orderData.deliveryAddress}
                        onChange={(e) => setOrderData({ ...orderData, deliveryAddress: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-200 block mb-1 font-bold">رقم الهاتف: *</label>
                        <input
                          type="text"
                          placeholder="0770..."
                          value={orderData.customerPhone}
                          onChange={(e) => setOrderData({ ...orderData, customerPhone: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 block mb-1">اسمك الكريم (اختياري):</label>
                        <input
                          type="text"
                          placeholder="الاسم"
                          value={orderData.customerName}
                          onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">ملاحظات التوصيل (اختياري):</label>
                      <input
                        type="text"
                        placeholder="أي تفاصيل خاصة بالسائق أو الطلب..."
                        value={orderData.notes}
                        onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* زر إرسال الطلب النهائي لواتساب */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">المجموع الكلي:</span>
                <span className="text-base font-black text-white">
                  {totalAmount.toLocaleString()} {restaurant.currency}
                </span>
              </div>

              <button
                onClick={handleSendOrder}
                className="w-full py-3.5 rounded-xl text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 hover:opacity-95"
                style={{ backgroundColor: '#16a34a' }} // واتساب الأخضر الرسمي
              >
                <Send className="w-4 h-4" />
                <span>
                  {orderData.orderType === 'dine_in'
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
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">باركود QR لطاولات {restaurant.name}</h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl border-4 border-slate-700">
              <div className="w-44 h-44 bg-slate-950 flex flex-col items-center justify-center rounded-xl p-2 text-white">
                <QrCode className="w-32 h-32 text-white" />
                <div className="text-[10px] font-mono mt-1 text-amber-300">menuiraq.com/{restaurant.slug}</div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              امسح الكود بكاميرا الموبايل لتجربة فتح المنيو مباشرة.
            </p>

            <button
              onClick={() => {
                alert('جاهز للطباعة واللصق على طاولات المطعم!');
                setShowQrModal(false);
              }}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md"
              style={{ backgroundColor: themeColor }}
            >
              تحميل وحفظ الباركود
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
