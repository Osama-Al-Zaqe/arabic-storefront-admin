'use client';

import { useEffect, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

const ADMIN_PASSWORD = 'admin123';
const ADMIN_AUTH_KEY = 'arabic-store-admin-auth-v1';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_AUTH_KEY);
    if (stored === 'true') setIsAuthenticated(true);
  }, []);

  const submit = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
      return;
    }

    setError('كلمة المرور غير صحيحة');
  };

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-soft">
        <div className="mb-5 flex items-center justify-center gap-3">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-700">منطقة الإدارة</p>
            <h1 className="text-2xl font-black text-slate-900">تسجيل الدخول</h1>
          </div>
        </div>

        <label className="block space-y-2 text-sm font-medium text-slate-600">
          <span>كلمة المرور</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder="أدخل كلمة المرور"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-violet-500"
          />
        </label>

        {error && <p className="mt-3 text-sm font-bold text-red-600">{error}</p>}

        <button
          onClick={submit}
          className="mt-5 w-full rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white"
        >
          دخول
        </button>

        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          كلمة المرور الافتراضية: admin123
        </div>
      </div>
    </div>
  );
}
