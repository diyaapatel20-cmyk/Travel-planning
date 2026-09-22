import React from 'react';
import { Send, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface ConfirmSendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  spaceName: string;
  messageText: string;
  isSending?: boolean;
}

export const ConfirmSendMessageModal: React.FC<ConfirmSendMessageModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  spaceName,
  messageText,
  isSending
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <span>Confirm Google Chat Message</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              You are about to post a new message to the Google Chat space{' '}
              <span className="font-bold underline">{spaceName}</span> using your Google account.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Message Preview
            </label>
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs text-stone-800 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {messageText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 hover:bg-stone-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSending}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Sending to Space...' : 'Confirm & Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
