import { useState } from 'react';
import type { AppSettings } from '@/types';
import { Modal } from './Modal';
import { Settings, Upload, Download } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onImport: (file: File) => void;
  onExport: () => void;
}

export function SettingsModal({ open, onClose, settings, onSave, onImport, onExport }: SettingsModalProps) {
  const [useInitial, setUseInitial] = useState(settings.use_initial_balance);
  const [initialBalance, setInitialBalance] = useState(String(settings.initial_balance));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({
      use_initial_balance: useInitial,
      initial_balance: parseFloat(initialBalance.replace(',', '.')) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Налаштування">
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Початковий баланс</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useInitial}
              onChange={(e) => setUseInitial(e.target.checked)}
              className="w-5 h-5 rounded accent-gray-900"
            />
            <span className="text-sm text-gray-700">Враховувати початковий баланс</span>
          </label>
          {useInitial && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Сума початкового балансу</label>
              <input
                type="text"
                inputMode="decimal"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all"
              />
            </div>
          )}
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            {saved ? 'Збережено!' : 'Зберегти налаштування'}
          </button>
        </div>

        <div className="border-t border-gray-100 pt-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Імпорт та експорт Excel</h3>
          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
            <Upload size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700 flex-1">Імпорт з Excel</span>
            <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
          </label>
          <button
            onClick={onExport}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Download size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Експорт в Excel</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
