import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import type { OperationType, PeriodType } from '@/types';
import { INCOME_SOURCES, EXPENSE_CATEGORIES } from '@/lib/categories';

interface FiltersProps {
  period: PeriodType;
  setPeriod: (p: PeriodType) => void;
  customStart: string;
  customEnd: string;
  setCustomStart: (d: string) => void;
  setCustomEnd: (d: string) => void;
  typeFilter: OperationType | 'all';
  setTypeFilter: (t: OperationType | 'all') => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  search: string;
  setSearch: (s: string) => void;
}

const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: 'today', label: 'Сьогодні' },
  { value: 'week', label: 'Цей тиждень' },
  { value: 'month', label: 'Цей місяць' },
  { value: 'lastMonth', label: 'Минулий місяць' },
  { value: 'year', label: 'Цей рік' },
  { value: 'custom', label: 'Довільний' },
];

export function Filters({
  period, setPeriod, customStart, customEnd, setCustomStart, setCustomEnd,
  typeFilter, setTypeFilter, categoryFilter, setCategoryFilter, search, setSearch,
}: FiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const allCategories = [...INCOME_SOURCES, ...EXPENSE_CATEGORIES];
  const categories = typeFilter === 'income' ? INCOME_SOURCES
    : typeFilter === 'expense' ? EXPENSE_CATEGORIES
    : allCategories;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700"
      >
        <span>Фільтри та пошук</span>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          <div>
            <div className="flex flex-wrap gap-1.5">
              {PERIOD_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setPeriod(o.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    period === o.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {period === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-gray-400"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-gray-400"
              />
            </div>
          )}

          <div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    typeFilter === t
                      ? t === 'income' ? 'bg-emerald-600 text-white'
                        : t === 'expense' ? 'bg-rose-600 text-white'
                        : 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t === 'all' ? 'Усі' : t === 'income' ? 'Доходи' : 'Витрати'}
                </button>
              ))}
            </div>
          </div>

          {typeFilter !== 'income' && typeFilter !== 'expense' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-gray-400"
            >
              <option value="">Усі категорії та джерела</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {typeFilter !== 'all' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-gray-400"
            >
              <option value="">{typeFilter === 'income' ? 'Усі джерела' : 'Усі категорії'}</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук по коментарю…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-gray-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
