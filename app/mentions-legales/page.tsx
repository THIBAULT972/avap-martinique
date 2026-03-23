import { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales — AVAP Martinique" };

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 py-24">
      <h1 className="font-sora text-4xl font-extrabold text-white mb-8">Mentions légales</h1>
      <div className="space-y-8 text-slate-300 leading-relaxed text-[15px]">
        <section>
          <h2 className="font-sora text-xl font-bold text-white mt-8 mb-3">Éditeur du site</h2>
          <p>Association AVAP — Aide aux Victimes par l&apos;Activité Physique<br />Association loi 1901<br />Siège social : 11 Rue des Arts et Métiers, Fort-de-France 97200, Martinique<br />Email : avap.team.boulogne.yangting@gmail.com<br />Téléphone : +33 7 81 67 69 52</p>
        </section>
        <section>
          <h2 className="font-sora text-xl font-bold text-white mt-8 mb-3">Hébergement</h2>
          <p>Ce site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.</p>
        </section>
        <section>
          <h2 className="font-sora text-xl font-bold text-white mt-8 mb-3">Propriété intellectuelle</h2>
          <p>L&apos;ensemble des contenus présents sur ce site sont la propriété exclusive de l&apos;association AVAP ou de leurs auteurs respectifs. Toute reproduction est interdite sans autorisation préalable.</p>
        </section>
        <section>
          <h2 className="font-sora text-xl font-bold text-white mt-8 mb-3">Données personnelles & Cookies</h2>
          <p>Ce site utilise des cookies techniques. Aucune donnée personnelle n&apos;est collectée à des fins commerciales. Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données.</p>
        </section>
        <section>
          <h2 className="font-sora text-xl font-bold text-white mt-8 mb-3">Crédits</h2>
          <p>Site conçu et développé en Martinique.<br />Photographies : © AVAP / Team Boulogne Yang-Ting.</p>
        </section>
      </div>
    </div>
  );
}
