"use client";

import {
  GraduationCap,
  Award,
  Heart,
  MapPin,
  Monitor,
  Briefcase,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileSnapshotProps {
  educationLevel: string | null;
  certifications: string[];
  hasDataTraining: boolean;
  motivation: string | null;
  situation: string | null;
  location: string | null;
  remotePreference: string | null;
  experienceYears: number | null;
  currentSector: string | null;
}

const MOTIVATION_LABELS: Record<string, { label: string; color: string }> = {
  attracted: { label: "Attiré par la data/IA", color: "text-emerald-400 bg-emerald-500/10" },
  fleeing: { label: "Besoin de changement", color: "text-amber-400 bg-amber-500/10" },
  both: { label: "Changement + Passion data", color: "text-primary bg-primary/10" },
};

const REMOTE_LABELS: Record<string, string> = {
  remote: "Full remote",
  hybrid: "Hybride",
  onsite: "Présentiel",
  flexible: "Flexible",
};

export function ProfileSnapshot({
  educationLevel,
  certifications,
  hasDataTraining,
  motivation,
  situation,
  location,
  remotePreference,
  experienceYears,
  currentSector,
}: ProfileSnapshotProps) {
  const motivationInfo = motivation ? MOTIVATION_LABELS[motivation] : null;

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
      <h3 className="font-headline text-sm font-bold text-foreground mb-4">
        Profil professionnel
      </h3>

      <div className="space-y-3">
        {/* Situation */}
        {situation && (
          <InfoRow icon={Briefcase} label="Situation" value={situation} />
        )}

        {/* Experience + Sector */}
        {(experienceYears || currentSector) && (
          <InfoRow
            icon={Briefcase}
            label="Expérience"
            value={[
              experienceYears ? `${experienceYears} ans` : null,
              currentSector,
            ].filter(Boolean).join(" · ")}
          />
        )}

        {/* Education */}
        {educationLevel && (
          <InfoRow icon={GraduationCap} label="Formation" value={educationLevel} />
        )}

        {/* Data experience */}
        <InfoRow
          icon={Database}
          label="Exp. data/IA"
          value={hasDataTraining ? "Oui" : "Non — part de zéro"}
          valueClass={hasDataTraining ? "text-emerald-400" : "text-amber-400"}
        />

        {/* Location */}
        {location && (
          <InfoRow icon={MapPin} label="Localisation" value={location} />
        )}

        {/* Remote preference */}
        {remotePreference && (
          <InfoRow
            icon={Monitor}
            label="Mode de travail"
            value={REMOTE_LABELS[remotePreference] || remotePreference}
          />
        )}

        {/* Motivation */}
        {motivationInfo && (
          <div className="flex items-center gap-3 py-2">
            <Heart className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold shrink-0 w-20">
                Motivation
              </span>
              <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full", motivationInfo.color)}>
                {motivationInfo.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/10">
          <div className="flex items-center gap-2 mb-2.5">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Certifications ({certifications.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {certifications.map((cert) => (
              <span
                key={cert}
                className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold shrink-0 w-20">
          {label}
        </span>
        <span className={cn("text-xs font-medium text-foreground truncate", valueClass)}>
          {value}
        </span>
      </div>
    </div>
  );
}
