import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding NextMove database...");

  // ============================================================
  // Journey Phases
  // ============================================================
  const phases = [
    {
      slug: "diagnostic",
      number: "01",
      title: "Diagnostic",
      description: "Comprehensive assessment of your current professional profile.",
      order: 1,
    },
    {
      slug: "vision",
      number: "02",
      title: "Vision",
      description: "Defining your target career architecture.",
      order: 2,
    },
    {
      slug: "positionnement",
      number: "03",
      title: "Positionnement",
      description: "Refining your narrative and market placement.",
      order: 3,
    },
    {
      slug: "execution",
      number: "04",
      title: "Execution",
      description: "Strategic application and offer negotiation protocols.",
      order: 4,
    },
    {
      slug: "acceleration",
      number: "05",
      title: "Accélération",
      description: "First 90 days mastery and long-term career velocity.",
      order: 5,
    },
  ];

  for (const phase of phases) {
    await prisma.journeyPhase.upsert({
      where: { slug: phase.slug },
      update: phase,
      create: phase,
    });
  }

  // ============================================================
  // Journey Modules (for completed phases)
  // ============================================================
  const diagnosticPhase = await prisma.journeyPhase.findUnique({ where: { slug: "diagnostic" } });
  const visionPhase = await prisma.journeyPhase.findUnique({ where: { slug: "vision" } });
  const positionnementPhase = await prisma.journeyPhase.findUnique({ where: { slug: "positionnement" } });

  if (diagnosticPhase) {
    const modules = [
      { phaseId: diagnosticPhase.id, icon: "Brain", title: "Skill Analysis", subtitle: "Validate core competencies", order: 1 },
      { phaseId: diagnosticPhase.id, icon: "BarChart3", title: "Gap Report", subtitle: "Identify critical skill gaps", order: 2 },
      { phaseId: diagnosticPhase.id, icon: "ShieldCheck", title: "Baseline", subtitle: "Establish Career Score baseline", order: 3 },
    ];
    for (const mod of modules) {
      await prisma.journeyModule.create({ data: mod });
    }
  }

  if (visionPhase) {
    await prisma.journeyModule.create({
      data: { phaseId: visionPhase.id, icon: "Rocket", title: "Architectural Outcome", subtitle: "Define your target role and sector", order: 1 },
    });
  }

  // ============================================================
  // Journey Tasks (for active phase)
  // ============================================================
  if (positionnementPhase) {
    const tasks = [
      { phaseId: positionnementPhase.id, title: "Personal Brand Logic", description: "Defining your unique USP for the hiring market.", order: 1 },
      { phaseId: positionnementPhase.id, title: "Target Entity Mapping", description: "Identifying top-tier companies matching your profile.", order: 2 },
      { phaseId: positionnementPhase.id, title: "Narrative Pitch Simulation", description: "AI-powered interview simulation.", order: 3 },
    ];
    for (const task of tasks) {
      await prisma.journeyTask.create({ data: task });
    }
  }

  // ============================================================
  // Agent Definitions
  // ============================================================
  const agents = [
    {
      slug: "career-coach",
      name: "Career Coach",
      role: "Strategic Career Advisor",
      description: "Your dedicated AI career strategist. Analyzes your profile, identifies optimal paths, and provides tailored guidance.",
      icon: "Brain",
      color: "#4be277",
      capabilities: [
        { id: "c1", label: "Career Path Analysis", description: "Maps potential career trajectories" },
        { id: "c2", label: "Decision Framework", description: "Helps evaluate career options systematically" },
        { id: "c3", label: "Goal Setting", description: "Creates actionable milestones" },
      ],
      quickActions: [
        { id: "a1", label: "Review my progress", icon: "TrendingUp" },
        { id: "a2", label: "Suggest next step", icon: "ArrowRight" },
        { id: "a3", label: "Analyze blockers", icon: "AlertTriangle" },
      ],
    },
    {
      slug: "strategist",
      name: "Strategist",
      role: "Market Intelligence Analyst",
      description: "Scans the market landscape, identifies trends, and positions you for maximum impact.",
      icon: "Target",
      color: "#0566d9",
      capabilities: [
        { id: "c4", label: "Market Trends", description: "Real-time sector dynamics analysis" },
        { id: "c5", label: "Competitive Positioning", description: "How you compare to typical candidates" },
        { id: "c6", label: "Timing Optimization", description: "Best windows for career moves" },
      ],
      quickActions: [
        { id: "a4", label: "Market snapshot", icon: "BarChart3" },
        { id: "a5", label: "Competitor analysis", icon: "Users" },
      ],
    },
    {
      slug: "opportunity-scout",
      name: "Opportunity Scout",
      role: "Opportunity Discovery Engine",
      description: "Continuously monitors job markets and hidden opportunities matching your profile.",
      icon: "Search",
      color: "#d1bdff",
      capabilities: [
        { id: "c7", label: "Job Matching", description: "AI-powered matching with 95%+ accuracy" },
        { id: "c8", label: "Hidden Market", description: "Access unadvertised positions" },
        { id: "c9", label: "Alert System", description: "Real-time high-match notifications" },
      ],
      quickActions: [
        { id: "a6", label: "Show top matches", icon: "Star" },
        { id: "a7", label: "Scan new listings", icon: "RefreshCw" },
      ],
    },
    {
      slug: "cv-optimizer",
      name: "CV & LinkedIn Optimizer",
      role: "Personal Branding Specialist",
      description: "Optimizes your CV, LinkedIn profile, and professional narrative.",
      icon: "FileText",
      color: "#22c55e",
      capabilities: [
        { id: "c10", label: "CV Scoring", description: "ATS compatibility analysis" },
        { id: "c11", label: "LinkedIn Enhancement", description: "Profile optimization for recruiter discovery" },
        { id: "c12", label: "Narrative Crafting", description: "Compelling professional story creation" },
      ],
      quickActions: [
        { id: "a8", label: "Score my CV", icon: "FileCheck" },
        { id: "a9", label: "Optimize LinkedIn", icon: "Linkedin" },
      ],
    },
    {
      slug: "mindset-coach",
      name: "Mindset Coach",
      role: "Performance & Confidence Advisor",
      description: "Helps overcome mental blockers, build confidence, and maintain momentum.",
      icon: "Heart",
      color: "#f59e0b",
      capabilities: [
        { id: "c13", label: "Confidence Building", description: "Strengthen professional confidence" },
        { id: "c14", label: "Blocker Resolution", description: "Identify and overcome mental barriers" },
        { id: "c15", label: "Motivation Tracking", description: "Monitor energy and adjust pace" },
      ],
      quickActions: [
        { id: "a10", label: "Quick check-in", icon: "MessageCircle" },
        { id: "a11", label: "Confidence boost", icon: "Zap" },
      ],
    },
    {
      slug: "copilot",
      name: "NextMove Copilot",
      role: "Global Orchestrator",
      description: "Your central AI companion. Coordinates all agents, synthesizes insights, keeps your transition on track.",
      icon: "Sparkles",
      color: "#4be277",
      capabilities: [
        { id: "c16", label: "Cross-Agent Synthesis", description: "Unified view from all agents" },
        { id: "c17", label: "Priority Management", description: "Smart task prioritization" },
        { id: "c18", label: "Proactive Nudges", description: "Contextual suggestions at the right moment" },
      ],
      quickActions: [
        { id: "a12", label: "Daily briefing", icon: "Sun" },
        { id: "a13", label: "What should I do next?", icon: "HelpCircle" },
        { id: "a14", label: "Weekly summary", icon: "Calendar" },
      ],
    },
  ];

  for (const agent of agents) {
    await prisma.agentDefinition.upsert({
      where: { slug: agent.slug },
      update: agent,
      create: agent,
    });
  }

  // ============================================================
  // Resources
  // ============================================================
  const resources = [
    { title: "De Chef de Projet à Solutions Architect : le guide complet", description: "Découvrez les étapes clés pour réussir votre transition vers un rôle d'architecte.", type: "GUIDE" as const, category: "Transition", readTime: "12 min", url: "#", isNew: true },
    { title: "Les 10 compétences les plus demandées en FinTech 2026", description: "Analyse du marché et des skills qui font la différence.", type: "ARTICLE" as const, category: "Marché", readTime: "8 min", url: "#", isNew: true },
    { title: "Réussir son pitch en entretien technique", description: "Comment présenter votre parcours de transition de manière convaincante.", type: "VIDEO" as const, category: "Interview", readTime: "25 min", url: "#", isNew: false },
    { title: "Template CV — Architecte Technique", description: "Un template optimisé ATS pour les rôles d'architecture.", type: "TEMPLATE" as const, category: "Personal Branding", url: "#", isNew: false },
    { title: "Sarah M. — De Business Analyst à Lead Architect en 18 mois", description: "Retour d'expérience inspirant d'une transition réussie.", type: "CASE_STUDY" as const, category: "Success Stories", readTime: "10 min", url: "#", isNew: false },
    { title: "Comprendre les patterns d'architecture microservices", description: "Les fondamentaux pour parler architecture avec crédibilité.", type: "GUIDE" as const, category: "Technical", readTime: "20 min", url: "#", isNew: false },
  ];

  for (const resource of resources) {
    await prisma.resource.create({ data: resource });
  }

  // ============================================================
  // Sample Opportunities
  // ============================================================
  const opportunities = [
    { title: "Principal Technical Architect", company: "Qonto", location: "Paris, France", type: "JOB" as const, salary: "95-120K€", tags: ["FinTech", "Architecture", "Microservices", "AWS"], description: "Lead the technical architecture of Qonto's next-generation banking platform.", remote: true, postedAt: new Date("2026-03-18") },
    { title: "Solutions Architect — Data Platform", company: "Datadog", location: "Paris, France", type: "JOB" as const, salary: "90-115K€", tags: ["Data", "Cloud", "Architecture", "SaaS"], description: "Design and implement scalable data architecture solutions.", remote: true, postedAt: new Date("2026-03-17") },
    { title: "Freelance — Architecture Conseil FinTech", company: "Revolut", location: "Remote", type: "FREELANCE" as const, salary: "700-900€/jour", tags: ["FinTech", "Conseil", "Architecture"], description: "Mission de conseil en architecture technique.", remote: true, postedAt: new Date("2026-03-16") },
    { title: "Formation — AWS Solutions Architect Professional", company: "AWS Training", location: "Online", type: "FORMATION" as const, tags: ["Certification", "AWS", "Architecture", "Cloud"], description: "Certification professionnelle pour renforcer votre crédibilité technique.", remote: true, postedAt: new Date("2026-03-14") },
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.create({ data: opp });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
