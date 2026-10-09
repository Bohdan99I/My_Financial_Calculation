import type { Operation } from '@/types';
import { formatAmount, formatDate } from '@/lib/store';
import { Pencil, Trash2 } from 'lucide-react';

interface OperationListProps {
  operations: Operation[];
  onEdit: (op: Operation) => void;
  onDelete: (op: Operation) => void;
}

export function OperationList({ operations, onEdit, onDelete }: OperationListProps) {
  if (operations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">Немає операцій за цей період</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {operations.map((op) => {
        const isIncome = op.type === 'income';
        return (
          <div
            key={op.id}
            className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}
            >
              {isIncome ? '+' : '−'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">{op.category}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{formatDate(op.date)}</span>
                {op.comment && <span className="truncate">· {op.comment}</span>}
              </div>
            </div>

            <div className={`font-bold text-sm whitespace-nowrap ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isIncome ? '+' : '−'}{formatAmount(op.amount)} грн
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(op)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => onDelete(op)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
