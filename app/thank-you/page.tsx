import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Merci ! | Data Transition",
  description: "Votre demande a bien été envoyée. Nous revenons vers vous sous 48h.",
};

export default function ThankYouPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-20">
      <div className="mx-auto max-w-lg text-center">
        {/* Success icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle2 className="h-10 w-10 text-accent" />
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          {"Demande envoyée !"}
        </h1>

        {/* Description */}
        <p className="mt-4 text-lg text-muted-foreground">
          {"Merci pour votre intérêt. Nous revenons vers vous sous "}
          <strong className="text-foreground">{"48h"}</strong>
          {" pour planifier un échange."}
        </p>

        {/* CTA Card */}
        <div className="mt-8 rounded-2xl border-2 border-accent/20 bg-accent/[0.03] p-6">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Calendar className="h-6 w-6 text-accent" />
            <h2 className="font-display text-lg font-bold text-foreground">
              {"Envie d'aller plus vite ?"}
            </h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            {"Réservez directement un créneau de 15 minutes pour discuter de votre projet."}
          </p>
          <Button
            asChild
            className="w-full rounded-full bg-accent text-accent-foreground shadow-md shadow-accent/25 hover:bg-accent/90"
            size="lg"
          >
            <a
              href="https://calendly.com/yerrochdi/15min"
              target="_blank"
              rel="noopener noreferrer"
            >
              {"Réserver un créneau"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {"Retour à l'accueil"}
        </Link>
      </div>
    </main>
  );
}
