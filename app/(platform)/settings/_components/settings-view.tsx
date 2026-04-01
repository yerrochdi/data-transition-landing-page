"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Target,
  Clock,
  MapPin,
  Shield,
  Trash2,
  LogOut,
  Save,
  Loader2,
  Crown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateProfile, deleteAccount, resetOnboarding } from "@/lib/settings/actions";
import { signOut } from "@/lib/auth/actions";
import type { SettingsData } from "@/lib/settings/actions";

// ─── Section Card ─────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-low rounded-2xl ghost-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-headline text-sm font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full bg-surface-container-lowest rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 ghost-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
    </div>
  );
}

// ─── Select Field ─────────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-container-lowest rounded-xl px-4 py-3 text-sm text-foreground ghost-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────

export function SettingsView({ data }: { data: SettingsData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState(data.user.firstName);
  const [lastName, setLastName] = useState(data.user.lastName);
  const [targetRole, setTargetRole] = useState(data.profile?.targetRole || "");
  const [targetSector, setTargetSector] = useState(data.profile?.targetSector || "");
  const [preferredPace, setPreferredPace] = useState(data.onboarding?.preferredPace || "MODERATE");
  const [availableHours, setAvailableHours] = useState(String(data.onboarding?.availableHoursPerWeek ?? 5));
  const [trainingBudget, setTrainingBudget] = useState(data.onboarding?.trainingBudget || "low");
  const [location, setLocation] = useState(data.onboarding?.location || "");
  const [remotePreference, setRemotePreference] = useState(data.onboarding?.remotePreference || "flexible");

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfile({
        firstName,
        lastName,
        targetRole: targetRole || undefined,
        targetSector: targetSector || undefined,
        preferredPace: preferredPace || undefined,
        availableHoursPerWeek: Number(availableHours) || undefined,
        trainingBudget: trainingBudget || undefined,
        location: location || undefined,
        remotePreference: remotePreference || undefined,
      });
      if (result.success) {
        setMessage({ type: "success", text: "Profil mis à jour avec succès" });
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  };

  const handleResetOnboarding = () => {
    startTransition(async () => {
      const result = await resetOnboarding();
      if (result.success) {
        router.push("/onboarding");
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
        setShowResetConfirm(false);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAccount();
      if (result.success) {
        router.push("/home");
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  const memberSince = new Date(data.user.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
              Paramètres
            </h1>
            <p className="text-xs text-muted-foreground">
              Gérez votre profil et vos préférences
            </p>
          </div>
        </div>
      </header>

      {/* Status message */}
      {message && (
        <div className={cn(
          "flex items-center gap-2 p-4 rounded-xl",
          message.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
        )}>
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <p className={cn("text-sm", message.type === "success" ? "text-emerald-400" : "text-red-400")}>
            {message.text}
          </p>
        </div>
      )}

      {/* Account info */}
      <div className="bg-surface-container-low rounded-2xl ghost-border p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-foreground">
                {data.user.firstName} {data.user.lastName}
              </h2>
              <p className="text-xs text-muted-foreground">{data.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10">
              <Crown className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">
                {data.user.plan === "PREMIUM" ? "Premium" : data.user.plan === "ENTERPRISE" ? "Enterprise" : "Free"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container ghost-border">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Membre depuis {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Scores summary */}
        {data.profile && (
          <div className="flex gap-6 mt-5 pt-5 border-t border-border/10">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Career Score</span>
              <p className="text-lg font-headline font-black text-primary">{data.profile.careerScore}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Readiness</span>
              <p className="text-lg font-headline font-black text-foreground">{data.profile.readinessScore}%</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Confiance</span>
              <p className="text-lg font-headline font-black text-foreground">{data.profile.confidenceLevel}/10</p>
            </div>
          </div>
        )}
      </div>

      {/* Identity */}
      <Section title="Identité" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Prénom" value={firstName} onChange={setFirstName} />
          <Field label="Nom" value={lastName} onChange={setLastName} />
          <Field label="Email" value={data.user.email} onChange={() => {}} disabled />
        </div>
      </Section>

      {/* Career objectives */}
      <Section title="Objectifs carrière" icon={Target}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Rôle cible" value={targetRole} onChange={setTargetRole} placeholder="Ex: Data Analyst" />
          <Field label="Secteur cible" value={targetSector} onChange={setTargetSector} placeholder="Ex: Finance" />
        </div>
        {data.profile?.currentRole && (
          <p className="text-[10px] text-muted-foreground mt-3">
            Poste actuel : {data.profile.currentRole} · {data.profile.currentSector || "N/A"}
            {data.profile.experienceYears && ` · ${data.profile.experienceYears} ans`}
          </p>
        )}
      </Section>

      {/* Preferences */}
      <Section title="Préférences de formation" icon={Clock}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Rythme"
            value={preferredPace}
            onChange={setPreferredPace}
            options={[
              { value: "RELAXED", label: "Relaxé — à mon rythme" },
              { value: "MODERATE", label: "Modéré — régulier" },
              { value: "INTENSIVE", label: "Intensif — max de résultats" },
            ]}
          />
          <Field
            label="Heures disponibles / semaine"
            value={availableHours}
            onChange={setAvailableHours}
            type="number"
          />
          <SelectField
            label="Budget formation"
            value={trainingBudget}
            onChange={setTrainingBudget}
            options={[
              { value: "none", label: "Pas de budget" },
              { value: "low", label: "Limité (< 500€)" },
              { value: "medium", label: "Moyen (500-2000€)" },
              { value: "high", label: "Confortable (> 2000€)" },
            ]}
          />
          <SelectField
            label="Préférence remote"
            value={remotePreference}
            onChange={setRemotePreference}
            options={[
              { value: "remote", label: "Full remote" },
              { value: "hybrid", label: "Hybride" },
              { value: "onsite", label: "Présentiel" },
              { value: "flexible", label: "Flexible" },
            ]}
          />
          <Field label="Localisation" value={location} onChange={setLocation} placeholder="Ex: Paris" />
        </div>
      </Section>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full md:w-auto gradient-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Sauvegarder les modifications
      </button>

      {/* Danger zone */}
      <div className="border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-red-400" />
          <h3 className="font-headline text-sm font-bold text-red-400">Zone dangereuse</h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refaire l&apos;onboarding
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetOnboarding}
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Confirmer le reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
            </div>
          )}

          <button
            onClick={handleSignOut}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground bg-surface-container ghost-border hover:bg-surface-container-high transition-all"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer mon compte
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Confirmer la suppression
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground mt-3">
          Refaire l&apos;onboarding réinitialise votre profil, scores et parcours. La suppression est définitive.
        </p>
      </div>
    </div>
  );
}
