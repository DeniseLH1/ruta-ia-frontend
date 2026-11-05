import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, X } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !loading) onCancel();
        }}
      >
        <motion.section
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-message"
          className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40"
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className={`h-1 w-full ${variant === 'danger' ? 'bg-gradient-to-r from-rose-500 to-orange-400' : 'bg-gradient-to-r from-cyan-400 to-violet-500'}`} />
          <div className="p-6 sm:p-7">
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${
              variant === 'danger' ? 'bg-rose-400/10 text-rose-300' : 'bg-cyan-400/10 text-cyan-200'
            }`}>
              {variant === 'danger' ? <AlertTriangle className="h-6 w-6" /> : <Check className="h-6 w-6" />}
            </div>
            <h2 id="confirm-dialog-title" className="text-xl font-semibold tracking-tight text-white">{title}</h2>
            <p id="confirm-dialog-message" className="mt-2 text-sm leading-6 text-slate-400">{message}</p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={onCancel}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50"
              >
                <X className="h-4 w-4" /> {cancelLabel}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition disabled:cursor-wait disabled:opacity-60 ${
                  variant === 'danger'
                    ? 'bg-gradient-to-r from-rose-600 to-orange-500 shadow-rose-950/30 hover:brightness-110'
                    : 'bg-gradient-to-r from-cyan-600 to-violet-600 shadow-cyan-950/30 hover:brightness-110'
                }`}
              >
                {loading ? 'Un momento...' : confirmLabel}
              </button>
            </div>
          </div>
        </motion.section>
      </motion.div>
    )}
  </AnimatePresence>
);
