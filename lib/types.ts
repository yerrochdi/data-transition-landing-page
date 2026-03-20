// ============================================================
// NextMove AI — Core Type Definitions
// ============================================================

// --- User & Profile ---
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  currentRole: string;
  currentCompany: string;
  targetRole: string;
  targetSector: string;
  experienceYears: number;
  plan: "free" | "premium" | "enterprise";
  joinedAt: string;
  onboardingCompleted: boolean;
}

// --- Onboarding ---
export type OnboardingStepId =
  | "situation"
  | "role"
  | "ambitions"
  | "skills"
  | "blockers"
  | "confidence"
  | "goals"
  | "summary";

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
}

export interface OnboardingResponse {
  situation: string;
  currentRole: string;
  currentSector: string;
  experienceYears: number;
  targetRole: string;
  targetSector: string;
  topSkills: string[];
  skillGaps: string[];
  blockers: string[];
  confidenceLevel: number; // 1-10
  shortTermGoal: string;
  longTermGoal: string;
  preferredPace: "relaxed" | "moderate" | "intensive";
}

// --- Journey / Parcours ---
export type PhaseStatus = "completed" | "active" | "locked";

export interface JourneyTask {
  id: string;
  title: string;
  description: string;
  status: "done" | "in_progress" | "locked";
  progress?: number; // 0-100 for in_progress
}

export interface JourneyPhaseModule {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

export interface JourneyPhase {
  id: string;
  number: string;
  title: string;
  description: string;
  status: PhaseStatus;
  progress?: number;
  modules: JourneyPhaseModule[];
  tasks: JourneyTask[];
}

// --- Agents ---
export type AgentStatus = "active" | "idle" | "working" | "unavailable";

export interface AgentCapability {
  id: string;
  label: string;
  description: string;
}

export interface AgentAction {
  id: string;
  label: string;
  icon: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
  status: AgentStatus;
  capabilities: AgentCapability[];
  quickActions: AgentAction[];
  lastActivity?: string;
  insightCount?: number;
}

export interface AgentMessage {
  id: string;
  agentId: string;
  content: string;
  timestamp: string;
  type: "insight" | "suggestion" | "question" | "action" | "summary";
}

// --- Opportunities ---
export type OpportunityType = "job" | "freelance" | "transition" | "formation";

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: OpportunityType;
  matchScore: number; // 0-100
  salary?: string;
  tags: string[];
  description: string;
  postedAt: string;
  aiReason: string;
  remote: boolean;
  isBookmarked: boolean;
}

// --- Analytics ---
export interface SkillProgress {
  name: string;
  current: number;
  target: number;
  category: string;
}

export interface WeeklyActivity {
  week: string;
  tasksCompleted: number;
  hoursSpent: number;
  agentInteractions: number;
}

export interface AnalyticsData {
  overallProgress: number;
  careerScore: number;
  careerScoreDelta: number;
  completedPhases: number;
  totalPhases: number;
  skillProgress: SkillProgress[];
  weeklyActivity: WeeklyActivity[];
  readinessScore: number;
  blockerCount: number;
  streakDays: number;
  totalTasksCompleted: number;
  totalTasksRemaining: number;
}

// --- Resources ---
export type ResourceType = "article" | "guide" | "video" | "template" | "case_study";

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  imageUrl?: string;
  readTime?: string;
  author?: string;
  isNew: boolean;
  url: string;
}

// --- Admin ---
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  progress: number;
  joinedAt: string;
  lastActive: string;
  status: "active" | "inactive" | "onboarding";
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  avgProgress: number;
  newUsersThisWeek: number;
  agentInteractionsToday: number;
}

// --- Dashboard ---
export interface DashboardRecommendation {
  id: string;
  agentId: string;
  agentName: string;
  agentIcon: string;
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  priority: "high" | "medium" | "low";
}

export interface DashboardActivity {
  id: string;
  type: "agent" | "task" | "opportunity" | "milestone";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

// --- Navigation ---
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}
