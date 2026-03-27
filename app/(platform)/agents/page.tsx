import { getDashboardData } from "@/lib/dashboard/actions";
import { redirect } from "next/navigation";
import { CopilotChat } from "./_components/copilot-chat";
import type { SuggestionData } from "./_components/copilot-chat";

function buildSuggestions(data: NonNullable<Awaited<ReturnType<typeof getDashboardData>>>): SuggestionData[] {
  const { onboarding, profile } = data;
  const suggestions: SuggestionData[] = [];

  const targetRole = onboarding?.targetRole || profile?.targetRole || "data/IA";
  const skillGaps = profile?.skillGaps ?? [];
  const blockers = onboarding?.blockers ?? [];
  const currentRole = onboarding?.currentRole || profile?.currentRole || "mon poste actuel";
  const confidenceLevel = onboarding?.confidenceLevel ?? 5;
  const topSkills = onboarding?.topSkills ?? profile?.topSkills ?? [];
  const currentSector = onboarding?.currentSector || profile?.currentSector || "mon secteur";
  const preferredPace = onboarding?.preferredPace || "MODERATE";
  const availableHours = onboarding?.availableHoursPerWeek ?? 5;

  // 1. Plan d'action personnalisé
  suggestions.push({
    icon: "Target",
    label: `Plan pour devenir ${targetRole}`,
    prompt: `Je suis ${currentRole} avec ${onboarding?.experienceYears ?? "quelques"} ans d'expérience dans le secteur ${currentSector}. Mon objectif est de devenir ${targetRole}. J'ai ${availableHours}h par semaine et je veux un rythme ${preferredPace === "INTENSIVE" ? "intensif" : preferredPace === "RELAXED" ? "relaxé" : "modéré"}. Crée-moi un plan d'action concret semaine par semaine pour les 4 prochaines semaines.`,
    color: "text-primary",
  });

  // 2. Combler le premier skill gap
  if (skillGaps.length > 0) {
    const gap = skillGaps[0];
    suggestions.push({
      icon: "BookOpen",
      label: `Apprendre ${gap}`,
      prompt: `Je dois monter en compétence sur "${gap}" pour atteindre mon objectif de ${targetRole}. Mes compétences actuelles sont : ${topSkills.slice(0, 5).join(", ")}. Mon budget est ${onboarding?.trainingBudget || "limité"} et j'ai ${availableHours}h/semaine. Recommande-moi un parcours d'apprentissage concret : cours spécifiques, exercices, projets, avec une timeline.`,
      color: "text-blue-400",
    });
  } else {
    suggestions.push({
      icon: "BookOpen",
      label: "Formations recommandées",
      prompt: `Quelles formations spécifiques me recommandes-tu pour devenir ${targetRole} ? Je suis ${currentRole} dans le secteur ${currentSector}. Donne-moi des noms de cours, plateformes et durées.`,
      color: "text-blue-400",
    });
  }

  // 3. Débloquer le premier frein
  if (blockers.length > 0) {
    const firstBlocker = blockers[0];
    suggestions.push({
      icon: "Shield",
      label: `Surmonter : ${firstBlocker.substring(0, 30)}${firstBlocker.length > 30 ? "..." : ""}`,
      prompt: `Mon principal frein est "${firstBlocker}". ${blockers.length > 1 ? `J'ai aussi : ${blockers.slice(1).join(", ")}.` : ""} Ma confiance est à ${confidenceLevel}/10. Aide-moi à transformer ce frein en levier avec des actions concrètes que je peux faire cette semaine.`,
      color: "text-amber-400",
    });
  } else {
    suggestions.push({
      icon: "Shield",
      label: "Accélérer ma transition",
      prompt: `Je n'ai pas de frein majeur identifié et ma confiance est à ${confidenceLevel}/10. Comment puis-je accélérer ma transition vers ${targetRole} ? Donne-moi des actions ambitieuses.`,
      color: "text-amber-400",
    });
  }

  // 4. Entretien pour le rôle cible
  suggestions.push({
    icon: "Briefcase",
    label: `Entretien ${targetRole}`,
    prompt: `Prépare-moi pour un entretien de ${targetRole} dans le secteur ${onboarding?.targetSector || currentSector}. Je viens de ${currentRole} (${currentSector}, ${onboarding?.experienceYears ?? "quelques"} ans). Quelles questions techniques et comportementales vais-je avoir ? Comment valoriser mon parcours non-linéaire ?`,
    color: "text-emerald-400",
  });

  // 5. Projet portfolio adapté
  suggestions.push({
    icon: "Zap",
    label: `Projet portfolio ${currentSector}`,
    prompt: `Propose-moi une idée de projet portfolio qui combine mon expertise en ${currentSector} (${currentRole}) avec la data/IA. Je maîtrise : ${topSkills.slice(0, 5).join(", ")}. Le projet doit être réalisable en ${availableHours}h/semaine sur 2-3 semaines et impressionner un recruteur ${targetRole}.`,
    color: "text-purple-400",
  });

  // 6. Optimiser LinkedIn
  suggestions.push({
    icon: "Lightbulb",
    label: "Optimiser mon LinkedIn",
    prompt: `Aide-moi à optimiser mon profil LinkedIn pour attirer les recruteurs qui cherchent un ${targetRole}. Mon parcours : ${currentRole} dans ${currentSector} depuis ${onboarding?.experienceYears ?? "quelques"} ans, compétences : ${topSkills.slice(0, 5).join(", ")}. Quel titre, résumé et mots-clés utiliser ?`,
    color: "text-orange-400",
  });

  return suggestions;
}

export default async function AgentsPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  const suggestions = buildSuggestions(data);

  return <CopilotChat suggestions={suggestions} userName={data.user.firstName} />;
}
