"use client";

interface StepRoleProps {
  currentRole: string;
  currentSector: string;
  experienceYears: number | null;
  onFieldChange: (field: string, value: string | number | null) => void;
}

export function StepRole({
  currentRole,
  currentSector,
  experienceYears,
  onFieldChange,
}: StepRoleProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Rôle actuel
        </label>
        <input
          type="text"
          value={currentRole}
          onChange={(e) => onFieldChange("currentRole", e.target.value)}
          placeholder="Ex: Chef de projet IT, Business Analyst, Comptable..."
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Secteur d&apos;activité
        </label>
        <input
          type="text"
          value={currentSector}
          onChange={(e) => onFieldChange("currentSector", e.target.value)}
          placeholder="Ex: Banque, Assurance, Santé, Marketing, RH..."
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Années d&apos;expérience
        </label>
        <input
          type="number"
          value={experienceYears ?? ""}
          onChange={(e) =>
            onFieldChange(
              "experienceYears",
              e.target.value ? parseInt(e.target.value, 10) : null
            )
          }
          placeholder="8"
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>
    </div>
  );
}
