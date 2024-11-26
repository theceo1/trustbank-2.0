'use client';

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { useToast } from "@/hooks/use-toast";

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning';
}
export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastPrimitives.Provider>
      {toasts?.map(({ id, title, description, action, ...props }: ToastProps) => (
        <ToastPrimitives.Root key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastPrimitives.Title>{title}</ToastPrimitives.Title>}
            {description && (
              <ToastPrimitives.Description>{description}</ToastPrimitives.Description>
            )}
          </div>
          {action}
          <ToastPrimitives.Close />
        </ToastPrimitives.Root>
      ))}
      <ToastPrimitives.Viewport />
    </ToastPrimitives.Provider>
  );
}
