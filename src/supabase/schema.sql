-- ==============================================================================
-- 🇮🇶 MENU IRAQ SaaS - Database Schema & Multi-Tenant Architecture
-- ==============================================================================

-- 1. جدول المطاعم (Restaurants)
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL, -- الرابط الفريد مثل: baghdad-shawarma
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    phone_whatsapp TEXT NOT NULL, -- رقم الواتساب بدون مسافات
    address TEXT,
    city TEXT DEFAULT 'بغداد',
    logo_url TEXT,
    cover_url TEXT,
    theme_color TEXT DEFAULT '#ea580c',
    template_id TEXT DEFAULT 'modern-card', -- modern-card أو minimal-list
    currency TEXT DEFAULT 'د.ع',
    is_active BOOLEAN DEFAULT TRUE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول أقسام الطعام (Categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول الوجبات والمنتجات (Products)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 0) NOT NULL DEFAULT 0, -- السعر بالدينار العراقي بدون كسور
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. جدول إحصائيات الزيارات (Menu Visits)
CREATE TABLE IF NOT EXISTS public.menu_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 🔒 سياسات الأمان وعزل بيانات المطاعم (Row Level Security - RLS)
-- ==============================================================================

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_visits ENABLE ROW LEVEL SECURITY;

-- أي زائر يستطيع قراءة بيانات المطاعم الفعالة فقط
CREATE POLICY "Public can view active restaurants"
    ON public.restaurants FOR SELECT
    USING (is_active = TRUE);

-- صاحب المطعم فقط يستطيع تعديل بيانات مطعمه
CREATE POLICY "Owners can update own restaurant"
    ON public.restaurants FOR UPDATE
    USING (auth.uid() = owner_id);

-- الزبائن يقرؤون أقسام المطاعم
CREATE POLICY "Public can view categories of active restaurants"
    ON public.categories FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.restaurants 
        WHERE public.restaurants.id = public.categories.restaurant_id 
        AND public.restaurants.is_active = TRUE
    ));

-- أصحاب المطاعم يديرون أقسامهم فقط
CREATE POLICY "Owners can manage categories"
    ON public.categories FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.restaurants 
        WHERE public.restaurants.id = public.categories.restaurant_id 
        AND public.restaurants.owner_id = auth.uid()
    ));

-- الزبائن يقرؤون الوجبات المتوفرة
CREATE POLICY "Public can view products"
    ON public.products FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.restaurants 
        WHERE public.restaurants.id = public.products.restaurant_id 
        AND public.restaurants.is_active = TRUE
    ));

-- أصحاب المطاعم يديرون وجباتهم فقط
CREATE POLICY "Owners can manage products"
    ON public.products FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.restaurants 
        WHERE public.restaurants.id = public.products.restaurant_id 
        AND public.restaurants.owner_id = auth.uid()
    ));

-- تسجيل زيارة المنيو مسموح للجميع
CREATE POLICY "Public can insert visits"
    ON public.menu_visits FOR INSERT
    WITH CHECK (TRUE);

-- صاحب المطعم يرى زيارات مطعمه فقط
CREATE POLICY "Owners can view own visits"
    ON public.menu_visits FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.restaurants 
        WHERE public.restaurants.id = public.menu_visits.restaurant_id 
        AND public.restaurants.owner_id = auth.uid()
    ));

-- ==============================================================================
-- 🍽️ بيانات تجريبية أولية لمطعمين في بغداد
-- ==============================================================================

DO $$
DECLARE
    shawarma_id UUID;
    cat1_id UUID;
    cat2_id UUID;
BEGIN
    -- إدخال مطعم شاورما الكرادة إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM public.restaurants WHERE slug = 'shawarma-karrada') THEN
        INSERT INTO public.restaurants (slug, name, tagline, description, phone_whatsapp, address, city, theme_color, template_id, logo_url, cover_url)
        VALUES (
            'shawarma-karrada',
            'شاورما وقص الكرادة',
            'أشهى قص عراقي على الفحم ولحم بلدي 100%',
            'مطعم متخصص في الشاورما العراقية والوجبات السريعة بأعلى معايير الجودة والنظافة في بغداد.',
            '9647712345678',
            'بغداد - الكرادة داخل - تقاطع مسبح',
            'بغداد',
            '#ea580c',
            'modern-card',
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80'
        )
        RETURNING id INTO shawarma_id;

        -- أقسام المطعم
        INSERT INTO public.categories (restaurant_id, name, sort_order)
        VALUES (shawarma_id, 'الكص والشاورما', 1) RETURNING id INTO cat1_id;

        INSERT INTO public.categories (restaurant_id, name, sort_order)
        VALUES (shawarma_id, 'المقبلات والمشروبات', 2) RETURNING id INTO cat2_id;

        -- وجبات المطعم
        INSERT INTO public.products (restaurant_id, category_id, name, description, price, is_available, is_popular, image_url)
        VALUES 
            (shawarma_id, cat1_id, 'سندويش كص لحم عراقي', 'كص لحم بلدي طازج مع طماطم وطحينية وصمون عراقي حار مقرمش.', 4500, TRUE, TRUE, 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&auto=format&fit=crop&q=80'),
            (shawarma_id, cat1_id, 'وجبة كص لحم عربي دبل', 'صحن كص لحم مشوي عالفحم مع بطاطا مقرمشة، مخللات وثومية وصمون.', 8500, TRUE, TRUE, 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&auto=format&fit=crop&q=80'),
            (shawarma_id, cat2_id, 'صحن بطاطا مقرمشة حارة', 'أصابع بطاطا بتتبيلة خاصة وصوص.', 2500, TRUE, FALSE, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80'),
            (shawarma_id, cat2_id, 'شنينة عراقية مثلجة', 'لبن عراقي بارد بالنعناع.', 1000, TRUE, FALSE, 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&auto=format&fit=crop&q=80');
    END IF;
END $$;
