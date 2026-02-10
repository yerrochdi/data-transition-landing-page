# Data Transition - Landing Page

Landing page pour **Data Transition**, un programme de mentorat senior pour la reconversion vers les métiers de la data.

## Stack Technique

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Email**: Resend API
- **Analytics**: Vercel Analytics
- **Booking**: Calendly
- **Déploiement**: Vercel

## Fonctionnalités

- ✅ Landing page responsive avec design premium
- ✅ Formulaire de contact avec validation Zod
- ✅ Anti-spam (honeypot + rate limiting)
- ✅ Intégration Calendly pour la réservation
- ✅ Emails automatiques (notification + confirmation)
- ✅ Analytics avec tracking des événements
- ✅ CTA sticky sur mobile
- ✅ Page de remerciement (/thank-you)
- ✅ UTM passthrough pour le tracking

## Installation

```bash
# Cloner le repo
git clone https://github.com/yerrochdi/data-transition-landing-page.git
cd data-transition-landing-page

# Installer les dépendances
npm install --legacy-peer-deps

# Copier les variables d'environnement
cp .env.example .env.local

# Lancer en développement
npm run dev
```

## Variables d'environnement

Créer un fichier `.env.local` avec :

```env
# Calendly
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/yerrochdi/15min

# Resend (email)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTIFICATION_EMAIL=yerrochdi.telecomparis@gmail.com
```

### Configuration Vercel

Ajouter ces variables dans **Vercel > Project Settings > Environment Variables** :

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CALENDLY_URL` | URL Calendly pour la réservation |
| `RESEND_API_KEY` | Clé API Resend pour l'envoi d'emails |
| `NOTIFICATION_EMAIL` | Email destinataire des notifications |

## Scripts

```bash
npm run dev      # Serveur de développement (http://localhost:3000)
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linter ESLint
```

## Structure du projet

```
├── app/
│   ├── api/contact/     # API endpoint formulaire
│   ├── thank-you/       # Page de remerciement
│   ├── layout.tsx       # Layout racine + Analytics
│   └── page.tsx         # Page d'accueil
├── components/
│   ├── contact-section.tsx   # Formulaire + Calendly modal
│   ├── sticky-cta.tsx        # CTA sticky mobile
│   └── ...                   # Autres sections
├── lib/
│   ├── booking.ts       # URL booking centralisée + UTM
│   ├── contact-schema.ts # Validation Zod
│   └── analytics.ts     # Tracking events
└── .env.example         # Template variables d'env
```

## Déploiement

Le projet est configuré pour Vercel avec déploiement automatique sur push :

1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer

Vercel Analytics est automatiquement activé.

## Tracking des événements

Événements trackés via Vercel Analytics :

| Événement | Description |
|-----------|-------------|
| `cta_click` | Clic sur un bouton CTA (avec location) |
| `form_submit` | Soumission du formulaire contact |
| `booking_open` | Ouverture du modal Calendly |

## Test en local

1. Lancer le serveur : `npm run dev`
2. Ouvrir http://localhost:3000
3. Tester le formulaire de contact
4. Vérifier l'email reçu (si RESEND_API_KEY configurée)
5. Tester la réservation Calendly

## Licence

Propriétaire - Data Transition
