import type { Metadata } from "next";
import { LegalLayout } from "../_components/legal-layout";

export const metadata: Metadata = {
  title: "Politique cookies",
  description: "Utilisation des cookies sur le site NextMove AI.",
  alternates: { canonical: "/legal/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Politique cookies" lastUpdated="5 mai 2026">
      <h2>1. Qu&apos;est-ce qu&apos;un cookie&nbsp;?</h2>
      <p>
        Un cookie est un petit fichier texte déposé sur ton appareil par le site que tu visites. Il permet au site de mémoriser des informations sur ta navigation pour faciliter ton expérience.
      </p>

      <h2>2. Cookies utilisés sur NextMove</h2>
      <p>
        NextMove utilise un nombre minimal de cookies, tous strictement nécessaires au fonctionnement du service. Aucun cookie publicitaire ni de tracking tiers n&apos;est utilisé.
      </p>

      <h3>2.1 Cookies strictement nécessaires</h3>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Finalité</th>
            <th>Durée</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>sb-access-token</td>
            <td>Maintien de session utilisateur (Supabase Auth)</td>
            <td>1 heure</td>
          </tr>
          <tr>
            <td>sb-refresh-token</td>
            <td>Renouvellement automatique de session</td>
            <td>30 jours</td>
          </tr>
          <tr>
            <td>founding-banner-dismissed</td>
            <td>Mémorise la fermeture du bandeau Founding Members</td>
            <td>Session navigateur</td>
          </tr>
        </tbody>
      </table>
      <p>
        Ces cookies ne nécessitent pas de consentement préalable au sens de l&apos;article 82 de la loi Informatique et Libertés, car ils sont indispensables à la fourniture du service.
      </p>

      <h3>2.2 Mesure d&apos;audience anonyme</h3>
      <p>
        NextMove utilise <strong>Vercel Analytics</strong> pour des statistiques d&apos;usage agrégées et anonymisées. Aucun cookie persistant n&apos;est déposé, aucune donnée individuelle n&apos;est traitée. Ce dispositif est exempté de consentement par la CNIL.
      </p>

      <h2>3. Comment gérer les cookies&nbsp;?</h2>
      <p>
        Tu peux à tout moment supprimer ou bloquer les cookies via les paramètres de ton navigateur. Attention&nbsp;: désactiver les cookies de session t&apos;empêchera de te connecter à NextMove.
      </p>
      <ul>
        <li>
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a>
        </li>
        <li>
          <a href="https://support.mozilla.org/kb/protection-renforcee-contre-pistage-firefox-ordinateur" target="_blank" rel="noopener noreferrer">Firefox</a>
        </li>
        <li>
          <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a>
        </li>
        <li>
          <a href="https://support.microsoft.com/fr-fr/microsoft-edge" target="_blank" rel="noopener noreferrer">Edge</a>
        </li>
      </ul>

      <h2>4. Modifications</h2>
      <p>
        Si NextMove venait à intégrer de nouveaux outils impliquant des cookies non strictement nécessaires (ex. publicité, retargeting), un bandeau de consentement conforme aux exigences CNIL serait mis en place avant tout dépôt.
      </p>

      <h2>5. Contact</h2>
      <p>
        Pour toute question relative aux cookies, écris-nous à <a href="mailto:contact@nextmove.sh">contact@nextmove.sh</a>.
      </p>
    </LegalLayout>
  );
}
