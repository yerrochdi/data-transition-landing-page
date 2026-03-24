"use client";

interface MiniKpiProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
}

export function MiniKpi({ label, value, icon: Icon, color = "hsl(var(--primary))" }: MiniKpiProps) {
  return (
    <div className="flex items-center gap-3 bg-surface-container-lowest/50 backdrop-blur-sm rounded-xl p-4 ghost-border hover:scale-[1.02] transition-transform">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-headline font-extrabold text-foreground tabular-nums">{value}</p>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
