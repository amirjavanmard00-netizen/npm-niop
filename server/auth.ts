import type { Request, Response, NextFunction } from 'express';

type SupabaseUser = {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!supabaseUrl || !anonKey) {
    return res.status(503).json({ error: 'احراز هویت سامانه پیکربندی نشده است.' });
  }
  if (!token) {
    return res.status(401).json({ error: 'برای دسترسی، ابتدا وارد سامانه شوید.' });
  }

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      return res.status(401).json({ error: 'نشست ورود معتبر نیست یا منقضی شده است.' });
    }
    const user = await response.json() as SupabaseUser;
    if (!user?.id) return res.status(401).json({ error: 'کاربر معتبر شناسایی نشد.' });
    res.locals.authUser = user;
    next();
  } catch {
    return res.status(503).json({ error: 'امکان بررسی نشست ورود وجود ندارد.' });
  }
}

export function requireAdmin(_req: Request, res: Response, next: NextFunction) {
  const role = res.locals.authUser?.app_metadata?.role;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'این عملیات فقط برای مدیر سامانه مجاز است.' });
  }
  next();
}
