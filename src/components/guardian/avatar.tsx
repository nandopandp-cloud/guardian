import { cn } from "@/lib/utils";

interface AvatarProps {
  src: string;
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, name, size = 40, className }: AvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-elevated text-xs font-medium text-muted-foreground",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span className="absolute">{initials}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        className="relative h-full w-full object-cover"
      />
    </span>
  );
}
