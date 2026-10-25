import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 pointer-events-auto transition-all duration-300 animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-[#0B1B30]/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/20'
              : toast.type === 'warning'
              ? 'bg-[#0B1B30]/95 border-rose-500/40 text-rose-300 shadow-rose-950/20'
              : 'bg-[#0B1B30]/95 border-blue-500/40 text-blue-300 shadow-blue-950/20'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#34D399]" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[#FB7185]" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#3B82F6]" />}
          </div>

          <div className="flex-1 text-xs font-medium text-[#EAF2FF]">
            {toast.message}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-[#91A6C4] hover:text-[#EAF2FF] p-0.5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
