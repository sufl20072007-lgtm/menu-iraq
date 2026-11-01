/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Restaurant {
  id: string;
  slug: string; // الرابط الفريد مثل: baghdad-shawarma
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  phoneWhatsapp: string; // رقم الواتساب بالصيغة الدولية مثلا 9647700000000
  address: string;
  city: string;
  themeColor: string; // لون الثيم الأساسي
  templateId: 'modern-card' | 'minimal-list' | 'luxury-dark';
  isActive: boolean;
  currency: string; // الافتراضي: د.ع (IQD)
  instagram?: string;
  openTime?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  iconName?: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number; // بالدينار العراقي
  imageUrl?: string;
  isAvailable: boolean;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface CustomerOrderData {
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  orderType: 'dine_in' | 'delivery';
  tableNumber?: string;
  notes?: string;
}

export interface PlatformStat {
  totalRestaurants: number;
  activeMenus: number;
  totalOrdersSent: number;
  totalVisitsThisMonth: number;
}
