"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex size-9 items-center justify-center rounded-full border border-border bg-elevated text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        aria-label="Menu do usuário"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-medium text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            onClick={signOut}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
            )}
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
