"use client";

import {
  Flame,
  TrendingUp,
  Zap,
  Target,
  Clock,
  GraduationCap,
  ArrowRight,
  Briefcase,
  MapPin,
  Database,
} from "lucide-react";
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
import { ReadinessBreakdown } from "./readiness-breakdown";
import { SkillGaps } from "./skill-gaps";
import { StreakTip } from "./streak-tip";
import { Achievements } from "./achievements";
import { WelcomeModal } from "./welcome-modal";
import { NextActions } from "./next-actions";
import { NextBestAction, type NextBestActionProps } from "./next-best-action";
import { cn } from "@/lib/utils";

interface DashboardViewProps {
  data: DashboardData;
  nextAction: NextBestActionProps | null;
}

export function DashboardView({ data, nextAction }: DashboardViewProps) {
  const { user, profile, onboarding, streakDays, dailyTip, journey } = data;

  const careerScore = profile?.careerScore ?? 0;
  const readinessScore = profile?.readinessScore ?? 0;
  const confidenceLevel = onboarding?.confidenceLevel ?? profile?.confidenceLevel ?? 5;
  const skills = onboarding?.topSkills?.length ? onboarding.topSkills : (profile?.topSkills ?? []);
  const skillLevels = onboarding?.skillLevels ?? [];
  const skillGaps = profile?.skillGaps ?? [];
  const hasCompletedOnboarding = !!onboarding?.completedAt;

  const currentRole = onboarding?.currentRole || profile?.currentRole;
  const targetRole = onboarding?.targetRole || profile?.targetRole;
  const currentSector = onboarding?.currentSector || profile?.currentSector;
  const targetSector = onboarding?.targetSector || profile?.targetSector;

  return (
    <div className="space-y-8">
      {/* Welcome Modal — shows once after first onboarding */}
      {hasCompletedOnboarding && (
        <WelcomeModal
          userName={user.firstName}
          targetRole={targetRole ?? null}
          careerScore={careerScore}
          readinessScore={readinessScore}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          NEXT BEST ACTION — the orchestrator's recommendation
          (Phase A: this is the new dashboard hero, replacing the
           feature-juxtaposition with a single fil rouge)
          ═══════════════════════════════════════════════════════════ */}
      {nextAction && <NextBestAction {...nextAction} />}

      {/* ═══════════════════════════════════════════════════════════
          HERO — Score + Role Transition + KPIs
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl p-8 ghost-border bg-gradient-to-br from-surface-container-low via-surface-container-low to-primary/5">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          {/* Greeting + subtitle */}
          <div className="mb-6">
            <h1 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-1">
              Bonjour, {user.firstName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {hasCompletedOnboarding
                ? "Votre cockpit de transition. Chaque action vous rapproche de votre objectif."
                : "Bienvenue ! Complétez votre diagnostic pour débloquer votre cockpit personnalisé."}
            </p>
          </div>

          {/* Role transition banner */}
          {hasCompletedOnboarding && currentRole && targetRole && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-surface-container-lowest to-primary/5 border border-border/10">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Current */}
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Aujourd&apos;hui</p>
                    <p className="text-sm font-bold text-foreground">{currentRole}</p>
                    {currentSector && <p className="text-[10px] text-muted-foreground">{currentSector}</p>}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-1 mx-2">
                  <div className="w-8 h-px bg-gradient-to-r from-muted-foreground/30 to-primary/60" />
                  <ArrowRight className="w-5 h-5 text-primary animate-pulse" />
                  <div className="w-8 h-px bg-gradient-to-r from-primary/60 to-primary/30" />
                </div>

                {/* Target */}
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Objectif</p>
                    <p className="text-sm font-bold text-primary">{targetRole}</p>
                    {targetSector && <p className="text-[10px] text-primary/70">{targetSector}</p>}
                  </div>
                </div>

                {/* Context tags */}
                <div className="ml-auto flex items-center gap-2 flex-wrap">
                  {onboarding?.experienceYears && (
                    <span className="text-[10px] text-muted-foreground bg-surface-container px-2 py-1 rounded-full font-medium">
                      {onboarding.experienceYears} ans exp.
                    </span>
                  )}
                  {onboarding?.location && (
                    <span className="text-[10px] text-muted-foreground bg-surface-container px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {onboarding.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Score + KPIs row */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Radial Gauge */}
            <ScoreGauge
              score={careerScore}
              maxScore={1000}
              label="Career Score"
            />

            {/* KPIs grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 w-full">
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
              <MiniKpi
                label="Gaps"
                value={skillGaps.length > 0 ? `${skillGaps.length} à combler` : "—"}
                icon={Target}
                color="hsl(0, 72%, 60%)"
              />
              <MiniKpi
                label="Freins"
                value={onboarding?.blockers?.length ? `${onboarding.blockers.length} identifiés` : "0"}
                icon={Flame}
                color="hsl(25, 95%, 55%)"
              />
            </div>
          </div>

          {/* Badges row */}
          {hasCompletedOnboarding && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {onboarding?.educationLevel && (
                <div className="inline-flex items-center gap-1.5 bg-surface-container-lowest border border-border/10 rounded-full px-3 py-1">
                  <GraduationCap className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {onboarding.educationLevel}
                  </span>
                </div>
              )}
              {onboarding?.hasDataTraining && (
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-bold">Exp. data/IA</span>
                </div>
              )}
              {onboarding?.preferredPace && (
                <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                  <span className="text-[10px] text-primary font-bold">
                    Rythme {onboarding.preferredPace === "INTENSIVE" ? "intensif" : onboarding.preferredPace === "RELAXED" ? "relaxé" : "modéré"}
                  </span>
                </div>
              )}
              {onboarding?.certifications?.length > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                  <span className="text-[10px] text-amber-400 font-bold">
                    {onboarding.certifications.length} certification{onboarding.certifications.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STREAK + DAILY TIP
          ═══════════════════════════════════════════════════════════ */}
      {hasCompletedOnboarding && (
        <StreakTip streakDays={streakDays} dailyTip={dailyTip} />
      )}

      {/* ═══════════════════════════════════════════════════════════
          NEXT ACTIONS — What to do now
          ═══════════════════════════════════════════════════════════ */}
      {hasCompletedOnboarding && (
        <NextActions
          targetRole={targetRole ?? null}
          skillGaps={skillGaps}
          overallJourneyProgress={journey.overallProgress}
          activePhaseTitle={journey.activePhaseTitle}
          nextTaskTitle={journey.nextTaskTitle}
          completedTasks={journey.completedTasks}
          totalTasks={journey.totalTasks}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          BADGES / ACHIEVEMENTS
          ═══════════════════════════════════════════════════════════ */}
      {hasCompletedOnboarding && (
        <Achievements
          careerScore={careerScore}
          readinessScore={readinessScore}
          streakDays={streakDays}
          skillCount={skills.length}
          gapCount={skillGaps.length}
          confidenceLevel={confidenceLevel}
          hasDataTraining={onboarding?.hasDataTraining ?? false}
          certificationCount={onboarding?.certifications?.length ?? 0}
          blockerCount={onboarding?.blockers?.length ?? 0}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          ROW 1 — AI Summary (full width for structured view)
          ═══════════════════════════════════════════════════════════ */}
      <AiSummary
        aiSummary={onboarding?.aiSummary ?? null}
        hasCompletedOnboarding={hasCompletedOnboarding}
      />

      {/* ═══════════════════════════════════════════════════════════
          ROW 2 — Readiness Breakdown + Skills Radar (2 cols)
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hasCompletedOnboarding && onboarding ? (
          <ReadinessBreakdown
            readinessScore={readinessScore}
            experienceYears={onboarding.experienceYears}
            hasDataTraining={onboarding.hasDataTraining}
            educationLevel={onboarding.educationLevel}
            certifications={onboarding.certifications}
            confidenceLevel={confidenceLevel}
            availableHoursPerWeek={onboarding.availableHoursPerWeek}
            skillCount={skills.length}
            blockerCount={onboarding.blockers?.length ?? 0}
          />
        ) : (
          <div className="bg-surface-container-low rounded-2xl p-6 ghost-border flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center">
              Complétez votre diagnostic pour voir votre readiness.
            </p>
          </div>
        )}

        {skills.length > 0 ? (
          <SkillsRadar skills={skills} skillLevels={skillLevels} />
        ) : (
          <div className="bg-surface-container-low rounded-2xl p-6 ghost-border flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center">
              Complétez votre diagnostic pour voir votre profil de compétences.
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ROW 3 — Skill Gaps + Blockers (2 cols)
          ═══════════════════════════════════════════════════════════ */}
      {hasCompletedOnboarding && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkillGaps
            skillGaps={skillGaps}
            topSkills={skills}
            targetRole={targetRole ?? null}
          />
          <BlockersCards
            blockers={onboarding?.blockers ?? []}
            confidenceLevel={confidenceLevel}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ROW 4 — Timeline + Goals (2 cols)
          ═══════════════════════════════════════════════════════════ */}
      {hasCompletedOnboarding && onboarding && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransitionTimeline
            aiRecommendation={onboarding.aiRecommendation ?? null}
            preferredPace={onboarding.preferredPace ?? "MODERATE"}
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
          ROW 5 — Profile + Priorities (2 cols)
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
          <PrioritiesLearning
            priorities={onboarding.priorities}
            learningStyle={onboarding.learningStyle}
            keyAchievements={onboarding.keyAchievements}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM — Action Cards
          ═══════════════════════════════════════════════════════════ */}
      <ActionCards
        targetRole={targetRole ?? null}
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
