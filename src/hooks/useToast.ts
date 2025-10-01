import { useState, useCallback } from "react";
import { ToastData } from "@/components/ui/toast";

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback(
    ({
      title,
      description,
      type = "info",
      duration = 5000,
    }: Omit<ToastData, "id">) => {
      const id = (++toastCount).toString();

      const newToast: ToastData = {
        id,
        title,
        description,
        type,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, description?: string) =>
      toast({ title, description, type: "success" }),
    [toast]
  );

  const error = useCallback(
    (title: string, description?: string) =>
      toast({ title, description, type: "error" }),
    [toast]
  );

  const info = useCallback(
    (title: string, description?: string) =>
      toast({ title, description, type: "info" }),
    [toast]
  );

  return {
    toasts,
    toast,
    success,
    error,
    info,
    removeToast,
  };
}
