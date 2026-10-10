import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthLabel } from '@/lib/store';

interface MonthNavProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNav({ year, month, onPrev, onNext }: MonthNavProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-2.5">
      <button
        onClick={onPrev}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="font-bold text-gray-900 text-sm">{getMonthLabel(year, month)}</span>
      <button
        onClick={onNext}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
