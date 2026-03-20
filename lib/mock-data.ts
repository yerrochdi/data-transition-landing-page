import type {
  UserProfile,
  OnboardingStep,
  JourneyPhase,
  Agent,
  AgentMessage,
  Opportunity,
  AnalyticsData,
  Resource,
  AdminUser,
  AdminStats,
  DashboardRecommendation,
  DashboardActivity,
  NavItem,
} from "./types";

// ============================================================
// User
// ============================================================
export const mockUser: UserProfile = {
  id: "u-001",
  firstName: "Yassine",
  lastName: "E.",
  email: "yassine@example.com",
  avatarUrl: "/avatar-placeholder.png",
  currentRole: "AMOA / Chef de projet IT",
  currentCompany: "Capgemini",
  targetRole: "Principal Technical Architect",
  targetSector: "FinTech",
  experienceYears: 8,
  plan: "premium",
  joinedAt: "2025-12-10",
  onboardingCompleted: true,
};

// ============================================================
// Navigation
// ============================================================
export const sidebarNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Immersive Path", href: "/journey", icon: "GitBranch" },
  { label: "Skill Roadmap", href: "/analytics", icon: "TrendingUp" },
  { label: "Job Market", href: "/opportunities", icon: "Briefcase" },
];

export const topNav: NavItem[] = [
  { label: "Path", href: "/journey", icon: "GitBranch" },
  { label: "Market", href: "/opportunities", icon: "Briefcase" },
  { label: "Feed", href: "/resources", icon: "Rss" },
];

export const mobileNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: "Home" },
  { label: "AI Agent", href: "/agents", icon: "Bot" },
  { label: "Path", href: "/journey", icon: "GitBranch" },
  { label: "Market", href: "/opportunities", icon: "Briefcase" },
  { label: "Feed", href: "/resources", icon: "Rss" },
];

// ============================================================
// Onboarding Steps
// ============================================================
export const onboardingSteps: OnboardingStep[] = [
  { id: "situation", title: "Situation actuelle", description: "Décrivez votre contexte professionnel", icon: "User", completed: false },
  { id: "role", title: "Métier & Secteur", description: "Votre rôle actuel et secteur d'activité", icon: "Briefcase", completed: false },
  { id: "ambitions", title: "Ambitions", description: "Où souhaitez-vous aller ?", icon: "Target", completed: false },
  { id: "skills", title: "Compétences", description: "Vos forces et axes de progression", icon: "Zap", completed: false },
  { id: "blockers", title: "Freins", description: "Ce qui vous retient aujourd'hui", icon: "Shield", completed: false },
  { id: "confidence", title: "Confiance", description: "Votre niveau de confiance actuel", icon: "Heart", completed: false },
  { id: "goals", title: "Objectifs", description: "Court et moyen terme", icon: "Flag", completed: false },
  { id: "summary", title: "Synthèse IA", description: "Votre profil analysé par l'IA", icon: "Sparkles", completed: false },
];

// ============================================================
// Journey Phases
// ============================================================
export const journeyPhases: JourneyPhase[] = [
  {
    id: "diagnostic",
    number: "01",
    title: "Diagnostic",
    description: "Comprehensive assessment of your current professional profile.",
    status: "completed",
    progress: 100,
    modules: [
      { id: "m1", icon: "Brain", title: "Skill Analysis", subtitle: "Validated 12 Core Competencies" },
      { id: "m2", icon: "BarChart3", title: "Gap Report", subtitle: "3 Critical Gaps Identified" },
      { id: "m3", icon: "ShieldCheck", title: "Baseline", subtitle: "Career Score: 780/1000" },
    ],
    tasks: [],
  },
  {
    id: "vision",
    number: "02",
    title: "Vision",
    description: "Defining your target career architecture.",
    status: "completed",
    progress: 100,
    modules: [
      { id: "m4", icon: "Rocket", title: "Architectural Outcome", subtitle: "Principal Technical Architect (FinTech focus)" },
    ],
    tasks: [],
  },
  {
    id: "positionnement",
    number: "03",
    title: "Positionnement",
    description: "Refining your narrative and market placement.",
    status: "active",
    progress: 64,
    modules: [],
    tasks: [
      { id: "t1", title: "Personal Brand Logic", description: "Defining your unique 'Architect' USP for the hiring market.", status: "done" },
      { id: "t2", title: "Target Entity Mapping", description: "Identifying top-tier companies matching your architectural profile.", status: "in_progress", progress: 64 },
      { id: "t3", title: "Narrative Pitch Simulation", description: "AI-powered interview simulation (Unlock at 100% Target Mapping).", status: "locked" },
    ],
  },
  {
    id: "execution",
    number: "04",
    title: "Execution",
    description: "Strategic application and offer negotiation protocols.",
    status: "locked",
    modules: [],
    tasks: [],
  },
  {
    id: "acceleration",
    number: "05",
    title: "Accélération",
    description: "First 90 days mastery and long-term career velocity.",
    status: "locked",
    modules: [],
    tasks: [],
  },
];

// ============================================================
// Agents
// ============================================================
export const agents: Agent[] = [
  {
    id: "career-coach",
    name: "Career Coach",
    role: "Strategic Career Advisor",
    description: "Your dedicated AI career strategist. Analyzes your profile, identifies optimal paths, and provides tailored guidance for your professional evolution.",
    icon: "Brain",
    color: "#4be277",
    status: "active",
    capabilities: [
      { id: "c1", label: "Career Path Analysis", description: "Maps potential career trajectories based on your profile" },
      { id: "c2", label: "Decision Framework", description: "Helps you evaluate career options systematically" },
      { id: "c3", label: "Goal Setting", description: "Creates actionable milestones for your transition" },
    ],
    quickActions: [
      { id: "a1", label: "Review my progress", icon: "TrendingUp" },
      { id: "a2", label: "Suggest next step", icon: "ArrowRight" },
      { id: "a3", label: "Analyze blockers", icon: "AlertTriangle" },
    ],
    lastActivity: "Il y a 2 heures",
    insightCount: 12,
  },
  {
    id: "strategist",
    name: "Strategist",
    role: "Market Intelligence Analyst",
    description: "Scans the market landscape, identifies trends, and positions you for maximum impact in your target sector.",
    icon: "Target",
    color: "#0566d9",
    status: "working",
    capabilities: [
      { id: "c4", label: "Market Trends", description: "Real-time analysis of your target sector dynamics" },
      { id: "c5", label: "Competitive Positioning", description: "How you stack up against typical candidates" },
      { id: "c6", label: "Timing Optimization", description: "Best windows for career moves" },
    ],
    quickActions: [
      { id: "a4", label: "Market snapshot", icon: "BarChart3" },
      { id: "a5", label: "Competitor analysis", icon: "Users" },
    ],
    lastActivity: "Active maintenant",
    insightCount: 8,
  },
  {
    id: "opportunity-scout",
    name: "Opportunity Scout",
    role: "Opportunity Discovery Engine",
    description: "Continuously monitors job markets, freelance platforms, and hidden opportunities matching your profile.",
    icon: "Search",
    color: "#d1bdff",
    status: "active",
    capabilities: [
      { id: "c7", label: "Job Matching", description: "AI-powered matching with 95%+ accuracy" },
      { id: "c8", label: "Hidden Market", description: "Access to unadvertised positions" },
      { id: "c9", label: "Alert System", description: "Real-time notifications for high-match opportunities" },
    ],
    quickActions: [
      { id: "a6", label: "Show top matches", icon: "Star" },
      { id: "a7", label: "Scan new listings", icon: "RefreshCw" },
    ],
    lastActivity: "Il y a 30 min",
    insightCount: 24,
  },
  {
    id: "cv-optimizer",
    name: "CV & LinkedIn Optimizer",
    role: "Personal Branding Specialist",
    description: "Optimizes your CV, LinkedIn profile, and professional narrative to maximize visibility and impact.",
    icon: "FileText",
    color: "#22c55e",
    status: "idle",
    capabilities: [
      { id: "c10", label: "CV Scoring", description: "ATS compatibility analysis and optimization" },
      { id: "c11", label: "LinkedIn Enhancement", description: "Profile optimization for recruiter discovery" },
      { id: "c12", label: "Narrative Crafting", description: "Compelling professional story creation" },
    ],
    quickActions: [
      { id: "a8", label: "Score my CV", icon: "FileCheck" },
      { id: "a9", label: "Optimize LinkedIn", icon: "Linkedin" },
    ],
    lastActivity: "Il y a 1 jour",
    insightCount: 6,
  },
  {
    id: "mindset-coach",
    name: "Mindset Coach",
    role: "Performance & Confidence Advisor",
    description: "Helps you overcome mental blockers, build confidence, and maintain momentum throughout your transition.",
    icon: "Heart",
    color: "#f59e0b",
    status: "idle",
    capabilities: [
      { id: "c13", label: "Confidence Building", description: "Exercises to strengthen your professional confidence" },
      { id: "c14", label: "Blocker Resolution", description: "Identify and overcome mental barriers" },
      { id: "c15", label: "Motivation Tracking", description: "Monitor energy levels and adjust pace" },
    ],
    quickActions: [
      { id: "a10", label: "Quick check-in", icon: "MessageCircle" },
      { id: "a11", label: "Confidence boost", icon: "Zap" },
    ],
    lastActivity: "Il y a 3 jours",
    insightCount: 4,
  },
  {
    id: "copilot",
    name: "NextMove Copilot",
    role: "Global Orchestrator",
    description: "Your central AI companion. Coordinates all specialized agents, synthesizes insights, and keeps your transition on track.",
    icon: "Sparkles",
    color: "#4be277",
    status: "active",
    capabilities: [
      { id: "c16", label: "Cross-Agent Synthesis", description: "Unified view from all specialized agents" },
      { id: "c17", label: "Priority Management", description: "Smart task prioritization based on context" },
      { id: "c18", label: "Proactive Nudges", description: "Contextual suggestions at the right moment" },
    ],
    quickActions: [
      { id: "a12", label: "Daily briefing", icon: "Sun" },
      { id: "a13", label: "What should I do next?", icon: "HelpCircle" },
      { id: "a14", label: "Weekly summary", icon: "Calendar" },
    ],
    lastActivity: "Active maintenant",
    insightCount: 31,
  },
];

// ============================================================
// Agent Messages (for chat / insight panels)
// ============================================================
export const agentMessages: AgentMessage[] = [
  { id: "msg1", agentId: "copilot", content: "Bonjour Yassine ! Votre progression est solide cette semaine. Le Strategist a identifié 3 nouvelles opportunités dans la FinTech. Je vous recommande de terminer le Target Entity Mapping aujourd'hui pour débloquer la simulation de pitch.", timestamp: "2026-03-20T09:00:00Z", type: "summary" },
  { id: "msg2", agentId: "career-coach", content: "Votre profil AMOA/IT est un atout sous-estimé pour le rôle d'Architect. Les recruteurs FinTech valorisent de plus en plus les profils hybrides business+tech.", timestamp: "2026-03-20T08:30:00Z", type: "insight" },
  { id: "msg3", agentId: "opportunity-scout", content: "Nouvelle opportunité détectée : Principal Architect chez Qonto — match 92%. La fiche correspond à votre profil sur 8/10 critères.", timestamp: "2026-03-20T07:45:00Z", type: "suggestion" },
  { id: "msg4", agentId: "strategist", content: "Le marché FinTech montre une hausse de 18% des postes d'architecture technique en Q1 2026. Fenêtre optimale pour positionner votre candidature.", timestamp: "2026-03-19T16:00:00Z", type: "insight" },
  { id: "msg5", agentId: "mindset-coach", content: "Votre niveau de confiance a progressé de 6/10 à 7.5/10 depuis le début du parcours. Continuez à capitaliser sur vos succès récents.", timestamp: "2026-03-19T10:00:00Z", type: "insight" },
];

// ============================================================
// Opportunities
// ============================================================
export const opportunities: Opportunity[] = [
  {
    id: "opp1",
    title: "Principal Technical Architect",
    company: "Qonto",
    location: "Paris, France",
    type: "job",
    matchScore: 92,
    salary: "95-120K€",
    tags: ["FinTech", "Architecture", "Microservices", "AWS"],
    description: "Lead the technical architecture of Qonto's next-generation banking platform.",
    postedAt: "2026-03-18",
    aiReason: "Match excellent : votre expertise AMOA + vos compétences techniques couvrent 8/10 critères requis. Le focus FinTech correspond parfaitement à votre objectif.",
    remote: true,
    isBookmarked: true,
  },
  {
    id: "opp2",
    title: "Solutions Architect — Data Platform",
    company: "Datadog",
    location: "Paris, France",
    type: "job",
    matchScore: 87,
    salary: "90-115K€",
    tags: ["Data", "Cloud", "Architecture", "SaaS"],
    description: "Design and implement scalable data architecture solutions for enterprise clients.",
    postedAt: "2026-03-17",
    aiReason: "Forte correspondance avec votre profil data/IT. L'expérience AMOA est un différenciateur clé pour ce rôle client-facing.",
    remote: true,
    isBookmarked: false,
  },
  {
    id: "opp3",
    title: "Freelance — Architecture Conseil FinTech",
    company: "Revolut",
    location: "Remote",
    type: "freelance",
    matchScore: 85,
    salary: "700-900€/jour",
    tags: ["FinTech", "Conseil", "Architecture", "Remote"],
    description: "Mission de conseil en architecture technique pour la refonte du système de paiement.",
    postedAt: "2026-03-16",
    aiReason: "Mission freelance idéale pour tester le marché avant un engagement permanent. Correspond à votre cible FinTech.",
    remote: true,
    isBookmarked: false,
  },
  {
    id: "opp4",
    title: "Lead Architect — Digital Banking",
    company: "BNP Paribas",
    location: "Paris, France",
    type: "job",
    matchScore: 78,
    salary: "85-105K€",
    tags: ["Banking", "Architecture", "Transformation"],
    description: "Piloter la transformation digitale de l'architecture bancaire.",
    postedAt: "2026-03-15",
    aiReason: "Environnement plus corporate mais transition douce depuis votre profil actuel. Bonne option de sécurité.",
    remote: false,
    isBookmarked: false,
  },
  {
    id: "opp5",
    title: "Formation — AWS Solutions Architect Professional",
    company: "AWS Training",
    location: "Online",
    type: "formation",
    matchScore: 95,
    salary: undefined,
    tags: ["Certification", "AWS", "Architecture", "Cloud"],
    description: "Certification professionnelle pour renforcer votre crédibilité technique.",
    postedAt: "2026-03-14",
    aiReason: "Gap critique identifié : la certification AWS SAP comblerait votre principale lacune technique et boosterait votre score de 780 à ~850.",
    remote: true,
    isBookmarked: true,
  },
];

// ============================================================
// Analytics
// ============================================================
export const analyticsData: AnalyticsData = {
  overallProgress: 64,
  careerScore: 780,
  careerScoreDelta: 45,
  completedPhases: 2,
  totalPhases: 5,
  skillProgress: [
    { name: "System Architecture", current: 82, target: 95, category: "Technical" },
    { name: "Cloud (AWS/GCP)", current: 55, target: 90, category: "Technical" },
    { name: "Microservices Design", current: 70, target: 85, category: "Technical" },
    { name: "Leadership & Communication", current: 88, target: 90, category: "Soft Skills" },
    { name: "Strategic Thinking", current: 75, target: 85, category: "Soft Skills" },
    { name: "FinTech Domain Knowledge", current: 45, target: 80, category: "Domain" },
    { name: "Interview & Pitching", current: 50, target: 85, category: "Career" },
    { name: "Personal Branding", current: 60, target: 80, category: "Career" },
  ],
  weeklyActivity: [
    { week: "S1", tasksCompleted: 3, hoursSpent: 4, agentInteractions: 8 },
    { week: "S2", tasksCompleted: 5, hoursSpent: 6, agentInteractions: 12 },
    { week: "S3", tasksCompleted: 4, hoursSpent: 5, agentInteractions: 15 },
    { week: "S4", tasksCompleted: 7, hoursSpent: 8, agentInteractions: 18 },
    { week: "S5", tasksCompleted: 6, hoursSpent: 7, agentInteractions: 22 },
    { week: "S6", tasksCompleted: 8, hoursSpent: 9, agentInteractions: 25 },
  ],
  readinessScore: 64,
  blockerCount: 2,
  streakDays: 12,
  totalTasksCompleted: 18,
  totalTasksRemaining: 14,
};

// ============================================================
// Resources
// ============================================================
export const resources: Resource[] = [
  { id: "r1", title: "De Chef de Projet à Solutions Architect : le guide complet", description: "Découvrez les étapes clés pour réussir votre transition vers un rôle d'architecte.", type: "guide", category: "Transition", readTime: "12 min", isNew: true, url: "#" },
  { id: "r2", title: "Les 10 compétences les plus demandées en FinTech 2026", description: "Analyse du marché et des skills qui font la différence.", type: "article", category: "Marché", readTime: "8 min", isNew: true, url: "#" },
  { id: "r3", title: "Réussir son pitch en entretien technique", description: "Comment présenter votre parcours de transition de manière convaincante.", type: "video", category: "Interview", readTime: "25 min", isNew: false, url: "#" },
  { id: "r4", title: "Template CV — Architecte Technique", description: "Un template optimisé ATS pour les rôles d'architecture.", type: "template", category: "Personal Branding", isNew: false, url: "#" },
  { id: "r5", title: "Sarah M. — De Business Analyst à Lead Architect en 18 mois", description: "Retour d'expérience inspirant d'une transition réussie.", type: "case_study", category: "Success Stories", readTime: "10 min", isNew: false, url: "#" },
  { id: "r6", title: "Comprendre les patterns d'architecture microservices", description: "Les fondamentaux pour parler architecture avec crédibilité.", type: "guide", category: "Technical", readTime: "20 min", isNew: false, url: "#" },
];

// ============================================================
// Admin
// ============================================================
export const adminUsers: AdminUser[] = [
  { id: "u-001", name: "Yassine E.", email: "yassine@example.com", plan: "Premium", progress: 64, joinedAt: "2025-12-10", lastActive: "2026-03-20", status: "active" },
  { id: "u-002", name: "Marie L.", email: "marie@example.com", plan: "Premium", progress: 82, joinedAt: "2025-11-05", lastActive: "2026-03-20", status: "active" },
  { id: "u-003", name: "Thomas K.", email: "thomas@example.com", plan: "Free", progress: 25, joinedAt: "2026-01-15", lastActive: "2026-03-18", status: "active" },
  { id: "u-004", name: "Amina B.", email: "amina@example.com", plan: "Premium", progress: 91, joinedAt: "2025-09-20", lastActive: "2026-03-20", status: "active" },
  { id: "u-005", name: "Lucas D.", email: "lucas@example.com", plan: "Free", progress: 10, joinedAt: "2026-03-01", lastActive: "2026-03-15", status: "onboarding" },
  { id: "u-006", name: "Sophie R.", email: "sophie@example.com", plan: "Enterprise", progress: 55, joinedAt: "2026-02-01", lastActive: "2026-03-10", status: "inactive" },
];

export const adminStats: AdminStats = {
  totalUsers: 156,
  activeUsers: 124,
  premiumUsers: 89,
  avgProgress: 58,
  newUsersThisWeek: 12,
  agentInteractionsToday: 342,
};

// ============================================================
// Dashboard
// ============================================================
export const dashboardRecommendations: DashboardRecommendation[] = [
  { id: "rec1", agentId: "copilot", agentName: "NextMove Copilot", agentIcon: "Sparkles", title: "Terminez le Target Entity Mapping", description: "Vous êtes à 64%. Finir cette étape débloquera la simulation de pitch IA.", actionLabel: "Reprendre", actionUrl: "/journey", priority: "high" },
  { id: "rec2", agentId: "opportunity-scout", agentName: "Opportunity Scout", agentIcon: "Search", title: "Nouvelle opportunité : Qonto", description: "Match à 92% — Principal Technical Architect. À examiner en priorité.", actionLabel: "Voir l'offre", actionUrl: "/opportunities", priority: "high" },
  { id: "rec3", agentId: "cv-optimizer", agentName: "CV Optimizer", agentIcon: "FileText", title: "Optimisez votre LinkedIn", description: "Votre profil LinkedIn pourrait être amélioré pour mieux cibler les recruteurs FinTech.", actionLabel: "Lancer l'analyse", actionUrl: "/agents", priority: "medium" },
];

export const dashboardActivities: DashboardActivity[] = [
  { id: "act1", type: "agent", title: "Copilot — Briefing quotidien", description: "Votre synthèse du jour est prête.", timestamp: "Il y a 1h", icon: "Sparkles" },
  { id: "act2", type: "opportunity", title: "Nouvelle offre détectée", description: "Principal Architect chez Qonto — 92% match", timestamp: "Il y a 2h", icon: "Briefcase" },
  { id: "act3", type: "task", title: "Personal Brand Logic — terminé", description: "Phase Positionnement : étape validée", timestamp: "Hier", icon: "CheckCircle" },
  { id: "act4", type: "milestone", title: "Phase Vision complétée", description: "Objectif cible défini : Principal Technical Architect", timestamp: "Il y a 3 jours", icon: "Trophy" },
  { id: "act5", type: "agent", title: "Strategist — Analyse marché", description: "+18% de postes architecture en FinTech Q1 2026", timestamp: "Il y a 3 jours", icon: "TrendingUp" },
];
