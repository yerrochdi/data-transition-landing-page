import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos — Yassine Errochdi, fondateur",
  description:
    "Pourquoi j'ai créé NextMove. Yassine Errochdi, expert data & IA, accompagne les cadres français à intégrer la data et l'IA à leur carrière.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
