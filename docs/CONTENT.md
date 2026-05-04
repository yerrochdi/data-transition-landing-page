# Guide de modification du contenu marketing

Ce document explique comment modifier rapidement les éléments dynamiques de la landing page sans toucher à l'architecture.

---

## 1. Modifier les chiffres marché (sous le hero)

Fichier : `app/(marketing)/home/page.tsx`

Cherche le bloc `{/* Chiffres marché */}` puis le tableau :

```tsx
const items = [
  { role: "Marketing senior", before: "65 – 80 k€", after: "85 – 110 k€", uplift: "+30%" },
  { role: "Product Manager", before: "60 – 75 k€", after: "85 – 115 k€", uplift: "+45%" },
  { role: "Finance / Contrôle", before: "70 – 90 k€", after: "90 – 125 k€", uplift: "+35%" },
];
```

Modifie les valeurs (`before`, `after`, `uplift`) ou les libellés (`role`).
La phrase de sources est juste en dessous, dans le même bloc :

> "Ranges indicatifs basés sur APEC Baromètre cadres 2025, LinkedIn Economic Graph 2025 et France Travail."

---

## 2. Modifier ou ajouter un archétype "Pour qui ça marche"

Fichier : `app/(marketing)/home/page.tsx`

Cherche le bloc `{/* Pour qui ça marche — 3 archétypes */}` puis le tableau :

```tsx
const archetypes = [
  {
    tag: "Le Pivoteur Tech",
    transition: "Director Marketing → AI Product Manager",
    persona: "Marc, 42 ans, ...",
    steps: ["Diagnostic complet du profil", "..."],
    icon: Zap,
  },
  // ...
];
```

Pour ajouter un 4ème archétype, ajoute un objet et adapte la grid si besoin
(actuellement `md:grid-cols-3`).

**Règles légales** :
- Ne mets pas de chiffres salariaux ni de durées dans les parcours.
- Conserve la mention "Exemples de parcours types — vos résultats dépendent
  de votre profil et de votre engagement." en bas du bloc.

---

## 3. Modifier la bio fondateur

### Sur la home (version courte)

Fichier : `app/(marketing)/home/page.tsx`, bloc `{/* Qui suis-je */}`.

### Sur la page dédiée (version longue)

Fichier : `app/(marketing)/about/page.tsx`.

### Photo

Pose le fichier dans `public/founder.png`. La référence est utilisée dans
les deux fichiers ci-dessus via `<Image src="/founder.png" />`.

Format recommandé : carré 800x800px, < 500 Ko.

---

## 4. Gérer les candidatures Founding Members

### Consulter les candidatures

Va sur https://nextmove.sh/admin/founding-members (connexion requise).

Tu peux filtrer par statut (En attente / Acceptées / Refusées / Toutes),
déplier chaque candidature pour voir les détails, et changer le statut
(Accepter / Refuser / Repasser en attente).

### Recevoir les nouvelles candidatures par email

Chaque nouvelle candidature envoie un email à `contact@nextmove.sh`
(défini dans `lib/founding-members/actions.ts`, constante `ADMIN_EMAIL`).

Le candidat reçoit aussi un email de confirmation.

### Changer le nombre total de places

Fichier : `lib/founding-members/actions.ts`

```ts
export const TOTAL_SEATS = 30;
```

Le compteur "places restantes" sur `/founding-members` est calculé
automatiquement comme `TOTAL_SEATS - count(ACCEPTED)`.

### Désactiver complètement le programme (après lancement)

Fichier : `components/marketing/founding-banner.tsx`

```ts
const ENABLED = true; // → passer à false
```

Le bandeau disparaîtra de la home. La page `/founding-members` reste
accessible mais peut aussi être désactivée en supprimant le dossier
`app/(marketing)/founding-members/`.

---

## 5. Modifier le pricing

Fichier : `app/(marketing)/home/page.tsx`, bloc `{/* Pricing */}`.

Chaque tier (Free, Boost, Pro, Sprint) est une `<div>` séparée. Les prix
affichés ici sont **uniquement décoratifs** — les vrais prix sont dans
Stripe et dans `lib/billing/actions.ts`.

⚠️ Si tu changes un prix sur la landing, change-le aussi dans Stripe
ET dans `STRIPE_*_PRICE_ID` côté Vercel env vars, sinon il y aura
incohérence entre l'affichage et le checkout.

---

## 6. Migrations de base de données

Les migrations Prisma se trouvent dans `prisma/migrations/`.

Les migrations qu'il faut appliquer manuellement (pour des raisons de
sécurité ou d'environnement) sont dans `prisma/migrations/manual/`.

À ce jour :
- `enable_rls.sql` — déjà appliqué (RLS sur toutes les tables)
- `founding_members.sql` — à appliquer une fois pour la table
  `founding_member_applications` (enum + table + index + RLS)

Pour appliquer : Supabase Dashboard → SQL Editor → Coller → Run.
