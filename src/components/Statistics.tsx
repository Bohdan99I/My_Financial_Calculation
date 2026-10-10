import { useMemo } from 'react';
import type { Operation } from '@/types';
import { formatAmount } from '@/lib/store';
import { PieChart, TrendingDown } from 'lucide-react';

interface StatisticsProps {
  operations: Operation[];
  monthLabel: string;
}

const PALETTE = [
  '#0f766e', '#0891b2', '#2563eb', '#7c3aed', '#c026d3',
  '#db2777', '#dc2626', '#ea580c', '#d97706', '#65a30d',
  '#16a34a', '#0d9488', '#6366f1', '#9333ea', '#e11d48',
];

export function Statistics({ operations, monthLabel }: StatisticsProps) {
  const expenseOps = useMemo(
    () => operations.filter((o) => o.type === 'expense'),
    [operations]
  );

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const op of expenseOps) {
      map.set(op.category, (map.get(op.category) || 0) + op.amount);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [expenseOps]);

  const totalExpenses = categoryTotals.reduce((s, [, v]) => s + v, 0);

  if (expenseOps.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-2">Статистика витрат</h3>
        <p className="text-sm text-gray-400">Немає витрат за цей період</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <PieChart size={18} className="text-gray-700" />
          <h3 className="text-base font-bold text-gray-900">Витрати за {monthLabel.toLowerCase()}</h3>
        </div>

        {/* Donut chart */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <DonutChart data={categoryTotals} total={totalExpenses} />

          <div className="flex-1 w-full space-y-2">
            {categoryTotals.map(([cat, val], i) => {
              const pct = totalExpenses > 0 ? (val / totalExpenses) * 100 : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                  />
                  <span className="text-sm text-gray-600 flex-1 truncate">{cat}</span>
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {formatAmount(val)} грн
                  </span>
                  <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top expenses */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown size={18} className="text-gray-700" />
          <h3 className="text-base font-bold text-gray-900">Найбільші витрати місяця</h3>
        </div>
        <div className="space-y-2.5">
          {categoryTotals.slice(0, 5).map(([cat, val], i) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-gray-700 flex-1 truncate">{cat}</span>
              <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                {formatAmount(val)} грн
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DonutChart({ data, total }: { data: [string, number][]; total: number }) {
  const size = 140;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = data.map(([cat, val], i) => {
    const fraction = total > 0 ? val / total : 0;
    const dash = fraction * circumference;
    const seg = {
      color: PALETTE[i % PALETTE.length],
      dash,
      gap: circumference - dash,
      offset: -offset,
      key: cat,
    };
    offset += dash;
    return seg;
  });

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={stroke}
        />
        {segments.map((s) => (
          <circle
            key={s.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.offset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-gray-400">Всього</span>
        <span className="text-base font-bold text-gray-900">{formatAmount(total)}</span>
        <span className="text-xs text-gray-400">грн</span>
      </div>
    </div>
  );
}
