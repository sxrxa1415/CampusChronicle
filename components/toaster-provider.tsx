"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

export function ToasterProvider() {
  const [mounted, setMounted] = useState(false);
  const { theme = "system" } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Sonner
      richColors
      closeButton
      position="top-right"
      theme={theme as any}
      className="toaster group"
      toastOptions={{
        className: "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:font-sans",
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
      }}
    />
  );
}
