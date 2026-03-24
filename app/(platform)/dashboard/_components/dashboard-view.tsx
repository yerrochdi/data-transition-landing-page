"use client";

import { Flame, TrendingUp, Zap, Target, Clock, GraduationCap } from "lucide-react";
import type { DashboardData } from "@/lib/dashboard/actions";
import { ScoreGauge } from "./score-gauge";
import { MiniKpi } from "./mini-kpi";
import { SkillsRadar } from "./skills-radar";
import { AiSummary } from "./ai-summary";
import { TransitionTimeline } from "./transition-timeline";
import { BlockersCards } from "./blockers-cards";
import { ActionCards } from "./action-cards";
import { ProfileSnapshot } from "./profile-snapshot";
import { GoalsAvailability } from "./goals-availability";
import { PrioritiesLearning } from "./priorities-learning";

interface DashboardViewProps {
  data: DashboardData;
}

export function DashboardView({ data }: DashboardViewProps) {
  const { user, profile, onboarding } = data;

  const careerScore = profile?.careerScore ?? 0;
  const readinessScore = profile?.readinessScore ?? 0;
  const confidenceLevel = onboarding?.confidenceLevel ?? profile?.confidenceLevel ?? 5;
  const skills = onboarding?.topSkills?.length ? onboarding.topSkills : (profile?.topSkills ?? []);
  const skillLevels = onboarding?.skillLevels ?? [];
  const hasCompletedOnboarding = !!onboarding?.completedAt;

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════
          HERO — Score + Profile Badge + KPIs
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl p-8 ghost-border bg-gradient-to-br from-surface-container-low via-surface-container-low to-primary/5">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          {/* Greeting */}
          <div className="mb-6">
            <h1 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-1">
              Bonjour, {user.firstName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {hasCompletedOnboarding
                ? `Objectif : ${onboarding?.targetRole || profile?.targetRole || "Data Transition"} — Continuez sur votre lancée.`
                : "Bienvenue ! Complétez votre diagnostic pour débloquer votre cockpit personnalisé."}
            </p>
          </div>

          {/* Score + KPIs row */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Radial Gauge */}
            <ScoreGauge
              score={careerScore}
              maxScore={1000}
              label="Career Score"
            />

            {/* KPIs grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              <MiniKpi
                label="Readiness"
                value={readinessScore > 0 ? `${readinessScore}%` : "—"}
                icon={TrendingUp}
              />
              <MiniKpi
                label="Confiance"
                value={`${confidenceLevel}/10`}
                icon={Flame}
                color="hsl(45, 93%, 47%)"
              />
              <MiniKpi
                label="Compétences"
                value={skills.length}
                icon={Zap}
                color="hsl(210, 100%, 50%)"
              />
              <MiniKpi
                label="Disponibilité"
                value={onboarding?.availableHoursPerWeek ? `${onboarding.availableHoursPerWeek}h/sem` : "—"}
                icon={Clock}
                color="hsl(160, 80%, 45%)"
              />
            </div>
          </div>

          {/* Target Role badge + education */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {(onboarding?.targetRole || profile?.targetRole) && (
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary">
                  {onboarding?.targetRole || profile?.targetRole}
                </span>
                {(onboarding?.targetSector || profile?.targetSector) && (
                  <>
                    <span className="text-primary/40">•</span>
                    <span className="text-xs text-primary/80">
                      {onboarding?.targetSector || profile?.targetSector}
                    </span>
                  </>
                )}
              </div>
            )}
            {onboarding?.educationLevel && (
              <div className="inline-flex items-center gap-2 bg-surface-container-lowest border border-border/10 rounded-full px-3 py-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium">
                  {onboarding.educationLevel}
                </span>
              </div>
            )}
            {onboarding?.hasDataTraining && (
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
                <span className="text-[11px] text-emerald-400 font-bold">Exp. data/IA</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MIDDLE — Charts + AI Summary (2 cols)
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        {skills.length > 0 ? (
          <SkillsRadar skills={skills} skillLevels={skillLevels} />
        ) : (
          <div className="bg-surface-container-low rounded-2xl p-6 ghost-border flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center">
              Complétez votre diagnostic pour voir votre profil de compétences.
            </p>
          </div>
        )}

        {/* AI Summary */}
        <AiSummary
          aiSummary={onboarding?.aiSummary ?? null}
          hasCompletedOnboarding={hasCompletedOnboarding}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PROFILE DETAILS — Snapshot + Goals (2 cols)
          ═══════════════════════════════════════════════════════════ */}
      {hasCompletedOnboarding && onboarding && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfileSnapshot
            educationLevel={onboarding.educationLevel}
            certifications={onboarding.certifications}
            hasDataTraining={onboarding.hasDataTraining}
            motivation={onboarding.motivation}
            situation={onboarding.situation}
            location={onboarding.location}
            remotePreference={onboarding.remotePreference}
            experienceYears={onboarding.experienceYears}
            currentSector={onboarding.currentSector}
          />
          <GoalsAvailability
            shortTermGoal={onboarding.shortTermGoal}
            longTermGoal={onboarding.longTermGoal}
            dreamScenario={onboarding.dreamScenario}
            availableHoursPerWeek={onboarding.availableHoursPerWeek}
            trainingBudget={onboarding.trainingBudget}
            preferredPace={onboarding.preferredPace}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          LOWER — Timeline + Blockers (2 cols)
          ═══════════════════════════════════════════════════════════ */}
      {hasCompletedOnboarding && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransitionTimeline
            aiRecommendation={onboarding?.aiRecommendation ?? null}
            preferredPace={onboarding?.preferredPace ?? "MODERATE"}
          />
          <BlockersCards
            blockers={onboarding?.blockers ?? []}
            confidenceLevel={confidenceLevel}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          PRIORITIES & LEARNING STYLE (full width)
          ═══════════════════════════════════════════════════════════ */}
      {hasCompletedOnboarding && onboarding && (
        <PrioritiesLearning
          priorities={onboarding.priorities}
          learningStyle={onboarding.learningStyle}
          keyAchievements={onboarding.keyAchievements}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM — Action Cards
          ═══════════════════════════════════════════════════════════ */}
      <ActionCards
        targetRole={onboarding?.targetRole || profile?.targetRole || null}
        hasCompletedOnboarding={hasCompletedOnboarding}
      />

      {/* Member info */}
      <div className="text-center pb-4">
        <p className="text-[10px] text-muted-foreground/40">
          Membre depuis le{" "}
          {new Date(user.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          — Plan{" "}
          {user.plan === "PREMIUM"
            ? "Premium"
            : user.plan === "ENTERPRISE"
              ? "Enterprise"
              : "Free"}
        </p>
      </div>
    </div>
  );
}
