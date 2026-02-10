"use client";

import React from "react"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Linkedin,
  ArrowRight,
  Clock,
  CheckCircle2,
  Loader2,
  Calendar,
  ExternalLink,
} from "lucide-react";

type FormStatus = "idle" | "loading" | "success" | "error";

export function ContactSection() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCalendly, setShowCalendly] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      profile: formData.get("profile") as string,
      goal: formData.get("goal") as string,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Une erreur est survenue.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMessage("Impossible de contacter le serveur. Veuillez r\u00e9essayer.");
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="relative bg-background py-20 lg:py-28">
      {/* Subtle top decoration */}
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-14 max-w-xl">
          <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            {"Contact"}
          </span>
          <h2 className="font-display text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {"Prenons 15 minutes pour en parler."}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {"Remplissez le formulaire ou r\u00e9servez directement un cr\u00e9neau."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Form */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm lg:col-span-3 lg:p-8">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center animate-fade-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {"Demande envoy\u00e9e !"}
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {"Merci pour votre int\u00e9r\u00eat. Nous revenons vers vous sous 48h pour planifier un \u00e9change."}
                </p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() => setShowCalendly(true)}
                    className="rounded-full bg-accent text-accent-foreground shadow-md shadow-accent/25 hover:bg-accent/90"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {"R\u00e9server un cr\u00e9neau maintenant"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full bg-transparent"
                    onClick={() => {
                      setStatus("idle");
                      setErrorMessage("");
                    }}
                  >
                    {"Envoyer une autre demande"}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-semibold text-foreground"
                    >
                      {"Nom"} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Votre nom complet"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-foreground"
                    >
                      {"Email"} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="profile"
                    className="text-sm font-semibold text-foreground"
                  >
                    {"Profil actuel"}
                  </label>
                  <Input
                    id="profile"
                    name="profile"
                    placeholder="Ex: Responsable SIRH, 8 ans d'exp\u00e9rience"
                    className="rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="goal"
                    className="text-sm font-semibold text-foreground"
                  >
                    {"Objectif de transition"}
                  </label>
                  <Textarea
                    id="goal"
                    name="goal"
                    placeholder="D\u00e9crivez bri\u00e8vement votre objectif de transition data..."
                    rows={4}
                    className="rounded-xl"
                  />
                </div>

                {status === "error" && (
                  <div className="rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {errorMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded-full bg-accent text-accent-foreground shadow-md shadow-accent/25 transition-all hover:bg-accent/90 hover:shadow-lg"
                  size="lg"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {"Envoi en cours..."}
                    </>
                  ) : (
                    <>
                      {"Envoyer ma demande"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {"Pas de vente forc\u00e9e. R\u00e9ponse sous 48h."}
                </p>
              </form>
            )}
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            {/* Book a call card */}
            <div className="rounded-2xl border-2 border-accent/20 bg-accent/[0.03] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    {"R\u00e9servez directement"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {"15 min, sans engagement"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowCalendly(true)}
                className="w-full rounded-full bg-accent text-accent-foreground shadow-md shadow-accent/25 hover:bg-accent/90"
              >
                {"Choisir un cr\u00e9neau"}
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Direct contact */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h3 className="mb-4 font-display text-base font-bold text-foreground">
                {"Contact direct"}
              </h3>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:contact@datatransition.fr"
                  className="flex items-center gap-3 rounded-xl bg-secondary p-3 text-sm text-foreground transition-colors hover:bg-secondary/70"
                >
                  <Mail className="h-4 w-4 text-accent" />
                  {"contact@datatransition.fr"}
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-secondary p-3 text-sm text-foreground transition-colors hover:bg-secondary/70"
                >
                  <Linkedin className="h-4 w-4 text-accent" />
                  {"LinkedIn"}
                </a>
              </div>
            </div>

            {/* Quote */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <p className="text-sm font-medium leading-relaxed text-foreground">
                {"\u00ab Je ne cherche pas \u00e0 vendre. Je cherche les bons profils : ceux qui ont d\u00e9j\u00e0 l\u2019exp\u00e9rience, mais pas encore le bon positionnement. \u00bb"}
              </p>
              <p className="mt-3 text-xs font-semibold text-muted-foreground">
                {"\u2014 Fondateur, Data Transition"}
              </p>
            </div>
          </div>
        </div>

        {/* Calendly Modal */}
        {showCalendly && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 backdrop-blur-sm animate-fade-in">
            <div className="relative mx-4 w-full max-w-2xl rounded-3xl bg-card p-2 shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {"R\u00e9server un cr\u00e9neau"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCalendly(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Fermer"
                >
                  {"\u00d7"}
                </button>
              </div>
              <div className="overflow-hidden rounded-2xl bg-background">
                <iframe
                  src={`${process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/datatransition/15min"}`}
                  title="R\u00e9server un cr\u00e9neau - Data Transition"
                  className="h-[560px] w-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
