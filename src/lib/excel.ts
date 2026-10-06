import * as XLSX from 'xlsx';
import type { Operation } from '@/types';
import { formatDate } from '@/lib/store';

export function exportToExcel(operations: Operation[]): void {
  const rows = operations.map((op) => ({
    'Дата': formatDate(op.date),
    'Тип': op.type === 'income' ? 'Дохід' : 'Витрата',
    'Сума': op.amount,
    'Категорія / Джерело': op.category,
    'Коментар': op.comment || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 22 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Операції');
  XLSX.writeFile(wb, `oblik_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function importFromExcel(file: File): Promise<Omit<Operation, 'id'>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

  return rows
    .map((row): Omit<Operation, 'id'> | null => {
      const typeRaw = String(row['Тип'] || row['type'] || '').toLowerCase().trim();
      const type = typeRaw.includes('доход') || typeRaw === 'income' ? 'income'
        : typeRaw.includes('витрат') || typeRaw === 'expense' ? 'expense'
        : null;
      if (!type) return null;

      const amount = Number(row['Сума'] || row['amount'] || 0);
      if (!amount || amount <= 0) return null;

      const category = String(row['Категорія / Джерело'] || row['Категорія'] || row['Джерело'] || row['category'] || 'Інше').trim();

      let dateStr = String(row['Дата'] || row['date'] || '').trim();
      if (dateStr.includes('.')) {
        const [d, mo, y] = dateStr.split('.');
        dateStr = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      if (!dateStr) dateStr = new Date().toISOString().slice(0, 10);

      const comment = row['Коментар'] || row['comment'] || '';
      return { date: dateStr, type: type as Operation['type'], amount, category, comment: String(comment).trim() || undefined };
    })
    .filter((r): r is Omit<Operation, 'id'> => r !== null);
}
