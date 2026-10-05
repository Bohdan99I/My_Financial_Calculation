import type { Operation, AppSettings, PeriodType, PeriodRange } from '@/types';
import { supabase } from '@/supabaseClient';

// ─── Period helpers ──────────────────────────────────────────────

export function getPeriodRange(period: PeriodType, customStart?: string, customEnd?: string): PeriodRange {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();

  const iso = (d: Date) => {
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 10);
  };

  switch (period) {
    case 'today':
      return { start: iso(today), end: iso(today) };
    case 'week': {
      const day = today.getDay() || 7; // Monday = 1
      const monday = new Date(today);
      monday.setDate(today.getDate() - day + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: iso(monday), end: iso(sunday) };
    }
    case 'month': {
      const first = new Date(y, m, 1);
      const last = new Date(y, m + 1, 0);
      return { start: iso(first), end: iso(last) };
    }
    case 'lastMonth': {
      const first = new Date(y, m - 1, 1);
      const last = new Date(y, m, 0);
      return { start: iso(first), end: iso(last) };
    }
    case 'year': {
      const first = new Date(y, 0, 1);
      const last = new Date(y, 11, 31);
      return { start: iso(first), end: iso(last) };
    }
    case 'custom':
      return { start: customStart || iso(today), end: customEnd || iso(today) };
  }
}

export function getMonthLabel(year: number, month: number): string {
  const names = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
  ];
  return `${names[month]} ${year}`;
}

// ─── Formatting ──────────────────────────────────────────────────

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string): string {
  const [y, mo, d] = iso.split('-');
  return `${d}.${mo}.${y}`;
}

// ─── DB: Operations ──────────────────────────────────────────────

export async function fetchOperations(): Promise<Operation[]> {
  const { data, error } = await supabase
    .from('operations')
    .select('id, date, type, amount, category, comment')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    date: r.date as string,
    type: r.type as Operation['type'],
    amount: Number(r.amount),
    category: r.category as string,
    comment: (r.comment as string) || undefined,
  }));
}

export async function insertOperation(op: Omit<Operation, 'id'>): Promise<Operation> {
  const { data, error } = await supabase
    .from('operations')
    .insert({ date: op.date, type: op.type, amount: op.amount, category: op.category, comment: op.comment || null })
    .select('id, date, type, amount, category, comment')
    .single();

  if (error) throw error;
  return {
    id: data.id,
    date: data.date,
    type: data.type,
    amount: Number(data.amount),
    category: data.category,
    comment: data.comment || undefined,
  };
}

export async function updateOperation(op: Operation): Promise<void> {
  const { error } = await supabase
    .from('operations')
    .update({ date: op.date, type: op.type, amount: op.amount, category: op.category, comment: op.comment || null })
    .eq('id', op.id);
  if (error) throw error;
}

export async function deleteOperation(id: string): Promise<void> {
  const { error } = await supabase.from('operations').delete().eq('id', id);
  if (error) throw error;
}

// ─── DB: Settings ────────────────────────────────────────────────

export async function fetchSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('initial_balance, use_initial_balance')
    .eq('id', 1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { initial_balance: 0, use_initial_balance: false };
  return { initial_balance: Number(data.initial_balance), use_initial_balance: data.use_initial_balance };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ id: 1, initial_balance: settings.initial_balance, use_initial_balance: settings.use_initial_balance, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ─── Calculations ────────────────────────────────────────────────

export function sumByType(ops: Operation[], type: Operation['type']): number {
  return ops.filter((o) => o.type === type).reduce((s, o) => s + o.amount, 0);
}

export function balanceFor(ops: Operation[]): number {
  return sumByType(ops, 'income') - sumByType(ops, 'expense');
}
