"use client";

/**
 * Sprint 3A — Module Ikigai PASSION : "ce que vous AIMEZ".
 * On va creuser les sources d'énergie intrinsèques de la personne.
 */
import { Flame } from "lucide-react";
import type { OnboardingFormData } from "@/lib/onboarding/types";
import { IkigaiModule } from "./ikigai-module";

interface StepIkigaiPassionProps {
  formData: OnboardingFormData;
  onChange: (value: string) => void;
  onInsightChange: (insight: string) => void;
}

export function StepIkigaiPassion({
  formData,
  onChange,
  onInsightChange,
}: StepIkigaiPassionProps) {
  return (
    <IkigaiModule
      step="passion"
      introIcon={Flame}
      introTitle="Ce qui vous AIME — votre source d'énergie"
      introBody="Avant de parler stratégie ou marché, on commence par vous. Le sweet spot Ikigai démarre toujours par ce qui vous nourrit, pas par ce qui vous rapporte."
      question="À quel moment de votre vie professionnelle vous êtes-vous senti·e le plus vivant·e, le plus engagé·e ? Décrivez 1 ou 2 souvenirs précis — un projet, une mission, un moment particulier."
      placeholder="Ex : Quand j'ai accompagné notre équipe RH dans la refonte du parcours d'intégration. Je passais des nuits dessus mais ça ne me pesait pas — j'avais l'impression de construire quelque chose d'utile, de voir la différence sur les nouveaux arrivants. Le moment où la première RH m'a dit « ça change tout » est encore vivace."
      value={formData.ikigai.passion.userText}
      aiInsight={formData.ikigai.passion.aiInsight}
      formData={formData}
      onChange={onChange}
      onInsightChange={onInsightChange}
      minCharsForAi={60}
    />
  );
}
