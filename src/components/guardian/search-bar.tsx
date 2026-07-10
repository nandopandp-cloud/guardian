"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="group relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        placeholder="Pesquisar por nome, email, ID, escola ou turma…"
        className="h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-11 text-sm text-foreground shadow-soft transition-all placeholder:text-muted-foreground focus:border-ring/60 focus:outline-none focus:ring-4 focus:ring-ring/10"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
