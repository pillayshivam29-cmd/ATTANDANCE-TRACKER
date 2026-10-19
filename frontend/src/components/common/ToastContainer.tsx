import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useAttendance();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info size={18} className="text-zinc-950" />;
        if (toast.type === 'success') {
          icon = <CheckCircle2 size={18} className="text-zinc-950" />;
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle size={18} className="text-zinc-950" />;
        } else if (toast.type === 'error') {
          icon = <XCircle size={18} className="text-zinc-950" />;
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white border border-zinc-200 rounded-xl shadow-lg shadow-zinc-950/5 animate-in slide-in-from-bottom-3 duration-200"
          >
            <div className="p-1 rounded-md bg-zinc-100 shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-zinc-950 tracking-tight">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 text-zinc-400 hover:text-zinc-950 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
