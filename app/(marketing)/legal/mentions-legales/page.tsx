import type { Metadata } from "next";
import { LegalLayout } from "../_components/legal-layout";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site NextMove AI.",
  alternates: { canonical: "/legal/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" lastUpdated="5 mai 2026">
      <h2>1. Éditeur du site</h2>
      <p>
        Le site <strong>nextmove.sh</strong> est édité par&nbsp;:
      </p>
      <ul>
        <li>
          <strong>Datakeai</strong> — Société à responsabilité limitée à associé unique (EURL)
        </li>
        <li>Capital social : 500 €</li>
        <li>Siège social : 96 rue des Vignobles, 78400 Chatou, France</li>
        <li>SIRET : 977 813 757 00019</li>
        <li>RCS Versailles</li>
        <li>Code APE : 6202A — Conseil en systèmes et logiciels informatiques</li>
        <li>N° TVA intracommunautaire : FR69977813757</li>
        <li>Gérant : Yassine Errochdi</li>
        <li>
          Contact : <a href="mailto:contact@nextmove.sh">contact@nextmove.sh</a>
        </li>
      </ul>

      <h2>2. Directeur de la publication</h2>
      <p>Yassine Errochdi, en qualité de gérant.</p>

      <h2>3. Hébergeur</h2>
      <p>
        Le site est hébergé par&nbsp;:
      </p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong>
        </li>
        <li>340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
        <li>
          Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
        </li>
      </ul>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus du site (textes, graphismes, logos, images, code source, vidéos, charte graphique) est la propriété exclusive de Datakeai ou de ses partenaires, et est protégé par le Code de la propriété intellectuelle.
      </p>
      <p>
        Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle, du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit, est interdite sans l&apos;autorisation écrite préalable de Datakeai.
      </p>

      <h2>5. Liens hypertextes</h2>
      <p>
        Les liens hypertextes mis en place dans le cadre du site nextmove.sh en direction d&apos;autres sites ne sauraient engager la responsabilité de Datakeai, notamment quant au contenu de ces sites.
      </p>

      <h2>6. Crédits</h2>
      <p>
        Conception, développement et exploitation du site : Datakeai. Photographies du fondateur : tous droits réservés.
      </p>

      <h2>7. Droit applicable</h2>
      <p>
        Les présentes mentions légales sont soumises au droit français. En cas de litige, et après échec de toute tentative de règlement amiable, les tribunaux français seront seuls compétents.
      </p>
    </LegalLayout>
  );
}
