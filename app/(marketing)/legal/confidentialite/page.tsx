import type { Metadata } from "next";
import { LegalLayout } from "../_components/legal-layout";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et traitement des données personnelles NextMove AI.",
  alternates: { canonical: "/legal/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité" lastUpdated="5 mai 2026">
      <p>
        La présente politique décrit comment NextMove collecte, utilise et protège tes données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679) et à la loi française Informatique et Libertés.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement est&nbsp;:
      </p>
      <ul>
        <li>
          <strong>Datakeai</strong>, EURL au capital de 500 €
        </li>
        <li>96 rue des Vignobles, 78400 Chatou, France</li>
        <li>SIRET : 977 813 757 00019</li>
        <li>
          Contact RGPD : <a href="mailto:contact@nextmove.sh">contact@nextmove.sh</a>
        </li>
      </ul>

      <h2>2. Données collectées</h2>
      <p>NextMove collecte les catégories de données suivantes&nbsp;:</p>

      <h3>2.1 Données d&apos;identification</h3>
      <ul>
        <li>Nom, prénom, adresse email</li>
        <li>Photo de profil (avatar) si tu la fournis</li>
        <li>Profil LinkedIn (uniquement pour les candidatures Founding Members)</li>
      </ul>

      <h3>2.2 Données de profil professionnel</h3>
      <ul>
        <li>Poste actuel, entreprise, secteur, années d&apos;expérience</li>
        <li>Compétences, formations, certifications</li>
        <li>Objectifs de carrière, motivations, contraintes</li>
        <li>Réponses aux questionnaires de diagnostic et d&apos;onboarding</li>
      </ul>

      <h3>2.3 Données d&apos;usage</h3>
      <ul>
        <li>Conversations avec les agents IA (Copilot, sessions immersives)</li>
        <li>Progression dans le parcours, tâches complétées, scores</li>
        <li>Logs de connexion, dates de dernière activité</li>
      </ul>

      <h3>2.4 Données de paiement</h3>
      <p>
        Les données bancaires sont traitées exclusivement par notre prestataire <strong>Stripe</strong> et ne sont jamais stockées par NextMove. Nous conservons uniquement un identifiant client Stripe et le statut de l&apos;abonnement.
      </p>

      <h3>2.5 Données techniques</h3>
      <ul>
        <li>Adresse IP, type de navigateur, système d&apos;exploitation</li>
        <li>Statistiques d&apos;usage anonymisées (Vercel Analytics)</li>
        <li>Erreurs techniques (Sentry, anonymisées)</li>
      </ul>

      <h2>3. Bases légales et finalités</h2>
      <table>
        <thead>
          <tr>
            <th>Finalité</th>
            <th>Base légale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Création et gestion du compte utilisateur</td>
            <td>Exécution du contrat (art. 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td>Personnalisation du parcours et recommandations IA</td>
            <td>Exécution du contrat</td>
          </tr>
          <tr>
            <td>Facturation et gestion des paiements</td>
            <td>Obligation légale + exécution du contrat</td>
          </tr>
          <tr>
            <td>Envoi d&apos;emails transactionnels (confirmation, factures, alertes)</td>
            <td>Exécution du contrat</td>
          </tr>
          <tr>
            <td>Envoi de newsletters et informations produit</td>
            <td>Consentement (opt-in, désinscription possible à tout moment)</td>
          </tr>
          <tr>
            <td>Statistiques d&apos;usage anonymisées</td>
            <td>Intérêt légitime à améliorer le service</td>
          </tr>
          <tr>
            <td>Détection de fraude et sécurité</td>
            <td>Intérêt légitime</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Sous-traitants et destinataires</h2>
      <p>
        NextMove fait appel à des sous-traitants techniques pour fournir le service. Chacun est encadré par un accord de traitement des données conforme au RGPD.
      </p>
      <table>
        <thead>
          <tr>
            <th>Sous-traitant</th>
            <th>Rôle</th>
            <th>Localisation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase</td>
            <td>Authentification + base de données</td>
            <td>Frankfurt, UE</td>
          </tr>
          <tr>
            <td>Vercel Inc.</td>
            <td>Hébergement et CDN</td>
            <td>États-Unis (avec edges UE)</td>
          </tr>
          <tr>
            <td>Stripe Payments Europe Ltd.</td>
            <td>Traitement des paiements</td>
            <td>Dublin, Irlande</td>
          </tr>
          <tr>
            <td>Resend</td>
            <td>Envoi des emails transactionnels</td>
            <td>Dublin, Irlande</td>
          </tr>
          <tr>
            <td>Anthropic, PBC</td>
            <td>Modèles IA Claude (génération de contenus)</td>
            <td>États-Unis</td>
          </tr>
          <tr>
            <td>Moonshot AI</td>
            <td>Modèles IA Kimi (génération de contenus)</td>
            <td>Chine</td>
          </tr>
          <tr>
            <td>Sentry (Functional Software, Inc.)</td>
            <td>Monitoring d&apos;erreurs techniques</td>
            <td>États-Unis</td>
          </tr>
        </tbody>
      </table>

      <h3>4.1 Transferts hors UE</h3>
      <p>
        Certaines données sont transférées vers des pays situés hors de l&apos;Union européenne (États-Unis, Chine). Ces transferts sont encadrés par les <strong>Clauses Contractuelles Types (CCT)</strong> de la Commission européenne ou par d&apos;autres garanties appropriées prévues aux articles 46 et suivants du RGPD.
      </p>
      <p>
        Concernant <strong>Moonshot AI</strong> (basé en Chine), seules des données pseudonymisées (ne permettant pas une identification directe) sont transmises pour les besoins de génération de contenus IA. Aucune donnée bancaire ni email n&apos;est jamais transmise.
      </p>

      <h2>5. Durée de conservation</h2>
      <ul>
        <li>
          <strong>Compte actif</strong> : tant que ton compte existe, et 3 ans après la dernière activité.
        </li>
        <li>
          <strong>Données de facturation</strong> : 10 ans (obligation légale comptable).
        </li>
        <li>
          <strong>Logs de connexion</strong> : 12 mois maximum.
        </li>
        <li>
          <strong>Candidatures Founding Members non retenues</strong> : 6 mois après la décision, puis suppression automatique.
        </li>
      </ul>

      <h2>6. Tes droits</h2>
      <p>
        Conformément au RGPD, tu disposes des droits suivants&nbsp;:
      </p>
      <ul>
        <li><strong>Droit d&apos;accès</strong> : obtenir une copie de tes données.</li>
        <li><strong>Droit de rectification</strong> : corriger une donnée inexacte.</li>
        <li><strong>Droit à l&apos;effacement</strong> («&nbsp;droit à l&apos;oubli&nbsp;») : demander la suppression de tes données.</li>
        <li><strong>Droit à la limitation</strong> : demander un gel temporaire du traitement.</li>
        <li><strong>Droit à la portabilité</strong> : recevoir tes données dans un format structuré.</li>
        <li><strong>Droit d&apos;opposition</strong> : t&apos;opposer à un traitement fondé sur l&apos;intérêt légitime.</li>
        <li><strong>Droit de retirer ton consentement</strong> à tout moment, lorsqu&apos;il est requis.</li>
        <li><strong>Droit de définir des directives post-mortem</strong> sur le sort de tes données.</li>
      </ul>
      <p>
        Pour exercer tes droits, écris-nous à <a href="mailto:contact@nextmove.sh">contact@nextmove.sh</a>. Nous te répondrons dans un délai d&apos;un mois.
      </p>
      <p>
        En cas de réponse insatisfaisante, tu peux introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
      </p>

      <h2>7. Sécurité</h2>
      <p>
        NextMove met en œuvre des mesures techniques et organisationnelles pour protéger tes données&nbsp;:
      </p>
      <ul>
        <li>Chiffrement des connexions en HTTPS (TLS 1.3)</li>
        <li>Chiffrement des données au repos sur la base de données</li>
        <li>Mots de passe stockés sous forme de hash bcrypt</li>
        <li>Row Level Security (RLS) activée sur toutes les tables</li>
        <li>Accès aux données limité au strict nécessaire (principe du moindre privilège)</li>
        <li>Backups automatiques quotidiens</li>
      </ul>

      <h2>8. Cookies</h2>
      <p>
        Pour plus d&apos;informations sur les cookies utilisés, consulte notre <a href="/legal/cookies">Politique cookies</a>.
      </p>

      <h2>9. Modifications</h2>
      <p>
        La présente politique peut être amenée à évoluer. En cas de modification substantielle, tu seras informé par email au moins 30 jours avant l&apos;entrée en vigueur. La version applicable est toujours celle disponible sur cette page.
      </p>
    </LegalLayout>
  );
}
