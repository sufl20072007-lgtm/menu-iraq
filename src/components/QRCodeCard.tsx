/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode, Sparkles, Check, Copy, ExternalLink, Printer } from 'lucide-react';

interface QRCodeCardProps {
  url: string;
  restaurantName: string;
  tableNumber?: string;
  themeColor?: string;
  qrCodeToken?: string;
  logoUrl?: string;
  isTableMode?: boolean;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  url,
  restaurantName,
  tableNumber,
  themeColor = '#ea580c',
  qrCodeToken,
  logoUrl,
  isTableMode = true,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(
      url,
      {
        width: 320,
        margin: 1.5,
        color: {
          dark: '#0f172a', // slate-900 sharp contrast
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err, generatedUrl) => {
        if (!err && isMounted && generatedUrl) {
          setDataUrl(generatedUrl);
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, [url, qrCodeToken]);

  // وظيفة تحميل بطاقة طاولة احترافية عالية الدقة مناسبة للطباعة المباشرة على الأكرليك أو الكرتون
  const handleDownloadPrintableStander = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1250;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // خلفية بيضاء أنيقة مع إطار أكريليك فخم
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 900, 1250);

    // إطار ملون علوي متوافق مع هوية المحل
    ctx.fillStyle = themeColor;
    ctx.fillRect(0, 0, 900, 180);

    // رأس البطاقة - اسم المطعم/الكافيه بخط عريض وفخم
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 46px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(restaurantName, 450, 80);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('المنيو الإلكتروني الذكي • MENU IRAQ', 450, 132);

    // شارة الطاولة الضخمة جداً - يراها الويتر من بعد 5 أمتار في الصالة
    if (isTableMode && tableNumber) {
      // كبسولة داكنة محددة بوضوح شديد
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(160, 210, 580, 140, 24);
      ctx.fill();

      // إطار بلون الثيم
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('طلب داخل الصالة', 450, 252);

      // رقم الطاولة بحجم عملاق
      ctx.fillStyle = '#fbbf24'; // لون ذهبي أصفر واضح
      ctx.font = '900 66px sans-serif';
      ctx.fillText(`طاولة رقم [ ${tableNumber} ]`, 450, 322);
    } else {
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(200, 220, 500, 90, 20);
      ctx.fill();

      ctx.fillStyle = themeColor;
      ctx.font = '900 40px sans-serif';
      ctx.fillText('توصيل دليفري أونلاين 🛵', 450, 280);
    }

    // رسم صورة الـ QR الفعلي
    if (dataUrl) {
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        // إطار كود QR فخم ونظيف
        const qrBoxY = isTableMode && tableNumber ? 380 : 350;
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(200, qrBoxY, 500, 500, 24);
        ctx.fill();

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.drawImage(qrImg, 225, qrBoxY + 25, 450, 450);

        // تعليمات واضحة بالعراقي
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 38px sans-serif';
        ctx.fillText('امسح الكود بكاميرا الموبايل 📱', 450, qrBoxY + 560);

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText('واطلب أكلك فوراً بدون انتظار الويتر', 450, qrBoxY + 610);

        // تذكير بالرقم أسفل الستاند
        if (isTableMode && tableNumber) {
          ctx.fillStyle = themeColor;
          ctx.font = '900 28px sans-serif';
          ctx.fillText(`🍽️ هذا الستاند مخصص لطاولة رقم (${tableNumber}) فقط`, 450, qrBoxY + 665);
        }

        // شريط سفلي موثق
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 1150, 900, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('MENU IRAQ • نظام المنيو السحابي المعتمد في العراق 🇮🇶', 450, 1210);

        // تصدير كصورة PNG عالية الجودة قابلة للطباعة المباشرة على الأكريليك
        const link = document.createElement('a');
        link.download = `ستاند-طاولة-${tableNumber || 'عام'}-${restaurantName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      qrImg.src = dataUrl;
    }
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-4 shadow-xl">
      {/* محاكاة ستاند الأكرليك الفعلي للطاولة (Acrylic Stand Mockup) */}
      <div className="relative inline-block bg-white rounded-3xl p-5 shadow-2xl border-4 border-slate-700/60 max-w-sm w-full mx-auto text-slate-900 transition-all hover:shadow-amber-500/10">
        {/* رأس الستاند: اسم المحل + شارة الطاولة الضخمة جداً */}
        <div className="border-b border-slate-200 pb-3 mb-3 text-center">
          <div className="text-xs font-black tracking-wider text-slate-500 mb-0.5">
            {restaurantName}
          </div>
          {isTableMode && tableNumber ? (
            <div className="mt-1 inline-flex items-center gap-2 bg-slate-900 text-amber-400 px-4 py-1.5 rounded-2xl border-2 border-amber-500/50 shadow-md">
              <span className="text-lg">🍽️</span>
              <span className="text-lg sm:text-xl font-black">طاولة رقم [ {tableNumber} ]</span>
            </div>
          ) : (
            <div className="mt-1 inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-xl font-bold text-xs">
              <span>🛵 طلبات التوصيل المنزلي</span>
            </div>
          )}
        </div>

        {/* كود QR الفعلي */}
        <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 inline-block shadow-inner">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt={`QR Code ${restaurantName} Table ${tableNumber || ''}`}
              className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain rounded-xl"
            />
          ) : (
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-slate-100 flex items-center justify-center rounded-xl">
              <span className="text-xs text-slate-500 animate-pulse">جاري إنشاء الباركود...</span>
            </div>
          )}
        </div>

        {/* إرشادات سريعة في أسفل الستاند يراها الزبون والويتر */}
        <div className="mt-3 text-center space-y-0.5">
          <div className="text-xs font-black text-slate-800">
            امسح الكود واطلب مباشرة 📱
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {isTableMode && tableNumber 
              ? `الطلب يصل فوراً لطاولة رقم (${tableNumber}) دون انتظار`
              : 'منيو إلكتروني سريع'}
          </div>
        </div>
      </div>

      {/* رابط مشفر فريد */}
      <div className="text-right space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>الرابط المشفّر داخل هذا الباركود:</span>
          {qrCodeToken && (
            <span className="text-amber-400 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              إصدار: #{qrCodeToken.slice(-6)}
            </span>
          )}
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-amber-300 break-all select-all flex items-center justify-between gap-2">
          <span className="truncate">{url}</span>
          <button
            type="button"
            onClick={copyUrlToClipboard}
            className="shrink-0 p-1 hover:text-white text-slate-400 transition-colors"
            title="نسخ الرابط"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* أزرار العمليات */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <button
          type="button"
          onClick={handleDownloadPrintableStander}
          className="flex-1 py-2.5 px-4 rounded-xl text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          style={{ backgroundColor: '#fbbf24' }} // amber-400
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>تحميل ستاند الطاولة عالي الدقة (PNG)</span>
        </button>

        <button
          type="button"
          onClick={copyUrlToClipboard}
          className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        💡 يمكنك طباعة الصورة الملتقطة على ستاند أكريليك شفاف ووضعه مباشرة على الطاولة {tableNumber ? `رقم ${tableNumber}` : ''}.
      </p>
    </div>
  );
};
