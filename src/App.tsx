import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Minus, Settings as SettingsIcon, Wallet } from 'lucide-react';
import type { AppSettings, Operation, OperationType, PeriodType } from '@/types';
import {
  balanceFor, fetchOperations, fetchSettings, formatAmount,
  getMonthLabel, getPeriodRange, insertOperation, deleteOperation as dbDelete,
  saveSettings, sumByType, updateOperation,
} from '@/lib/store';
import { exportToExcel, importFromExcel } from '@/lib/excel';
import { OperationForm } from '@/components/OperationForm';
import { OperationList } from '@/components/OperationList';
import { Filters } from '@/components/Filters';
import { Statistics } from '@/components/Statistics';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SettingsModal } from '@/components/SettingsModal';
import { MonthNav } from '@/components/MonthNav';

type View = 'dashboard' | 'monthly';

export default function App() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ initial_balance: 0, use_initial_balance: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<OperationType>('expense');
  const [editingOp, setEditingOp] = useState<Operation | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Operation | null>(null);

  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Filters
  const [period, setPeriod] = useState<PeriodType>('month');
  const [customStart, setCustomStart] = useState(new Date().toISOString().slice(0, 10));
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().slice(0, 10));
  const [typeFilter, setTypeFilter] = useState<OperationType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  // Month navigation
  const now = new Date();
  const [view, setView] = useState<View>('dashboard');
  const [monthYear, setMonthYear] = useState(now.getFullYear());
  const [monthMonth, setMonthMonth] = useState(now.getMonth());

  // Load data
  useEffect(() => {
    (async () => {
      try {
        const [ops, s] = await Promise.all([fetchOperations(), fetchSettings()]);
        setOperations(ops);
        setSettings(s);
      } catch (e) {
        setError(`Помилка завантаження: ${(e as Error).message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Form handlers
  const openAdd = (type: OperationType) => {
    setFormType(type);
    setEditingOp(null);
    setFormOpen(true);
  };

  const openEdit = (op: Operation) => {
    setEditingOp(op);
    setFormType(op.type);
    setFormOpen(true);
  };

  const handleSubmit = async (data: Omit<Operation, 'id'>) => {
    try {
      if (editingOp) {
        await updateOperation({ ...data, id: editingOp.id });
        setOperations((prev) => prev.map((o) => (o.id === editingOp.id ? { ...data, id: editingOp.id } : o)));
      } else {
        const created = await insertOperation(data);
        setOperations((prev) => [created, ...prev]);
      }
      setFormOpen(false);
      setEditingOp(null);
    } catch (e) {
      setError(`Помилка збереження: ${(e as Error).message}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dbDelete(deleteTarget.id);
      setOperations((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(`Помилка видалення: ${(e as Error).message}`);
    }
  };

  const handleSaveSettings = (s: AppSettings) => {
    setSettings(s);
    saveSettings(s).catch((e) => setError(`Помилка збереження налаштувань: ${(e as Error).message}`));
  };

  const handleImport = async (file: File) => {
    try {
      const imported = await importFromExcel(file);
      for (const op of imported) {
        const created = await insertOperation(op);
        setOperations((prev) => [created, ...prev]);
      }
      setSettingsOpen(false);
    } catch (e) {
      setError(`Помилка імпорту: ${(e as Error).message}`);
    }
  };

  const handleExport = () => {
    exportToExcel(operations);
    setSettingsOpen(false);
  };

  // Month navigation
  const prevMonth = () => {
    if (monthMonth === 0) { setMonthMonth(11); setMonthYear(monthYear - 1); }
    else setMonthMonth(monthMonth - 1);
  };
  const nextMonth = () => {
    if (monthMonth === 11) { setMonthMonth(0); setMonthYear(monthYear + 1); }
    else setMonthMonth(monthMonth + 1);
  };

  // Derived: period range
  const range = useMemo(
    () => getPeriodRange(period, customStart, customEnd),
    [period, customStart, customEnd]
  );

  // Derived: filtered operations for dashboard
  const dashboardOps = useMemo(() => {
    let ops = operations.filter((o) => o.date >= range.start && o.date <= range.end);
    if (typeFilter !== 'all') ops = ops.filter((o) => o.type === typeFilter);
    if (categoryFilter) ops = ops.filter((o) => o.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      ops = ops.filter((o) =>
        o.category.toLowerCase().includes(q) ||
        (o.comment && o.comment.toLowerCase().includes(q))
      );
    }
    return ops;
  }, [operations, range, typeFilter, categoryFilter, search]);

  // Derived: month operations (for monthly view)
  const monthOps = useMemo(() => {
    const start = new Date(monthYear, monthMonth, 1).toISOString().slice(0, 10);
    const end = new Date(monthYear, monthMonth + 1, 0).toISOString().slice(0, 10);
    return operations.filter((o) => o.date >= start && o.date <= end);
  }, [operations, monthYear, monthMonth]);

  // Totals for dashboard (unfiltered by type/category for summary cards)
  const periodOpsForTotals = useMemo(() => {
    return operations.filter((o) => o.date >= range.start && o.date <= range.end);
  }, [operations, range]);

  const totalIncome = sumByType(periodOpsForTotals, 'income');
  const totalExpense = sumByType(periodOpsForTotals, 'expense');
  const periodBalance = totalIncome - totalExpense;

  // Cumulative balance (all operations + initial)
  const cumulativeBalance = useMemo(() => {
    const allBalance = balanceFor(operations);
    return settings.use_initial_balance ? settings.initial_balance + allBalance : allBalance;
  }, [operations, settings]);

  // Month totals
  const monthIncome = sumByType(monthOps, 'income');
  const monthExpense = sumByType(monthOps, 'expense');
  const monthBalance = monthIncome - monthExpense;

  const monthLabel = getMonthLabel(monthYear, monthMonth);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Завантаження…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-5 pb-20">
        {/* Header */}
        <header className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">МійОблік</h1>
              <p className="text-xs text-gray-400">Особистий облік доходів і витрат</p>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <SettingsIcon size={20} />
          </button>
        </header>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
            {error}
            <button onClick={() => setError('')} className="ml-2 font-semibold underline">закрити</button>
          </div>
        )}

        {/* View toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setView('dashboard')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              view === 'dashboard' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('monthly')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              view === 'monthly' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            По місяцях
          </button>
        </div>

        {view === 'dashboard' ? (
          <>
            {/* Balance card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Поточний накопичений баланс</p>
              <p className="text-3xl font-bold text-white">
                {formatAmount(cumulativeBalance)} <span className="text-lg text-gray-400">грн</span>
              </p>
              {settings.use_initial_balance && (
                <p className="text-xs text-gray-500 mt-1">
                  враховано початковий баланс: {formatAmount(settings.initial_balance)} грн
                </p>
              )}
            </div>

            {/* Income & Expense cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">Доходи</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatAmount(totalIncome)} <span className="text-sm text-gray-400">грн</span>
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">Витрати</p>
                <p className="text-xl font-bold text-rose-600">
                  {formatAmount(totalExpense)} <span className="text-sm text-gray-400">грн</span>
                </p>
              </div>
            </div>

            {/* Balance for period */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Залишок за період</span>
              <span className={`text-lg font-bold ${periodBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {periodBalance >= 0 ? '+' : ''}{formatAmount(periodBalance)} грн
              </span>
            </div>

            {/* Add buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => openAdd('income')}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
              >
                <Plus size={20} />
                Додати дохід
              </button>
              <button
                onClick={() => openAdd('expense')}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-700 active:scale-95 transition-all shadow-sm"
              >
                <Minus size={20} />
                Додати витрату
              </button>
            </div>

            {/* Filters */}
            <div className="mb-4">
              <Filters
                period={period}
                setPeriod={setPeriod}
                customStart={customStart}
                customEnd={customEnd}
                setCustomStart={setCustomStart}
                setCustomEnd={setCustomEnd}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                search={search}
                setSearch={setSearch}
              />
            </div>

            {/* Operation history */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">Історія операцій</h2>
              <OperationList operations={dashboardOps} onEdit={openEdit} onDelete={setDeleteTarget} />
            </div>

            {/* Statistics */}
            <Statistics operations={periodOpsForTotals} monthLabel={getMonthLabel(new Date(range.start).getFullYear(), new Date(range.start).getMonth())} />
          </>
        ) : (
          <>
            {/* Monthly view */}
            <div className="mb-4">
              <MonthNav year={monthYear} month={monthMonth} onPrev={prevMonth} onNext={nextMonth} />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-xs text-gray-400 mb-0.5">Доходи</p>
                <p className="text-sm font-bold text-emerald-600">{formatAmount(monthIncome)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-xs text-gray-400 mb-0.5">Витрати</p>
                <p className="text-sm font-bold text-rose-600">{formatAmount(monthExpense)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-xs text-gray-400 mb-0.5">Залишок</p>
                <p className={`text-sm font-bold ${monthBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatAmount(monthBalance)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">Операції за {monthLabel.toLowerCase()}</h2>
              <OperationList operations={monthOps} onEdit={openEdit} onDelete={setDeleteTarget} />
            </div>

            <Statistics operations={monthOps} monthLabel={monthLabel} />
          </>
        )}
      </div>

      {/* Modals */}
      <OperationForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingOp(null); }}
        onSubmit={handleSubmit}
        initial={editingOp}
        type={formType}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message="Ви впевнені, що хочете видалити цей запис?"
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onImport={handleImport}
        onExport={handleExport}
      />
    </div>
  );
}
