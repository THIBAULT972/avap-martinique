import type { Metadata } from "next";
import { Sora, Outfit } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { MobileMenu } from "@/components/MobileMenu";
import { CookieBanner } from "@/components/CookieBanner";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap", weight: ["300", "400", "500", "600", "700", "800"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap", weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "AVAP Martinique — Aide aux Victimes par l'Activité Physique",
  description: "Association dédiée à la réinsertion sociale des personnes en situation de handicap par le sport adapté en Martinique.",
  openGraph: { title: "AVAP Martinique", description: "Aide aux Victimes par l'Activité Physique", locale: "fr_FR", type: "website" },
};

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/photos", label: "Photos" },
  { href: "/quiz", label: "Quiz", highlight: true },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sora.variable} ${outfit.variable}`}>
      <body className="bg-slate-950 text-slate-100 font-outfit antialiased">

        {/* ═══ NAVBAR ═══ */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Image src="/images/logo.png" alt="AVAP" width={36} height={36} className="rounded-lg shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow" />
              <span className="font-sora font-bold text-lg text-white tracking-tight">
                AVAP
                <span className="text-orange-400 ml-1 font-light text-sm hidden sm:inline">Martinique</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.highlight ? (
                  <Link key={link.href} href={link.href}
                    className="ml-2 px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all">
                    {link.label}
                  </Link>
                ) : (
                  <Link key={link.href} href={link.href}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all">
                    {link.label}
                  </Link>
                )
              )}
            </div>

            <MobileMenu links={NAV_LINKS} />
          </div>
        </nav>

        {/* ═══ MAIN ═══ */}
        <main className="pt-16">{children}</main>

        {/* ═══ FOOTER ═══ */}
        <footer className="relative border-t border-white/[0.06] bg-slate-950">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Image src="/images/logo.png" alt="AVAP" width={32} height={32} className="rounded-lg" />
                  <span className="font-sora font-bold text-white">AVAP</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                  Association dédiée à la réinsertion sociale des personnes en situation de handicap par l&apos;activité physique et le sport adapté en Martinique.
                </p>
              </div>
              <div>
                <h4 className="font-sora font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
                <div className="space-y-3 text-sm text-slate-400">
                  <a href="mailto:avap.team.boulogne.yangting@gmail.com" className="block hover:text-orange-400 transition-colors">avap.team.boulogne.yangting@gmail.com</a>
                  <p>+33 7 81 67 69 52</p>
                  <p>11 Rue des Arts et Métiers<br />Fort-de-France 97200, Martinique</p>
                </div>
              </div>
              <div>
                <h4 className="font-sora font-semibold text-white mb-4 text-sm uppercase tracking-wider">Navigation</h4>
                <div className="space-y-3">
                  {[{ href: "/", label: "Accueil" }, { href: "/photos", label: "Photos" }, { href: "/quiz", label: "Quiz Sécurité" }, { href: "/contact", label: "Contact" }, { href: "/mentions-legales", label: "Mentions légales" }].map((link) => (
                    <Link key={link.href} href={link.href} className="block text-sm text-slate-400 hover:text-white transition-colors">{link.label}</Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} AVAP Martinique. Tous droits réservés.</p>
              <div className="flex items-center gap-6">
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-orange-400 transition-colors text-sm">Facebook</a>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-orange-400 transition-colors text-sm">Instagram</a>
              </div>
            </div>
          </div>
        </footer>

        <CookieBanner />
      </body>
    </html>
  );
}
