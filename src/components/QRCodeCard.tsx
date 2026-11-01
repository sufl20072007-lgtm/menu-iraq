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
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // خلفية بيضاء أنيقة
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 900, 1200);

    // إطار ملون متوافق مع هوية المحل
    ctx.fillStyle = themeColor;
    ctx.fillRect(0, 0, 900, 180);

    // رأس البطاقة
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(restaurantName, 450, 80);

    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('المنيو الإلكتروني الذكي', 450, 130);

    // شارة الطاولة
    if (isTableMode && tableNumber) {
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(250, 220, 400, 90, 20);
      ctx.fill();

      ctx.fillStyle = themeColor;
      ctx.font = 'bold 46px sans-serif';
      ctx.fillText(`طاولة رقم ${tableNumber}`, 450, 282);
    } else {
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(250, 220, 400, 80, 20);
      ctx.fill();

      ctx.fillStyle = themeColor;
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('توصيل دليفري أونلاين', 450, 275);
    }

    // رسم صورة الـ QR الفعلي
    if (dataUrl) {
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        // إطار كود QR
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 4;
        ctx.strokeRect(210, 350, 480, 480);
        ctx.drawImage(qrImg, 220, 360, 460, 460);

        // تعليمات واضحة بالعراقي
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('امسح الكود بكاميرا الموبايل 📱', 450, 910);

        ctx.fillStyle = '#64748b';
        ctx.font = '26px sans-serif';
        ctx.fillText('واطلب بدون انتظار الويتر فوراً', 450, 960);

        // شريط سفلي
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 1070, 900, 130);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('MENU IRAQ • نظام المنيو السحابي المعتمد', 450, 1145);

        // تصدير كصورة PNG قابلة للتحميل فوراً
        const link = document.createElement('a');
        link.download = `QR-${restaurantName.replace(/\s+/g, '_')}-طاولة-${tableNumber || 'العامة'}.png`;
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
      {/* بطاقة الباركود المعروضة */}
      <div className="relative inline-block bg-white p-3 rounded-2xl shadow-xl border-4 border-slate-800 transition-transform hover:scale-[1.02]">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR Code ${restaurantName} Table ${tableNumber || ''}`}
            className="w-52 h-52 sm:w-60 sm:h-60 mx-auto object-contain rounded-lg"
          />
        ) : (
          <div className="w-52 h-52 sm:w-60 sm:h-60 bg-slate-100 flex items-center justify-center rounded-lg">
            <span className="text-xs text-slate-500 animate-pulse">جاري إنشاء الباركود...</span>
          </div>
        )}

        {/* علامة الطاولة في أسفل الباركود */}
        {isTableMode && tableNumber && (
          <div
            className="mt-2 py-1 px-3 rounded-lg text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5"
            style={{ backgroundColor: themeColor }}
          >
            <span>🍽️ طاولة رقم ({tableNumber})</span>
          </div>
        )}
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
