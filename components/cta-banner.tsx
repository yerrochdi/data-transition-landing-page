import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="bg-foreground py-16 lg:py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <h2 className="font-display text-balance text-3xl font-extrabold tracking-tight text-background md:text-4xl">
          {"Commencer par une conversation simple"}
        </h2>
        <p className="max-w-lg text-pretty text-base leading-relaxed text-background/70">
          {"Avant toute d\u00e9cision, un \u00e9change de 15 minutes permet de v\u00e9rifier si cet accompagnement est pertinent pour vous."}
        </p>
        <Button
          asChild
          size="lg"
          className="rounded-full bg-accent px-8 text-accent-foreground shadow-lg shadow-accent/30 transition-all hover:bg-accent/90 hover:shadow-xl"
        >
          <a href="#contact">
            {"Demander un \u00e9change de 15 minutes"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
        <p className="text-sm text-background/50">
          {"Sans engagement. Sans discours commercial."}
        </p>
      </div>
    </section>
  );
}
