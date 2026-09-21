'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BadgePercent,
  Check,
  ChevronLeft,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { defaultStoreState, STORAGE_KEY, type Product, type StoreState } from '@/lib/store-data';

const cx = (...args: Array<string | false | null | undefined>) => args.filter(Boolean).join(' ');

type CartItem = { productId: string; quantity: number };

export default function Storefront() {
  const [store, setStore] = useState<StoreState>(defaultStoreState);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
  });
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StoreState;
        setStore(parsed);
      } catch {
        setStore(defaultStoreState);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  const visibleProducts = useMemo(() => {
    return store.products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return !product.hidden && product.inStock && matchesSearch;
    });
  }, [searchTerm, store.products]);

  const cartItems = useMemo(() => {
    return cart
      .map((item) => {
        const product = store.products.find((p) => p.id === item.productId);
        if (!product || product.hidden) return null;
        return { ...item, product };
      })
      .filter(Boolean) as Array<CartItem & { product: Product }>;
  }, [cart, store.products]);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const addToCart = (productId: string) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, direction: 'inc' | 'dec') => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = direction === 'inc' ? item.quantity + 1 : item.quantity - 1;
          return { ...item, quantity: nextQty };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const finalizeOrder = () => {
    if (!customer.fullName || !customer.phone || !customer.address || !customer.city || cartItems.length === 0) {
      alert('يرجى إكمال جميع بيانات الزبون وإضافة منتجات إلى السلة.');
      return;
    }

    const orderNumber = `#${Date.now().toString().slice(-6)}`;
    const itemsSummary = cartItems
      .map((item) => `- ${item.product.name} × ${item.quantity} = ${item.product.discountPrice ?? item.product.price} جنيه`)
      .join('\n');

    const message = `مرحباً، أريد إتمام الطلب التالي:\n\n*رقم الطلب:* ${orderNumber}\n*اسم الزبون:* ${customer.fullName}\n*الهاتف:* ${customer.phone}\n*المدينة:* ${customer.city}\n*العنوان:* ${customer.address}\n\n*المنتجات:*\n${itemsSummary}\n\n*الإجمالي:* ${subtotal} جنيه`;

    const waLink = `https://wa.me/${store.settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank', 'noopener,noreferrer');

    setInvoiceData({
      orderNumber,
      customer,
      items: cartItems,
      subtotal,
      createdAt: new Date().toLocaleString('ar-EG'),
    });
    setShowInvoice(true);
  };

  const downloadInvoice = () => {
    if (!invoiceData) return;

    const html = `
      <html>
        <body style="font-family:Tahoma,Arial; padding: 30px; direction: rtl;">
          <h1 style="text-align:center;">${store.settings.shopName}</h1>
          <h3>فاتورة الطلب ${invoiceData.orderNumber}</h3>
          <p>الاسم: ${invoiceData.customer.fullName}</p>
          <p>الهاتف: ${invoiceData.customer.phone}</p>
          <p>المدينة: ${invoiceData.customer.city}</p>
          <p>العنوان: ${invoiceData.customer.address}</p>
          <hr />
          ${invoiceData.items
            .map(
              (item: any) =>
                `<p>${item.product.name} × ${item.quantity} = ${item.product.discountPrice ?? item.product.price} جنيه</p>`
            )
            .join('')}
          <hr />
          <h3>المجموع: ${invoiceData.subtotal} جنيه</h3>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceData.orderNumber}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const themeStyle = {
    '--theme-color': store.settings.themeColor,
  } as React.CSSProperties;

  return (
    <main className="min-h-screen text-slate-900" style={themeStyle}>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={store.settings.logoUrl} alt={store.settings.shopName} className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">{store.settings.shopName}</h1>
              <p className="text-xs text-slate-500">{store.settings.shopDescription}</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            {store.categories.map((category) => (
              <a key={category.id} href={`#${category.id}`} className="transition hover:text-[var(--theme-color)]">
                {category.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن المنتج"
                className="w-52 rounded-full border border-slate-200 bg-slate-50 py-2 pr-9 pl-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-[var(--theme-color)]"
              />
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <ShoppingBag className="h-4 w-4" />
              <span>{totalItems}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="mb-8 overflow-hidden rounded-[32px] bg-white shadow-soft">
          <div className="grid items-center gap-10 p-6 md:grid-cols-2 md:p-10">
            <div>
              <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                متجر عربي جديد
              </span>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
                اكتشف أحدث المنتجات <span className="text-[var(--theme-color)]">بأسعار مميزة</span>
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">{store.settings.shopDescription}</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="#products"
                  className="rounded-full px-5 py-3 text-sm font-bold text-white shadow-lg"
                  style={{ background: store.settings.themeColor }}
                >
                  تسوق الآن
                </a>
                <Link href="/admin" className="rounded-full border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700">
                  لوحة التحكم
                </Link>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
              alt="Store hero"
              className="h-[360px] w-full rounded-[28px] object-cover"
            />
          </div>
        </section>

        <section id="products" className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            {store.categories.map((category) => {
              const categoryProducts = visibleProducts.filter((product) => product.categoryId === category.id);
              if (!categoryProducts.length) return null;

              return (
                <div key={category.id} id={category.id}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-2xl font-extrabold text-slate-900">{category.name}</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {categoryProducts.length} منتجات
                    </span>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {categoryProducts.map((product) => {
                      const discount = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
                      return (
                        <article key={product.id} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-soft">
                          <div className="relative">
                            <img src={product.image} alt={product.name} className="h-56 w-full object-cover" />
                            {discount > 0 && (
                              <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                <BadgePercent className="h-3.5 w-3.5" />
                                خصم {discount}%
                              </span>
                            )}
                          </div>

                          <div className="space-y-3 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xl font-bold text-slate-900">{product.name}</h4>
                              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700">
                                {product.inStock ? 'متوفر' : 'غير متوفر'}
                              </span>
                            </div>

                            <p className="text-sm leading-7 text-slate-600">{product.description}</p>

                            <div className="flex items-end gap-2">
                              <span className="text-2xl font-black text-slate-900">{product.discountPrice ?? product.price} ج</span>
                              {product.discountPrice && (
                                <span className="text-sm text-slate-400 line-through">{product.price} ج</span>
                              )}
                            </div>

                            <button
                              onClick={() => addToCart(product.id)}
                              className="w-full rounded-full px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                              style={{ background: store.settings.themeColor }}
                            >
                              إضافة إلى السلة
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">السلة</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {totalItems} عنصر
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                السلة فارغة حالياً
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{item.product.name}</p>
                        <p className="text-xs text-slate-500">
                          {item.product.discountPrice ?? item.product.price} ج × {item.quantity}
                        </p>
                      </div>
                      <button onClick={() => removeFromCart(item.productId)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1">
                        <button onClick={() => updateQty(item.productId, 'dec')} className="rounded-full bg-slate-100 p-1">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, 'inc')} className="rounded-full bg-slate-100 p-1">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-slate-900">
                        {(item.product.discountPrice ?? item.product.price) * item.quantity} ج
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-4 border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>المجموع الفرعي</span>
                <span className="font-bold text-slate-900">{subtotal} ج</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>التوصيل</span>
                <span className="font-bold text-emerald-600">مجاني</span>
              </div>
              <div className="flex items-center justify-between text-lg font-black text-slate-900">
                <span>الإجمالي</span>
                <span>{subtotal} ج</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="grid gap-3">
                <input
                  value={customer.fullName}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="الاسم الكامل"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[var(--theme-color)]"
                />
                <input
                  value={customer.phone}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="رقم الهاتف"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[var(--theme-color)]"
                />
                <input
                  value={customer.city}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="المدينة"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[var(--theme-color)]"
                />
                <textarea
                  value={customer.address}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="العنوان"
                  rows={3}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[var(--theme-color)]"
                />
              </div>

              <button
                onClick={finalizeOrder}
                className="mt-3 w-full rounded-full px-4 py-3 text-sm font-bold text-white shadow-lg"
                style={{ background: store.settings.themeColor }}
              >
                إتمام الطلب عبر الواتساب
              </button>
            </div>
          </aside>
        </section>
      </main>

      {showInvoice && invoiceData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl rounded-[30px] bg-white p-6 shadow-2xl">
            <div className="no-print mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">الفاتورة</h3>
              <button onClick={() => setShowInvoice(false)} className="rounded-full bg-slate-100 p-2 text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{store.settings.shopName}</h4>
                  <p className="text-xs text-slate-500">رقم الطلب: {invoiceData.orderNumber}</p>
                </div>
                <div className="rounded-xl bg-white p-2 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`Order: ${invoiceData.orderNumber} | Customer: ${invoiceData.customer.fullName}`)}`}
                    alt="QR invoice"
                    className="h-20 w-20 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <p><span className="font-bold text-slate-900">الاسم:</span> {invoiceData.customer.fullName}</p>
                <p><span className="font-bold text-slate-900">الهاتف:</span> {invoiceData.customer.phone}</p>
                <p><span className="font-bold text-slate-900">المدينة:</span> {invoiceData.customer.city}</p>
                <p><span className="font-bold text-slate-900">العنوان:</span> {invoiceData.customer.address}</p>
                <p><span className="font-bold text-slate-900">التاريخ:</span> {invoiceData.createdAt}</p>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="px-3 py-2">المنتج</th>
                      <th className="px-3 py-2">الكمية</th>
                      <th className="px-3 py-2">الس��ر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item: any) => (
                      <tr key={item.productId} className="border-t border-slate-200">
                        <td className="px-3 py-2">{item.product.name}</td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2">{(item.product.discountPrice ?? item.product.price) * item.quantity} ج</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-black text-slate-900">
                <span>الإجمالي</span>
                <span>{invoiceData.subtotal} ج</span>
              </div>
            </div>

            <div className="no-print mt-5 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white"
              >
                طباعة
              </button>
              <button
                onClick={downloadInvoice}
                className="rounded-full px-4 py-2 text-sm font-bold text-white"
                style={{ background: store.settings.themeColor }}
              >
                تنزيل الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
