"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────

export interface JourneyTaskData {
  id: string;
  title: string;
  description: string;
  order: number;
  status: "LOCKED" | "IN_PROGRESS" | "DONE";
  progress: number;
  taskProgressId: string | null;
}

export interface JourneyPhaseData {
  id: string;
  slug: string;
  number: string;
  title: string;
  description: string;
  order: number;
  status: "LOCKED" | "ACTIVE" | "COMPLETED";
  progress: number;
  tasks: JourneyTaskData[];
}

export interface JourneyData {
  phases: JourneyPhaseData[];
  totalTasks: number;
  completedTasks: number;
  overallProgress: number;
}

// ─── Helpers ──────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true },
  });
  return dbUser?.id ?? null;
}

// ─── Default Phases (seeded per user from onboarding) ─────────────

function buildDefaultPhases(onboarding: {
  targetRole: string | null;
  currentRole: string | null;
  currentSector: string | null;
  targetSector: string | null;
  hasDataTraining: boolean;
  topSkills: string[];
  preferredPace: string;
  blockers: string[];
  educationLevel: string | null;
  trainingBudget: string | null;
  technicalAppetite: string | null;
} | null): { slug: string; number: string; title: string; description: string; tasks: { title: string; description: string }[] }[] {
  const target = onboarding?.targetRole || "Data Analyst";
  const sector = onboarding?.targetSector || onboarding?.currentSector || "votre secteur";
  const currentRole = onboarding?.currentRole || "votre rôle actuel";
  const hasData = onboarding?.hasDataTraining ?? false;
  const budget = onboarding?.trainingBudget || "low";
  const techAppetite = onboarding?.technicalAppetite || "flexible";

  return [
    {
      slug: "diagnostic",
      number: "01",
      title: "Diagnostic",
      description: "Évaluation complète de votre profil et identification des gaps.",
      tasks: [
        { title: "Compléter le diagnostic IA", description: "Votre onboarding NextMove est déjà terminé — bravo !" },
        { title: "Analyser le résumé IA", description: "Relisez votre diagnostic sur le dashboard et identifiez vos 3 forces principales." },
        { title: "Identifier vos skill gaps", description: "Vérifiez les compétences à acquérir dans la section Skill Gaps du dashboard." },
      ],
    },
    {
      slug: "fondations",
      number: "02",
      title: "Fondations Data",
      description: `Acquérir les bases ${techAppetite === "no-code" ? "outils visuels" : techAppetite === "low-code" ? "SQL et outils BI" : "techniques"} pour évoluer vers ${target}.`,
      tasks: techAppetite === "no-code" ? [
        { title: "Maîtriser Excel / Google Sheets avancé", description: "Tableaux croisés dynamiques, RECHERCHEV, formules conditionnelles. Tutoriel gratuit : Google Sheets Training Center." },
        { title: "Découvrir un outil de data viz", description: `${budget === "none" || budget === "low" ? "Tableau Public (gratuit) ou Google Looker Studio (gratuit)." : "Power BI Desktop (gratuit) ou Tableau Desktop (essai 14j)."} Créez un premier dashboard.` },
        { title: "Créer un tableau de bord métier", description: `Prenez des données de votre domaine (${sector}) et créez un dashboard avec 3 KPIs et des insights.` },
        { title: "Apprendre le data storytelling", description: "Comment raconter une histoire avec des données. Cours gratuit : Google Data Analytics (Coursera, module Visualisation)." },
      ] : techAppetite === "low-code" ? [
        { title: "Apprendre les bases SQL", description: `${budget === "none" || budget === "low" ? "Cours gratuit : Mode Analytics SQL Tutorial ou W3Schools SQL." : "DataCamp — Introduction to SQL (4h, interactif)."}` },
        { title: "Maîtriser Excel / Sheets avancé", description: "RECHERCHEV, tableaux croisés dynamiques, Power Query. Indispensable pour un Data Analyst." },
        { title: "Premiers pas en data viz", description: `${budget === "none" || budget === "low" ? "Google Looker Studio (gratuit)" : "Power BI ou Tableau"}. Créez un dashboard à partir de données ${sector}.` },
        { title: "Comprendre les statistiques de base", description: "Khan Academy — Statistiques descriptives (gratuit, 2-3h). Moyenne, médiane, écart-type." },
      ] : hasData ? [
        { title: "Réviser les fondamentaux SQL", description: "Faites 3 exercices SQL sur HackerRank ou DataCamp (30 min)." },
        { title: "Projet Python mini", description: `Analysez un dataset de votre domaine (${sector}) avec pandas en 2h.` },
        { title: "Tableau de bord avec un outil BI", description: "Créez un dashboard simple avec Power BI ou Tableau à partir de données ouvertes." },
      ] : [
        { title: "Apprendre les bases SQL", description: `${budget === "none" || budget === "low" ? "Cours gratuit : Mode Analytics SQL Tutorial ou W3Schools SQL." : "DataCamp — Introduction to SQL (4h, interactif)."}` },
        { title: "Initiation Python", description: `${budget === "none" || budget === "low" ? "Cours gratuit : Python.org tutorial ou Kaggle Learn Python." : "Coursera — Python for Data Science (IBM), gratuit en audit."}` },
        { title: "Premiers pas en data viz", description: "Ouvrez un fichier Excel/CSV de votre domaine et créez 3 graphiques avec des insights." },
        { title: "Comprendre les statistiques de base", description: "Khan Academy — Statistiques descriptives (gratuit, 2-3h). Moyenne, médiane, écart-type." },
      ],
    },
    {
      slug: "specialisation",
      number: "03",
      title: "Spécialisation",
      description: `Se former au rôle de ${target} dans le secteur ${sector}.`,
      tasks: [
        { title: `Étudier le métier de ${target}`, description: `Lisez 5 fiches de poste "${target}" sur LinkedIn et notez les compétences communes.` },
        { title: "Suivre une formation ciblée", description: `Choisissez et commencez une formation spécifique pour ${target} (voir Resources).` },
        { title: `Projet portfolio : ${sector} + Data`, description: `Créez un projet qui combine votre expertise ${currentRole} avec la data. Ex: analyse de données ${sector}.` },
        { title: "Obtenir une certification", description: `Visez une certification reconnue (Google Data Analytics, IBM Data Science, ou spécialisée ${sector}).` },
      ],
    },
    {
      slug: "positionnement",
      number: "04",
      title: "Positionnement",
      description: "Personal branding, réseau et préparation aux entretiens.",
      tasks: [
        { title: "Optimiser le profil LinkedIn", description: `Titre: "${target} | Ex-${currentRole} | Transition ${sector} → Data". Ajoutez les compétences data.` },
        { title: "Créer du contenu", description: "Publiez un post LinkedIn sur votre parcours de transition ou un insight data de votre domaine." },
        { title: "Networker dans la data", description: `Rejoignez 2 groupes LinkedIn/Discord data et commentez activement pendant 2 semaines.` },
        { title: "Simuler un entretien", description: `Demandez au Copilot IA de vous faire passer un entretien pour ${target}.` },
      ],
    },
    {
      slug: "lancement",
      number: "05",
      title: "Lancement",
      description: "Candidatures ciblées et premiers pas dans le rôle.",
      tasks: [
        { title: "Préparer le CV orienté data", description: `Adaptez votre CV pour mettre en avant vos compétences data et votre projet portfolio.` },
        { title: "Candidater à 5 postes", description: `Postulez à 5 offres "${target}" cette semaine. Qualité > quantité.` },
        { title: "Négocier et choisir", description: "Quand vous recevez une offre, utilisez le Copilot pour préparer la négociation." },
      ],
    },
  ];
}

// ─── Seed Journey ─────────────────────────────────────────────────

async function seedJourneyForUser(userId: string): Promise<void> {
  // Get user's onboarding data for personalization
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { onboarding: true },
  });

  const onboarding = user?.onboarding ? {
    targetRole: user.onboarding.targetRole,
    currentRole: user.onboarding.currentRole,
    currentSector: user.onboarding.currentSector,
    targetSector: user.onboarding.targetSector,
    hasDataTraining: user.onboarding.hasDataTraining,
    topSkills: user.onboarding.topSkills,
    preferredPace: user.onboarding.preferredPace,
    blockers: user.onboarding.blockers,
    educationLevel: user.onboarding.educationLevel,
    trainingBudget: user.onboarding.trainingBudget,
    technicalAppetite: user.onboarding.technicalAppetite,
  } : null;

  // Check if user already has progress records
  const existingProgress = await prisma.journeyProgress.count({
    where: { userId },
  });

  if (existingProgress > 0) return; // Already seeded for this user

  // Delete old global phases/tasks to regenerate personalized ones
  // (safe because progress records are per-user and we just checked none exist)
  await prisma.journeyTask.deleteMany();
  await prisma.journeyPhase.deleteMany();

  // Build and seed personalized phases
  const defaultPhases = buildDefaultPhases(onboarding);

  for (let i = 0; i < defaultPhases.length; i++) {
    const p = defaultPhases[i];
    const phase = await prisma.journeyPhase.create({
      data: {
        slug: p.slug,
        number: p.number,
        title: p.title,
        description: p.description,
        order: i,
        tasks: {
          create: p.tasks.map((t, j) => ({
            title: t.title,
            description: t.description,
            order: j,
          })),
        },
      },
      include: { tasks: { orderBy: { order: "asc" } } },
    });

    // First phase is active, rest locked
    const status = i === 0 ? "ACTIVE" as const : "LOCKED" as const;

    const jp = await prisma.journeyProgress.create({
      data: {
        userId,
        phaseId: phase.id,
        status,
        progress: 0,
        startedAt: i === 0 ? new Date() : null,
      },
    });

    // Create task progress entries
    for (const task of phase.tasks) {
      await prisma.journeyTaskProgress.create({
        data: {
          journeyProgressId: jp.id,
          taskId: task.id,
          status: i === 0 ? "IN_PROGRESS" as const : "LOCKED" as const,
          progress: 0,
        },
      });
    }
  }
}

// ─── Get Journey Data ─────────────────────────────────────────────

export async function getJourneyData(): Promise<JourneyData | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  // Ensure journey is seeded
  await seedJourneyForUser(userId);

  const phases = await prisma.journeyPhase.findMany({
    orderBy: { order: "asc" },
    include: {
      tasks: { orderBy: { order: "asc" } },
      progress: {
        where: { userId },
        include: {
          tasks: true,
        },
      },
    },
  });

  let totalTasks = 0;
  let completedTasks = 0;

  const phaseData: JourneyPhaseData[] = phases.map((phase) => {
    const userProgress = phase.progress[0];
    const status = userProgress?.status ?? "LOCKED";
    const phaseProgress = userProgress?.progress ?? 0;

    const tasks: JourneyTaskData[] = phase.tasks.map((task) => {
      totalTasks++;
      const taskProgress = userProgress?.tasks.find((tp) => tp.taskId === task.id);
      const taskStatus = taskProgress?.status ?? "LOCKED";
      if (taskStatus === "DONE") completedTasks++;

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        order: task.order,
        status: taskStatus,
        progress: taskProgress?.progress ?? 0,
        taskProgressId: taskProgress?.id ?? null,
      };
    });

    return {
      id: phase.id,
      slug: phase.slug,
      number: phase.number,
      title: phase.title,
      description: phase.description,
      order: phase.order,
      status,
      progress: phaseProgress,
      tasks,
    };
  });

  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    phases: phaseData,
    totalTasks,
    completedTasks,
    overallProgress,
  };
}

// ─── Toggle Task Completion ───────────────────────────────────────

export async function toggleTask(taskProgressId: string): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Non authentifié" };

  try {
    const taskProgress = await prisma.journeyTaskProgress.findUnique({
      where: { id: taskProgressId },
      include: {
        task: { select: { title: true } },
        journeyProgress: {
          include: {
            tasks: true,
            phase: { include: { tasks: true } },
          },
        },
      },
    });

    if (!taskProgress) return { success: false, error: "Tâche introuvable" };
    if (taskProgress.journeyProgress.userId !== userId) return { success: false, error: "Non autorisé" };

    // Toggle: DONE ↔ IN_PROGRESS
    const newStatus = taskProgress.status === "DONE" ? "IN_PROGRESS" as const : "DONE" as const;

    await prisma.journeyTaskProgress.update({
      where: { id: taskProgressId },
      data: {
        status: newStatus,
        progress: newStatus === "DONE" ? 100 : 0,
        completedAt: newStatus === "DONE" ? new Date() : null,
      },
    });

    // Track task completion activity
    if (newStatus === "DONE") {
      await prisma.activity.create({
        data: {
          userId,
          type: "TASK_COMPLETED",
          title: taskProgress.task.title,
          description: `Phase : ${taskProgress.journeyProgress.phase.title}`,
        },
      }).catch(() => {}); // Non-blocking
    }

    // Recalculate phase progress
    const allTasksInPhase = taskProgress.journeyProgress.tasks;
    const updatedTasks = allTasksInPhase.map((t) =>
      t.id === taskProgressId ? { ...t, status: newStatus } : t
    );
    const doneCount = updatedTasks.filter((t) => t.status === "DONE").length;
    const totalCount = updatedTasks.length;
    const phaseProgress = Math.round((doneCount / totalCount) * 100);
    const phaseCompleted = doneCount === totalCount;

    await prisma.journeyProgress.update({
      where: { id: taskProgress.journeyProgressId },
      data: {
        progress: phaseProgress,
        status: phaseCompleted ? "COMPLETED" : "ACTIVE",
        completedAt: phaseCompleted ? new Date() : null,
      },
    });

    // If phase completed, track activity and unlock next phase
    if (phaseCompleted) {
      const currentPhase = taskProgress.journeyProgress.phase;

      await prisma.activity.create({
        data: {
          userId,
          type: "PHASE_COMPLETED",
          title: currentPhase.title,
          description: `Phase ${currentPhase.order} terminée !`,
        },
      }).catch(() => {});
      const nextPhase = await prisma.journeyPhase.findFirst({
        where: { order: currentPhase.order + 1 },
      });

      if (nextPhase) {
        // Activate next phase
        await prisma.journeyProgress.updateMany({
          where: { userId, phaseId: nextPhase.id },
          data: { status: "ACTIVE", startedAt: new Date() },
        });

        // Unlock tasks in next phase
        const nextProgress = await prisma.journeyProgress.findFirst({
          where: { userId, phaseId: nextPhase.id },
        });
        if (nextProgress) {
          await prisma.journeyTaskProgress.updateMany({
            where: { journeyProgressId: nextProgress.id },
            data: { status: "IN_PROGRESS" },
          });
        }
      }
    }

    // If uncompleting a task that was in a completed phase, re-activate it
    if (newStatus === "IN_PROGRESS" && taskProgress.journeyProgress.status === "COMPLETED") {
      await prisma.journeyProgress.update({
        where: { id: taskProgress.journeyProgressId },
        data: {
          status: "ACTIVE",
          completedAt: null,
          progress: phaseProgress,
        },
      });
    }

    // Update career score based on overall task completion
    // Bonus career score: +5 per completed task
    await prisma.userProfile.updateMany({
      where: { userId },
      data: {
        careerScore: { increment: newStatus === "DONE" ? 5 : -5 },
      },
    });

    return { success: true };
  } catch (e) {
    console.error("Toggle task error:", e);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

// ─── Task Session Helpers ─────────────────────────────────────────

export interface TaskWithContext {
  id: string;
  title: string;
  description: string;
  phase: { title: string; number: string };
  taskProgressId: string | null;
  taskStatus: "LOCKED" | "IN_PROGRESS" | "DONE";
  session: {
    id: string;
    status: "LESSON" | "QUIZ" | "FEEDBACK" | "COMPLETED";
    lessonContent: string | null;
    quizQuestions: unknown;
    quizAnswers: unknown;
    quizScore: number | null;
    feedbackContent: string | null;
  } | null;
}

export async function getTaskWithContext(taskId: string): Promise<TaskWithContext | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  // Check phase access (free users = Phase 1 only)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  if (user) {
    const { checkPhaseAccess } = await import("@/lib/billing/rate-limit");
    const phaseCheck = await checkPhaseAccess(userId, user.plan, taskId);
    if (!phaseCheck.allowed) return null;
  }

  const task = await prisma.journeyTask.findUnique({
    where: { id: taskId },
    include: {
      phase: true,
    },
  });

  if (!task) return null;

  // Get user's progress for this phase
  const userProgress = await prisma.journeyProgress.findFirst({
    where: { userId, phaseId: task.phaseId },
    include: {
      tasks: { where: { taskId } },
    },
  });

  const taskProgress = userProgress?.tasks[0];

  // Get existing session
  const session = await prisma.taskSession.findUnique({
    where: { userId_taskId: { userId, taskId } },
  });

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    phase: { title: task.phase.title, number: task.phase.number },
    taskProgressId: taskProgress?.id ?? null,
    taskStatus: taskProgress?.status ?? "LOCKED",
    session: session
      ? {
          id: session.id,
          status: session.status,
          lessonContent: session.lessonContent,
          quizQuestions: session.quizQuestions,
          quizAnswers: session.quizAnswers,
          quizScore: session.quizScore,
          feedbackContent: session.feedbackContent,
        }
      : null,
  };
}

export async function saveSessionProgress(
  taskId: string,
  data: {
    status?: "LESSON" | "QUIZ" | "FEEDBACK" | "COMPLETED";
    lessonContent?: string;
    quizQuestions?: unknown;
    quizAnswers?: unknown;
    quizScore?: number;
    feedbackContent?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Non authentifié" };

  try {
    await prisma.taskSession.upsert({
      where: { userId_taskId: { userId, taskId } },
      create: {
        userId,
        taskId,
        status: data.status || "LESSON",
        lessonContent: data.lessonContent,
        quizQuestions: data.quizQuestions as never,
        quizAnswers: data.quizAnswers as never,
        quizScore: data.quizScore,
        feedbackContent: data.feedbackContent,
        lessonCompletedAt: data.status === "QUIZ" ? new Date() : undefined,
        quizCompletedAt: data.status === "FEEDBACK" ? new Date() : undefined,
      },
      update: {
        ...data,
        quizQuestions: data.quizQuestions as never,
        quizAnswers: data.quizAnswers as never,
        lessonCompletedAt: data.status === "QUIZ" ? new Date() : undefined,
        quizCompletedAt: data.status === "FEEDBACK" ? new Date() : undefined,
      },
    });

    return { success: true };
  } catch (e) {
    console.error("Save session error:", e);
    return { success: false, error: "Erreur de sauvegarde" };
  }
}

export async function completeTaskSession(
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Non authentifié" };

  try {
    // Mark session as completed
    await prisma.taskSession.update({
      where: { userId_taskId: { userId, taskId } },
      data: { status: "COMPLETED" },
    });

    // Find the task progress and mark it as DONE
    const task = await prisma.journeyTask.findUnique({
      where: { id: taskId },
      include: {
        phase: {
          include: {
            progress: {
              where: { userId },
              include: { tasks: true },
            },
          },
        },
      },
    });

    if (!task) return { success: false, error: "Tâche introuvable" };

    const userProgress = task.phase.progress[0];
    if (!userProgress) return { success: false, error: "Progression introuvable" };

    const taskProgress = userProgress.tasks.find((tp) => tp.taskId === taskId);
    if (!taskProgress) return { success: false, error: "Task progress introuvable" };

    // Toggle the task to DONE (reuse the existing logic)
    if (taskProgress.status !== "DONE") {
      await toggleTask(taskProgress.id);
    }

    return { success: true };
  } catch (e) {
    console.error("Complete session error:", e);
    return { success: false, error: "Erreur lors de la complétion" };
  }
}
