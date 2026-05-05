import type { Metadata } from "next";
import { LegalLayout } from "../_components/legal-layout";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description: "Conditions générales de vente des services NextMove AI.",
  alternates: { canonical: "/legal/cgv" },
};

export default function CGVPage() {
  return (
    <LegalLayout title="Conditions Générales de Vente" lastUpdated="5 mai 2026">
      <h2>Article 1 — Objet</h2>
      <p>
        Les présentes conditions générales de vente (ci-après les «&nbsp;CGV&nbsp;») régissent les relations contractuelles entre&nbsp;:
      </p>
      <ul>
        <li>
          <strong>Datakeai</strong>, EURL au capital de 500 €, immatriculée au RCS de Versailles sous le numéro 977 813 757, dont le siège social est situé 96 rue des Vignobles, 78400 Chatou, France (ci-après «&nbsp;NextMove&nbsp;» ou «&nbsp;l&apos;Éditeur&nbsp;»),
        </li>
        <li>
          et toute personne physique ou morale, agissant en qualité de consommateur ou de professionnel, qui souscrit à un abonnement ou achète un service sur le site nextmove.sh (ci-après «&nbsp;l&apos;Utilisateur&nbsp;» ou «&nbsp;le Client&nbsp;»).
        </li>
      </ul>
      <p>
        L&apos;Utilisateur reconnaît avoir pris connaissance des présentes CGV et les avoir acceptées sans réserve avant toute souscription.
      </p>

      <h2>Article 2 — Services proposés</h2>
      <p>
        NextMove est une plateforme SaaS d&apos;accompagnement à la transition de carrière vers les métiers de la data et de l&apos;intelligence artificielle, comprenant notamment&nbsp;: un diagnostic IA personnalisé, un parcours structuré, des recommandations d&apos;opportunités, un copilot IA, et des ressources pédagogiques.
      </p>

      <h3>2.1 Plans d&apos;abonnement</h3>
      <table>
        <thead>
          <tr>
            <th>Plan</th>
            <th>Prix TTC</th>
            <th>Engagement</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Free</td>
            <td>0 €</td>
            <td>Aucun</td>
          </tr>
          <tr>
            <td>Boost</td>
            <td>19 €/mois</td>
            <td>Mensuel sans engagement</td>
          </tr>
          <tr>
            <td>Pro</td>
            <td>49 €/mois</td>
            <td>Mensuel sans engagement</td>
          </tr>
          <tr>
            <td>Sprint</td>
            <td>149 € (paiement unique)</td>
            <td>Accès limité à 30 jours, sans reconduction</td>
          </tr>
          <tr>
            <td>Founding Member</td>
            <td>9 €/mois (sur invitation uniquement)</td>
            <td>Mensuel sans engagement</td>
          </tr>
        </tbody>
      </table>
      <p>
        Les prix indiqués sont en euros, toutes taxes comprises (TTC). Datakeai se réserve le droit de modifier ses tarifs à tout moment, étant entendu que toute modification ne s&apos;appliquera qu&apos;aux nouvelles souscriptions ou aux renouvellements postérieurs à la modification.
      </p>

      <h2>Article 3 — Souscription</h2>
      <p>
        La souscription à un plan payant s&apos;effectue en ligne sur le site nextmove.sh. L&apos;Utilisateur doit créer un compte, fournir les informations nécessaires et procéder au paiement via le prestataire de paiement Stripe.
      </p>
      <p>
        Le contrat est conclu dès validation du paiement. Un email de confirmation est adressé à l&apos;Utilisateur.
      </p>

      <h2>Article 4 — Prix et paiement</h2>
      <p>
        Les paiements sont effectués via Stripe Payments Europe Ltd., établissement de paiement agréé. NextMove ne stocke aucune information bancaire.
      </p>
      <p>
        Les abonnements mensuels sont prélevés automatiquement à la date anniversaire de la souscription. L&apos;Utilisateur peut résilier à tout moment via l&apos;espace de gestion d&apos;abonnement, sans frais ni pénalité.
      </p>

      <h2>Article 5 — Garantie satisfait ou remboursé</h2>
      <p>
        <strong>Plans Boost et Pro</strong>&nbsp;: NextMove offre une garantie satisfait ou remboursé pendant 14 jours à compter de la souscription. L&apos;Utilisateur peut demander le remboursement intégral en envoyant une demande motivée à <a href="mailto:contact@nextmove.sh">contact@nextmove.sh</a>.
      </p>
      <p>
        <strong>Plan Sprint</strong>&nbsp;: garantie satisfait ou remboursé de 7 jours à compter de la souscription, dans les mêmes conditions.
      </p>
      <p>
        Au-delà de ces délais, ou en cas d&apos;usage manifestement abusif des fonctionnalités IA (utilisation détournée, génération massive non liée à un parcours de transition), aucun remboursement ne pourra être exigé.
      </p>

      <h2>Article 6 — Droit de rétractation</h2>
      <p>
        Conformément à l&apos;article L.221-28 du Code de la consommation, l&apos;Utilisateur consommateur dispose d&apos;un délai de 14 jours pour exercer son droit de rétractation à compter de la conclusion du contrat. Ce droit s&apos;exerce auprès du service client à <a href="mailto:contact@nextmove.sh">contact@nextmove.sh</a>.
      </p>
      <p>
        En souscrivant un plan et en commençant à utiliser activement le service avant l&apos;expiration de ce délai, l&apos;Utilisateur reconnaît demander expressément l&apos;exécution du service. Toutefois, la garantie satisfait ou remboursé prévue à l&apos;article 5 lui reste acquise.
      </p>

      <h2>Article 7 — Résiliation</h2>
      <p>
        L&apos;Utilisateur peut résilier son abonnement à tout moment depuis son espace de gestion (Stripe Customer Portal), accessible via les paramètres de son compte. La résiliation prend effet à la fin de la période en cours, sans renouvellement.
      </p>
      <p>
        Datakeai se réserve le droit de résilier unilatéralement et sans préavis le compte d&apos;un Utilisateur en cas de manquement grave aux présentes CGV, notamment en cas d&apos;usage frauduleux, abusif ou contraire aux lois en vigueur.
      </p>

      <h2>Article 8 — Disponibilité du service</h2>
      <p>
        NextMove s&apos;engage à fournir le service avec diligence et selon les règles de l&apos;art, étant précisé qu&apos;il s&apos;agit d&apos;une obligation de moyens. NextMove ne saurait être tenu responsable des éventuelles interruptions, ralentissements ou indisponibilités liées à la maintenance, à des cas de force majeure, ou à des défaillances de prestataires tiers (hébergeur, fournisseurs de modèles IA, etc.).
      </p>

      <h2>Article 9 — Limitation de responsabilité</h2>
      <p>
        Les recommandations, suggestions et contenus générés par l&apos;intelligence artificielle de NextMove sont fournis à titre informatif et ne constituent en aucun cas des conseils professionnels personnalisés (juridiques, fiscaux, médicaux, financiers, etc.). Il appartient à l&apos;Utilisateur de vérifier l&apos;adéquation des recommandations à sa situation personnelle.
      </p>
      <p>
        NextMove ne garantit aucun résultat précis en termes de transition professionnelle, de rémunération ou d&apos;embauche. Les exemples de parcours présentés sur le site sont fournis à titre illustratif.
      </p>
      <p>
        En tout état de cause, la responsabilité de Datakeai ne saurait excéder le montant payé par l&apos;Utilisateur au cours des 12 derniers mois.
      </p>

      <h2>Article 10 — Données personnelles</h2>
      <p>
        Le traitement des données personnelles est régi par notre <a href="/legal/confidentialite">Politique de confidentialité</a>, conforme au RGPD.
      </p>

      <h2>Article 11 — Propriété intellectuelle</h2>
      <p>
        L&apos;Utilisateur reste propriétaire des contenus qu&apos;il fournit (réponses, profil, etc.). Il accorde à Datakeai une licence non exclusive, mondiale et gratuite d&apos;utilisation de ces contenus aux seules fins de fourniture du service.
      </p>
      <p>
        L&apos;ensemble des éléments du service (interface, code, IA, contenus pédagogiques) reste la propriété exclusive de Datakeai.
      </p>

      <h2>Article 12 — Médiation et règlement des litiges</h2>
      <p>
        En cas de litige, l&apos;Utilisateur consommateur peut recourir gratuitement à un médiateur de la consommation. Conformément à l&apos;article L.612-1 du Code de la consommation, NextMove adhère à la médiation suivante&nbsp;: <em>[Médiateur à désigner — voir <a href="https://www.economie.gouv.fr/mediation-conso" target="_blank" rel="noopener noreferrer">economie.gouv.fr</a>]</em>.
      </p>
      <p>
        L&apos;Utilisateur peut également accéder à la plateforme européenne de règlement en ligne des litiges&nbsp;: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.
      </p>

      <h2>Article 13 — Droit applicable et juridiction</h2>
      <p>
        Les présentes CGV sont régies par le droit français. Tout litige relatif à leur exécution, leur interprétation ou leur validité sera soumis aux tribunaux français compétents, sous réserve des dispositions impératives applicables aux consommateurs.
      </p>

      <h2>Article 14 — Modification des CGV</h2>
      <p>
        Datakeai se réserve le droit de modifier les présentes CGV à tout moment. Les Utilisateurs en seront informés par email au moins 30 jours avant l&apos;entrée en vigueur des modifications. À défaut de résiliation dans ce délai, l&apos;Utilisateur sera réputé avoir accepté les nouvelles conditions.
      </p>
    </LegalLayout>
  );
}
