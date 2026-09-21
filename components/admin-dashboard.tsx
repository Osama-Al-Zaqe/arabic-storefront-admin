'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Check,
  ChevronLeft,
  ImagePlus,
  LayoutDashboard,
  Palette,
  Plus,
  Save,
  Shield,
  ShoppingCart,
  Trash2,
  Warehouse,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { defaultStoreState, STORAGE_KEY, type Product, type StoreSettings, type StoreState } from '@/lib/store-data';

const cx = (...args: Array<string | false | null | undefined>) => args.filter(Boolean).join(' ');

export default function AdminDashboard() {
  const [store, setStore] = useState<StoreState>(defaultStoreState);
  const [newCategory, setNewCategory] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    categoryId: defaultStoreState.categories[0]?.id || '',
    price: '0',
    discountPrice: '0',
    image: '',
    inStock: true,
  });

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

  const salesTotal = useMemo(
    () => store.products.reduce((sum, product) => sum + (product.discountPrice ?? product.price), 0),
    [store.products]
  );

  const totalProducts = store.products.length;
  const activeOrders = Math.max(12, Math.round(totalProducts * 2.4));
  const bestSeller = useMemo(() => {
    const product = [...store.products].sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price))[0];
    return product?.name || 'لا يوجد';
  }, [store.products]);

  const updateSettings = (key: keyof StoreSettings, value: string) => {
    setStore((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;

    const id = newCategory.trim().replace(/\s+/g, '-').toLowerCase();
    setStore((prev) => ({
      ...prev,
      categories: [...prev.categories, { id, name: newCategory.trim() }],
    }));
    setNewCategory('');
  };

  const deleteCategory = (id: string) => {
    setStore((prev) => ({
      ...prev,
      categories: prev.categories.filter((category) => category.id !== id),
      products: prev.products.map((product) =>
        product.categoryId === id ? { ...product, categoryId: prev.categories[0]?.id || '', hidden: true } : product
      ),
    }));
  };

  const addProduct = () => {
    if (!productForm.name || !productForm.description || !productForm.categoryId) return;

    const product: Product = {
      id: `prod-${Date.now()}`,
      name: productForm.name,
      description: productForm.description,
      categoryId: productForm.categoryId,
      price: Number(productForm.price) || 0,
      discountPrice: Number(productForm.discountPrice) || undefined,
      image: productForm.image || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
      inStock: productForm.inStock,
      hidden: false,
    };

    setStore((prev) => ({
      ...prev,
      products: [product, ...prev.products],
    }));

    setProductForm({
      name: '',
      description: '',
      categoryId: store.categories[0]?.id || '',
      price: '0',
      discountPrice: '0',
      image: '',
      inStock: true,
    });
  };

  const updateProduct = (id: string, field: keyof Product, value: string | boolean | number | undefined) => {
    setStore((prev) => ({
      ...prev,
      products: prev.products.map((product) =>
        product.id === id ? { ...product, [field]: value } : product
      ),
    }));
  };

  const deleteProduct = (id: string) => {
    setStore((prev) => ({
      ...prev,
      products: prev.products.filter((product) => product.id !== id),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] bg-white p-5 shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-violet-700">لوحة تحكم الإدارة</p>
            <h1 className="text-3xl font-black text-slate-900">إدارة المتجر المتكاملة</h1>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">
            زيارة المتجر
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: 'إجمالي المبيعات', value: `${salesTotal} ج`, icon: <WalletIcon /> },
            { title: 'عدد الطلبات', value: `${activeOrders}`, icon: <ShoppingCartIcon /> },
            { title: 'إجمالي المنتجات', value: `${totalProducts}`, icon: <WarehouseIcon /> },
            { title: 'الأكثر مبيعاً', value: bestSeller, icon: <BarChart3Icon /> },
          ].map((card) => (
            <div key={card.title} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="mt-3 text-2xl font-black text-slate-900">{card.value}</p>
                </div>
                <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-5 flex items-center gap-3">
                <Palette className="h-5 w-5 text-violet-700" />
                <h2 className="text-xl font-black text-slate-900">هوية المتجر والتصميم</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>اسم المتجر</span>
                  <input
                    value={store.settings.shopName}
                    onChange={(e) => updateSettings('shopName', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-violet-500"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>رابط الشعار</span>
                  <input
                    value={store.settings.logoUrl}
                    onChange={(e) => updateSettings('logoUrl', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-violet-500"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-600 md:col-span-2">
                  <span>وصف المتجر</span>
                  <textarea
                    value={store.settings.shopDescription}
                    onChange={(e) => updateSettings('shopDescription', e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-violet-500"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>اللون الرئيسي</span>
                  <input
                    type="color"
                    value={store.settings.themeColor}
                    onChange={(e) => updateSettings('themeColor', e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 p-1"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>رقم الواتساب</span>
                  <input
                    value={store.settings.whatsappNumber}
                    onChange={(e) => updateSettings('whatsappNumber', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-violet-500"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-5 flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-violet-700" />
                <h2 className="text-xl font-black text-slate-900">إدارة الأقسام</h2>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="أضف قسم جديد..."
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-violet-500"
                />
                <button
                  onClick={addCategory}
                  className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white"
                >
                  إضافة قسم
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {store.categories.map((category) => (
                  <div key={category.id} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                    <span>{category.name}</span>
                    <button onClick={() => deleteCategory(category.id)} className="text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-5 shadow-soft">
              <div className="mb-5 flex items-center gap-3">
                <ImagePlus className="h-5 w-5 text-violet-700" />
                <h2 className="text-xl font-black text-slate-900">إدارة المنتجات</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={productForm.name}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="اسم المنتج"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-violet-500"
                />
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-violet-500"
                >
                  {store.categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <input
                  value={productForm.price}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="السعر الأساسي"
                  type="number"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-violet-500"
                />
                <input
                  value={productForm.discountPrice}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, discountPrice: e.target.value }))}
                  placeholder="السعر بعد الخصم"
                  type="number"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-violet-500"
                />
                <input
                  value={productForm.image}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="رابط الصورة"
                  className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-violet-500"
                />
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف المنتج"
                  rows={3}
                  className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-violet-500"
                />
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, inStock: e.target.checked }))}
                  />
                  متوفر في المخزون
                </label>
              </div>

              <button
                onClick={addProduct}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                إضافة منتج
              </button>
            </section>
          </div>

          <section className="rounded-[28px] bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <LayoutDashboard className="h-5 w-5 text-violet-700" />
              <h2 className="text-xl font-black text-slate-900">جدول المنتجات</h2>
            </div>

            <div className="space-y-4">
              {store.products.map((product) => (
                <div key={product.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-3">
                  <div className="flex gap-3">
                    <img src={product.image} alt={product.name} className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-black text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.description}</p>
                        </div>
                        <button onClick={() => deleteProduct(product.id)} className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white px-2 py-1 text-slate-600">{product.price} ج</span>
                        <span className="rounded-full bg-white px-2 py-1 text-slate-600">{product.discountPrice ?? product.price} ج</span>
                        <button
                          onClick={() => updateProduct(product.id, 'hidden', !product.hidden)}
                          className={cx(
                            'rounded-full px-2 py-1 font-bold',
                            product.hidden ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          )}
                        >
                          {product.hidden ? 'مخفي' : 'ظاهر'}
                        </button>
                        <button
                          onClick={() => updateProduct(product.id, 'inStock', !product.inStock)}
                          className={cx(
                            'rounded-full px-2 py-1 font-bold',
                            product.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          )}
                        >
                          {product.inStock ? 'متوفر' : 'غير متوفر'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function WalletIcon() {
  return <WalletIconInner />;
}
function WalletIconInner() {
  return <span className="text-xl">💰</span>;
}
function ShoppingCartIcon() {
  return <span className="text-xl">🛒</span>;
}
function WarehouseIcon() {
  return <span className="text-xl">📦</span>;
}
function BarChart3Icon() {
  return <span className="text-xl">📈</span>;
}
