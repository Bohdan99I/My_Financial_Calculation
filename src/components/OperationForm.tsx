import { useEffect, useState } from 'react';
import type { Operation, OperationType } from '@/types';
import { INCOME_SOURCES, EXPENSE_CATEGORIES } from '@/lib/categories';
import { Modal } from './Modal';
import { formatDate } from '@/lib/store';

interface OperationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (op: Omit<Operation, 'id'>) => void;
  initial?: Operation | null;
  type: OperationType;
}

export function OperationForm({ open, onClose, onSubmit, initial, type }: OperationFormProps) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(formatDate(new Date().toISOString().slice(0, 10)).split('.').reverse().join('-'));
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const isIncome = type === 'income';
  const presets = isIncome ? INCOME_SOURCES : EXPENSE_CATEGORIES;
  const categoryLabel = isIncome ? 'Джерело доходу' : 'Категорія';

  useEffect(() => {
    if (open) {
      if (initial) {
        setAmount(String(initial.amount));
        setDate(initial.date);
        setCategory(initial.category);
        setCustomCategory(presets.includes(initial.category) ? '' : initial.category);
        setComment(initial.comment || '');
      } else {
        setAmount('');
        setDate(new Date().toISOString().slice(0, 10));
        setCategory('');
        setCustomCategory('');
        setComment('');
      }
      setError('');
    }
  }, [open, initial]); // eslint-disable-line react-hooks/exhaustive-deps

  const finalCategory = customCategory.trim() || category;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount.replace(',', '.'));
    if (!amt || amt <= 0) {
      setError('Введіть коректну суму');
      return;
    }
    if (!finalCategory) {
      setError(`Оберіть ${isIncome ? 'джерело' : 'категорію'}`);
      return;
    }
    onSubmit({ date, type, amount: amt, category: finalCategory, comment: comment.trim() || undefined });
  };

  const accent = isIncome ? 'emerald' : 'rose';
  const accentBg = isIncome ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700';
  const accentChip = isIncome ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-rose-100 text-rose-700 border-rose-300';
  const accentChipActive = isIncome ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600';

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Редагувати запис' : isIncome ? 'Додати дохід' : 'Додати витрату'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Сума</label>
          <input
            type="text"
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className={`w-full px-4 py-3 text-2xl font-bold text-center rounded-xl border-2 border-${accent}-200 focus:border-${accent}-500 focus:ring-2 focus:ring-${accent}-200 outline-none transition-all`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{categoryLabel}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => { setCategory(p); setCustomCategory(''); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  category === p && !customCategory ? accentChipActive : accentChip
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => { setCustomCategory(e.target.value); setCategory(''); }}
            placeholder="або введіть своє…"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Коментар <span className="text-gray-400 font-normal">(необов'язково)</span></label>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Наприклад: Богдан"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all"
          />
        </div>

        {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            Скасувати
          </button>
          <button
            type="submit"
            className={`flex-1 py-3 rounded-xl text-white font-semibold transition-colors ${accentBg}`}
          >
            Зберегти
          </button>
        </div>
      </form>
    </Modal>
  );
}
