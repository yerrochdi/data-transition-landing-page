import type { OnboardingFormData, SkillWithLevel } from "@/lib/onboarding/types";

/**
 * Compute a career readiness score (0-100) based on onboarding data.
 * Measures how ready someone is to transition into data/IA.
 */
export function computeReadinessScore(data: OnboardingFormData): number {
  let score = 0;

  // Experience (max 15pts) — more experience = more transferable skills
  const years = data.experienceYears ?? 0;
  if (years >= 10) score += 15;
  else if (years >= 5) score += 12;
  else if (years >= 2) score += 8;
  else score += 4;

  // Education (max 10pts)
  const edu = (data.educationLevel || "").toLowerCase();
  if (edu.includes("bac+5") || edu.includes("master") || edu.includes("ingénieur")) score += 10;
  else if (edu.includes("bac+3") || edu.includes("licence")) score += 7;
  else if (edu.includes("bac+2")) score += 5;
  else if (edu.includes("bac")) score += 3;
  else score += 2; // autodidacte

  // Data experience (max 10pts)
  if (data.hasDataTraining) score += 10;

  // Certifications (max 10pts)
  const certs = data.certifications?.length ?? 0;
  score += Math.min(certs * 3, 10);

  // Skills depth (max 15pts) — based on actual skill levels
  const levels = data.skillLevels || [];
  if (levels.length > 0) {
    const levelScores: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const avgLevel = levels.reduce((sum, s) => sum + (levelScores[s.level] || 1), 0) / levels.length;
    score += Math.round(Math.min(avgLevel * 3.75, 15));
  } else {
    score += Math.min((data.topSkills?.length ?? 0) * 2, 10);
  }

  // Motivation clarity (max 10pts)
  if (data.motivation) score += 3;
  if (data.keyAchievements && data.keyAchievements.length > 20) score += 4;
  if (data.dreamScenario && data.dreamScenario.length > 10) score += 3;

  // Goals clarity (max 10pts)
  if (data.targetRole) score += 3;
  if (data.shortTermGoal) score += 3;
  if (data.longTermGoal) score += 2;
  if (data.targetSector) score += 2;

  // Resources & commitment (max 10pts)
  const hours = data.availableHoursPerWeek ?? 0;
  if (hours >= 15) score += 5;
  else if (hours >= 8) score += 4;
  else if (hours >= 3) score += 2;
  else score += 1;

  const budget = data.trainingBudget || "none";
  if (budget === "high") score += 5;
  else if (budget === "medium") score += 4;
  else if (budget === "low") score += 2;
  else score += 1;

  // Confidence (max 5pts) — higher confidence = more likely to act
  const conf = data.confidenceLevel ?? 5;
  score += Math.round(conf / 2);

  // Fewer blockers = better (max 5pts)
  const blockerCount = data.blockers?.length ?? 0;
  if (blockerCount === 0) score += 5;
  else if (blockerCount <= 2) score += 3;
  else score += 1;

  return Math.min(score, 100);
}

/**
 * Compute a career score (0-1000) — represents overall transition potential.
 * This is the main "gamified" score users see.
 */
export function computeCareerScore(data: OnboardingFormData, readinessScore: number): number {
  // Base: readiness * 6 (max 600pts from readiness)
  let score = readinessScore * 6;

  // Bonus: experience depth (max 150pts)
  const years = data.experienceYears ?? 0;
  score += Math.min(years * 12, 150);

  // Bonus: skill count & diversity (max 100pts)
  const skillCount = data.topSkills?.length ?? 0;
  score += Math.min(skillCount * 12, 100);

  // Bonus: completed profile richness (max 100pts)
  let richness = 0;
  if (data.location) richness += 10;
  if (data.remotePreference) richness += 10;
  if (data.learningStyle?.length) richness += 15;
  if (data.priorities?.length) richness += 15;
  if (data.keyAchievements && data.keyAchievements.length > 50) richness += 25;
  if (data.dreamScenario && data.dreamScenario.length > 20) richness += 25;
  score += richness;

  // Bonus: pace commitment (max 50pts)
  const pace = (data.preferredPace || "moderate").toLowerCase();
  if (pace === "intensive") score += 50;
  else if (pace === "moderate") score += 30;
  else score += 15;

  return Math.min(Math.round(score), 1000);
}

/**
 * Extract skill gaps from onboarding data — skills the user should acquire.
 */
export function computeSkillGaps(data: OnboardingFormData): string[] {
  const gaps: string[] = [];
  const existingSkills = new Set((data.topSkills || []).map(s => s.toLowerCase()));
  const levels = data.skillLevels || [];
  const levelMap = new Map<string, string>();
  for (const sl of levels) {
    levelMap.set(sl.name.toLowerCase(), sl.level);
  }

  // Core data skills everyone needs
  const coreDataSkills = [
    { name: "SQL", key: "sql" },
    { name: "Python", key: "python" },
    { name: "Data Visualization", key: "data visualization" },
    { name: "Excel avancé", key: "excel" },
    { name: "Statistiques", key: "statistiques" },
  ];

  for (const skill of coreDataSkills) {
    const hasSkill = existingSkills.has(skill.key) ||
      [...existingSkills].some(s => s.includes(skill.key));
    const level = levelMap.get(skill.key);

    if (!hasSkill) {
      gaps.push(skill.name);
    } else if (level === "beginner") {
      gaps.push(`${skill.name} (approfondir)`);
    }
  }

  // Role-specific gaps
  const target = (data.targetRole || "").toLowerCase();
  if (target.includes("analyst") && !existingSkills.has("power bi") && !existingSkills.has("tableau")) {
    gaps.push("Power BI ou Tableau");
  }
  if (target.includes("data scientist") || target.includes("machine learning")) {
    if (!existingSkills.has("machine learning")) gaps.push("Machine Learning");
  }
  if (target.includes("product") || target.includes("manager")) {
    if (!existingSkills.has("product management")) gaps.push("Product Analytics");
  }

  return gaps.slice(0, 5); // Max 5 gaps
}
