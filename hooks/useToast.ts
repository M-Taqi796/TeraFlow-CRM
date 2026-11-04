'use client';

import { useState, useCallback } from 'react';
import type { ToastData, ToastType } from '@/components/ui/Toast';

let _toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = `toast-${++_toastId}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg: string, duration?: number) => toast(msg, 'success', duration), [toast]);
  const error   = useCallback((msg: string, duration?: number) => toast(msg, 'error',   duration), [toast]);
  const info    = useCallback((msg: string, duration?: number) => toast(msg, 'info',    duration), [toast]);
  const warning = useCallback((msg: string, duration?: number) => toast(msg, 'warning', duration), [toast]);

  return { toasts, dismiss, toast, success, error, info, warning };
}
