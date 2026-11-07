import React, { useEffect, useState } from 'react';

type SessionUser = { id: string; email?: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const TOKEN_KEY = 'niopdc_access_token';

// Install the API bearer-token bridge at module load, before React mounts.
// This prevents the dashboard's first child useEffect requests from racing
// ahead of an effect-based fetch override in AuthGate.
if (typeof window !== 'undefined' && !(window as any).__niopdcFetchBridgeInstalled) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (url.startsWith('/api/')) {
      const headers = new Headers(init?.headers);
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      const response = await originalFetch(input, { ...init, headers });
      if (response.status === 401) window.dispatchEvent(new Event('niopdc-auth-expired'));
      return response;
    }
    return originalFetch(input, init);
  };
  (window as any).__niopdcFetchBridgeInstalled = true;
}

async function getUser(token: string): Promise<SessionUser | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  return response.json();
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onExpired = () => {
      sessionStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setError('نشست شما منقضی شده است؛ دوباره وارد شوید.');
    };
    window.addEventListener('niopdc-auth-expired', onExpired);

    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
    } else {
      getUser(token).then(current => {
        if (current) setUser(current);
        else sessionStorage.removeItem(TOKEN_KEY);
      }).catch(() => sessionStorage.removeItem(TOKEN_KEY)).finally(() => setLoading(false));
    }
    return () => window.removeEventListener('niopdc-auth-expired', onExpired);
  }, []);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('تنظیمات عمومی Supabase در محیط فرانت‌اند وارد نشده است.');
      }
      const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok || !data.access_token) {
        throw new Error(data.msg || data.message || 'ایمیل یا گذرواژه صحیح نیست.');
      }
      sessionStorage.setItem(TOKEN_KEY, data.access_token);
      const current = await getUser(data.access_token);
      if (!current) throw new Error('اعتبارسنجی حساب کاربری انجام نشد.');
      setUser(current);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ورود ناموفق بود.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setPassword('');
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center">در حال بررسی نشست کاربری…</div>;

  if (!user) return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center p-5">
      <form onSubmit={signIn} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <div className="text-amber-400 text-sm font-bold">NIOPDC • اتاق خبر دیجیتال</div>
          <h1 className="text-2xl font-black">ورود به سامانه مانیتورینگ</h1>
          <p className="text-sm text-slate-400">برای مشاهده داشبورد، با حساب کاربری سازمانی وارد شوید.</p>
        </div>
        {(!SUPABASE_URL || !SUPABASE_ANON_KEY) && <p className="rounded-lg bg-rose-950/60 p-3 text-sm text-rose-300">تنظیمات VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY در محیط انتشار تعریف نشده‌اند.</p>}
        <label className="block text-sm space-y-2">ایمیل
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-left" dir="ltr" autoComplete="username" />
        </label>
        <label className="block text-sm space-y-2">گذرواژه
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-left" dir="ltr" autoComplete="current-password" />
        </label>
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <button disabled={busy || !SUPABASE_URL || !SUPABASE_ANON_KEY} className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black p-3">
          {busy ? 'در حال ورود…' : 'ورود امن'}
        </button>
      </form>
    </div>
  );

  return <>{children}<div className="fixed bottom-3 left-3 z-50 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs text-slate-300 shadow-lg"><span>{user.email}</span><button onClick={signOut} className="text-amber-400 hover:text-amber-300 font-bold">خروج</button></div></>;
}
