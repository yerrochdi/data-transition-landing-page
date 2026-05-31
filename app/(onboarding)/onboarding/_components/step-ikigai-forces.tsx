"use client";

/**
 * Sprint 3B — Module Ikigai FORCES : "ce dans quoi vous êtes DOUÉE".
 * On creuse les forces VUES PAR LES AUTRES (pas auto-déclarées).
 * C'est la dimension la plus contre-intuitive de l'Ikigai : les gens
 * sous-estiment systématiquement ce qu'ils font de manière "évidente".
 */
import { Zap } from "lucide-react";
import type { OnboardingFormData } from "@/lib/onboarding/types";
import { IkigaiModule } from "./ikigai-module";

interface StepIkigaiForcesProps {
  formData: OnboardingFormData;
  onChange: (value: string) => void;
  onInsightChange: (insight: string) => void;
}

export function StepIkigaiForces({
  formData,
  onChange,
  onInsightChange,
}: StepIkigaiForcesProps) {
  return (
    <IkigaiModule
      step="forces"
      introIcon={Zap}
      introTitle="Vos forces réelles — vues par les autres"
      introBody="Les gens sous-estiment systématiquement ce qu'ils font de manière 'évidente'. Ce qui vous semble naturel est souvent ce qui fait votre valeur unique."
      question="De quoi vos collègues, managers ou clients vous remercient le plus souvent ? Sur quoi êtes-vous habituellement consulté·e ? Quel·s talent·s on vous reconnaît même si vous trouvez ça anodin ?"
      placeholder="Ex : Mes collègues me consultent souvent pour clarifier des processus complexes. Mon manager m'a dit récemment que je 'rends simple ce qui est embrouillé'. En atelier, les gens repartent avec un cap clair — alors que pour moi c'est juste de la mise en ordre."
      value={formData.ikigai.forces.userText}
      aiInsight={formData.ikigai.forces.aiInsight}
      formData={formData}
      onChange={onChange}
      onInsightChange={onInsightChange}
      minCharsForAi={60}
      suggestions={[
        "On me consulte pour clarifier ce qui est confus",
        "On me remercie pour ma rigueur et ma fiabilité",
        "On me dit que je sais expliquer simplement",
        "On compte sur moi pour faire avancer les projets",
        "On apprécie ma capacité à fédérer les gens",
      ]}
    />
  );
}
