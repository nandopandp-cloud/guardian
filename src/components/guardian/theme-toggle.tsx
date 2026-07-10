"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { key: "light", icon: Sun, label: "Claro" },
  { key: "dark", icon: Moon, label: "Escuro" },
  { key: "system", icon: Monitor, label: "Sistema" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Segmented control — avoid rendering active state until mounted (SSR-safe).
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border bg-elevated p-0.5">
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = mounted && theme === o.key;
        return (
          <button
            key={o.key}
            onClick={() => setTheme(o.key)}
            aria-label={`Tema ${o.label}`}
            title={o.label}
            className={cn(
              "flex size-7 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
