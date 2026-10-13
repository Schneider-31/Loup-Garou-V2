import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { X, Plus, Sparkles } from 'lucide-react';
import type { RoleConfigEntry } from '@/types';

interface CustomRoleBuilderProps {
  onAdd: (role: RoleConfigEntry) => void;
  onClose: () => void;
}

export function CustomRoleBuilder({ onAdd, onClose }: CustomRoleBuilderProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({
      roleKey: `custom_${Date.now()}`,
      quantity,
      customTitle: title.trim(),
      customDescription: description.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-mystery-950/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-gold-700/30 bg-gradient-to-b from-mystery-800 to-mystery-900 p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <h2 className="font-display text-base font-semibold text-gold-200">
              {t('customRoleBuilder')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-mystery-600/60 bg-mystery-800/50 flex items-center justify-center text-ash-400 transition-all hover:text-ash-200 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ash-300 mb-2">
              {t('customRoleTitle')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('customRoleTitlePlaceholder')}
              maxLength={30}
              autoFocus
              className="w-full rounded-xl border border-mystery-600/60 bg-mystery-800/50 px-4 py-3 text-sm text-ash-100 placeholder-ash-500 outline-none transition-all focus:border-gold-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ash-300 mb-2">
              {t('customRoleDescription')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('customRoleDescriptionPlaceholder')}
              maxLength={120}
              rows={3}
              className="w-full rounded-xl border border-mystery-600/60 bg-mystery-800/50 px-4 py-3 text-sm text-ash-100 placeholder-ash-500 outline-none transition-all focus:border-gold-500/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ash-300 mb-2">
              {t('customRoleQuantity')}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-mystery-600/60 bg-mystery-800/50 text-ash-200 text-lg transition-all hover:border-gold-500/40 active:scale-95"
              >
                −
              </button>
              <span className="flex-1 text-center text-lg font-semibold text-gold-200">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(20, quantity + 1))}
                className="w-10 h-10 rounded-lg border border-mystery-600/60 bg-mystery-800/50 text-ash-200 text-lg transition-all hover:border-gold-500/40 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-mystery-600/60 bg-mystery-800/50 px-4 py-3 text-sm font-medium text-ash-300 transition-all hover:text-ash-100 active:scale-[0.98]"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleAdd}
              disabled={!title.trim()}
              className="flex-1 rounded-xl border border-gold-600/40 bg-gradient-to-r from-gold-800 to-gold-700 px-4 py-3 text-sm font-semibold text-gold-100 transition-all hover:glow-gold active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('addRole')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
