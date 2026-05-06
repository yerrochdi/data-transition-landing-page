"use client";

import Link from "next/link";
import { Crown, Users, Zap, MessageCircle, TrendingUp } from "lucide-react";

const FAKE_POSTS = [
  {
    name: "Marc",
    role: "Director Marketing → AI Product Manager",
    time: "il y a 2 h",
    text: "Je viens de finir mon premier dashboard Power BI sur les données de mon équipe. Énorme déclic — je vois enfin comment intégrer la data à mes décisions de marketing. Merci NextMove pour le brief et le template.",
    likes: 42,
    comments: 8,
  },
  {
    name: "Sophie",
    role: "DAF data-driven",
    time: "il y a 5 h",
    text: "Question pour la communauté : qui a déjà négocié une augmentation après avoir présenté un projet data en interne ? J'ai mes 3 cas d'usage prêts, je ne sais pas si je dois attendre la review annuelle ou taper le fer maintenant.",
    likes: 28,
    comments: 14,
  },
  {
    name: "Thomas",
    role: "Senior AI Product Manager",
    time: "il y a 1 j",
    text: "Update : 6 entretiens cette semaine pour le rôle d'AI PM. Le matching NextMove est dingue — 87% sur Doctolib, j'ai un dernier round mardi prochain. La prep entretien IA m'a sorti pile les bonnes questions.",
    likes: 67,
    comments: 22,
  },
];

export function FeedLockedView({ userName }: { userName: string }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-foreground mb-1">
          Le Feed
        </h1>
        <p className="text-sm text-muted-foreground">
          {userName}, rejoins la communauté des cadres qui pivotent vers la data.
        </p>
      </div>

      {/* Teaser zone */}
      <div className="relative">
        {/* Blurred background of fake posts */}
        <div aria-hidden className="pointer-events-none select-none blur-md opacity-60 space-y-4">
          {FAKE_POSTS.map((post, i) => (
            <div
              key={i}
              className="bg-surface-container-low rounded-2xl ghost-border p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10" />
                <div>
                  <p className="font-headline text-sm font-bold text-foreground">{post.name}</p>
                  <p className="text-[11px] text-muted-foreground">{post.role} · {post.time}</p>
                </div>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed mb-3">{post.text}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {post.comments}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA overlay */}
        <div className="absolute inset-0 flex items-start justify-center pt-16">
          <div className="bg-surface-container-high/95 backdrop-blur-md border border-primary/30 rounded-2xl p-7 max-w-md text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center text-primary mx-auto mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h2 className="font-headline text-xl font-bold text-foreground mb-2">
              Le Feed est réservé aux abonnés
            </h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Échange avec les cadres qui pivotent comme toi. Pose tes questions, partage tes wins, accélère grâce à la communauté.
            </p>

            <div className="space-y-2 text-left mb-6 bg-surface-container-lowest p-4 rounded-xl">
              <FeatureLine icon={Users} text="Communauté de cadres en transition data/IA" />
              <FeatureLine icon={MessageCircle} text="Pose des questions, reçois des réponses concrètes" />
              <FeatureLine icon={Crown} text="Founding Members et coachs visibles dans le fil" />
            </div>

            <Link
              href="/upgrade"
              className="inline-flex items-center justify-center gap-2 gradient-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20 w-full"
            >
              <Zap className="w-4 h-4" />
              Voir les plans à partir de 19€/mois
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureLine({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <span className="text-xs text-foreground/90 leading-snug">{text}</span>
    </div>
  );
}
