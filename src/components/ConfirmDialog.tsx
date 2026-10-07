import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

export function ConfirmDialog({ open, onClose, onConfirm, message }: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    onConfirm();
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Підтвердження" maxWidth="max-w-sm">
      <div className="text-center py-2">
        <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-rose-600" />
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
          >
            Видалити
          </button>
        </div>
      </div>
    </Modal>
  );
}
