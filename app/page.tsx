"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  Handshake,
  BookOpen,
  Medal,
  ShieldCheck,
  Scale,
  Gamepad2,
  ChevronDown,
  MapPin,
  Calendar,
  Users,
  Infinity as InfinityIcon,
} from "lucide-react";

function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }} className={className}>
      {children}
    </motion.div>
  );
}

function StatCard({ value, label, icon: Icon, delay = 0 }: { value: string; label: string; icon: React.ElementType; delay?: number }) {
  return (
    <RevealSection delay={delay}>
      <div className="text-center p-8">
        <div className="flex justify-center mb-3">
          <Icon className="w-5 h-5 text-orange-400" />
        </div>
        <div className="font-sora text-4xl md:text-5xl font-extrabold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">{value}</div>
        <div className="mt-2 text-sm text-slate-400 font-medium">{label}</div>
      </div>
    </RevealSection>
  );
}

function ContentCard({ title, text, icon: Icon, delay = 0 }: { title: string; text: string; icon: React.ElementType; delay?: number }) {
  return (
    <RevealSection delay={delay}>
      <div className="group relative p-8 rounded-3xl bg-slate-900/50 border border-white/[0.06] hover:border-orange-500/20 transition-all duration-500 hover:bg-slate-900/80 h-full">
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-orange-500/5 to-transparent" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
            <Icon className="w-6 h-6 text-orange-400" />
          </div>
          <h3 className="font-sora text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
          <p className="text-slate-400 leading-relaxed text-[15px]">{text}</p>
        </div>
      </div>
    </RevealSection>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const teamY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <>
      <div className="noise-overlay" />

      {/* ═══════════════════════════════════════════
           HERO
         ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>
        <div className="absolute top-1/4 left-[10%] w-72 h-72 rounded-full bg-orange-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-[10%] w-64 h-64 rounded-full bg-orange-400/8 blur-[120px] animate-pulse" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-slate-400 mb-10">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            Association loi 1901 · Fort-de-France, Martinique
          </motion.div>

          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mb-10 flex justify-center">
            <Image src="/images/logo.png" alt="Logo AVAP" width={120} height={120}
              className="rounded-full shadow-2xl shadow-orange-500/20 ring-2 ring-white/10" priority />
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="font-sora text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95]">
            <span className="bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">Aide aux Victimes</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-amber-400 bg-clip-text text-transparent">par l&apos;Activité Physique</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Réinsertion sociale par le sport adapté. Solidarité, inclusion et dépassement de soi au cœur de la Martinique.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/quiz" className="group relative px-8 py-4 rounded-2xl text-white font-semibold overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-orange-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Lancer le Quiz
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link href="/contact" className="px-8 py-4 rounded-2xl text-slate-300 font-medium border border-white/[0.1] hover:bg-white/[0.04] hover:border-white/[0.15] transition-all">
              Nous contacter
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <ChevronDown className="w-6 h-6 text-white/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
           STATS
         ═══════════════════════════════════════════ */}
      <section className="relative py-16 border-y border-white/[0.06] bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="2021" label="Année de création" icon={Calendar} />
          <StatCard value="7" label="Athlètes TBYT" icon={Users} delay={0.1} />
          <StatCard value="972" label="Martinique" icon={MapPin} delay={0.2} />
          <StatCard value="∞" label="Ambition" icon={InfinityIcon} delay={0.3} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
           TEAM IMAGE — cidolit athlete
         ═══════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <RevealSection>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-orange-400 uppercase tracking-widest">Notre équipe</span>
              <h2 className="font-sora text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">Team Boulogne Yang-Ting</h2>
              <p className="mt-4 text-slate-400 max-w-xl mx-auto">Sept athlètes déterminés repoussant les frontières de l&apos;handisport en Martinique.</p>
            </div>
          </RevealSection>

          <RevealSection delay={0.2}>
            <motion.div style={{ y: teamY }} className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-orange-500/5">
              {/* L'image team.png a un fond noir, on ajoute un dégradé subtil */}
              <div className="relative aspect-[16/8] bg-black">
                <Image src="/images/team.png" alt="Team Boulogne Yang-Ting — Champions handisport de Martinique"
                  fill className="object-contain" priority sizes="(max-width: 768px) 100vw, 1280px" />
                {/* Dégradé bas pour le texte overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <p className="font-sora text-xl md:text-2xl font-bold text-white max-w-xl">
                  Judo, escrime, force athlétique — l&apos;excellence au service de l&apos;inclusion
                </p>
                <p className="text-slate-300 mt-3 text-sm md:text-base max-w-lg leading-relaxed">
                  Inspirant le dépassement de soi à travers le sport adapté de haut niveau.
                </p>
              </div>
            </motion.div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
           À PROPOS
         ═══════════════════════════════════════════ */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-6">
          <RevealSection>
            <div className="text-center mb-20">
              <span className="text-sm font-semibold text-orange-400 uppercase tracking-widest">Qui sommes-nous</span>
              <h2 className="font-sora text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">Notre Mission</h2>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ContentCard icon={Handshake} title="À Propos de l'Association" delay={0.1}
              text="L'Association AVAP, basée en Martinique, est une initiative humanitaire dédiée à la réinsertion sociale des personnes en situation de handicap par le biais de l'activité physique et du sport adapté. Fondée sur les principes de solidarité, d'inclusion et de valorisation de chaque individu." />
            <ContentCard icon={BookOpen} title="Notre Histoire" delay={0.2}
              text="L'histoire d'AVAP prend racine en 2021 dans la conviction profonde que le sport peut être un formidable levier de changement social. L'idée a germé à partir d'expériences personnelles et professionnelles, où le pouvoir libérateur du sport a été observé." />
            <ContentCard icon={Medal} title="Team Boulogne Yang-Ting" delay={0.3}
              text="Plongez dans l'univers de la Team Boulogne Yang-Ting, où sept athlètes déterminés repoussent les frontières de l'handisport, inspirant le dépassement de soi et l'inclusion à travers l'excellence sportive." />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
           ATHLETE HIGHLIGHT — cidolit (VTT)
         ═══════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <RevealSection>
              <div className="relative aspect-square max-w-lg mx-auto lg:mx-0">
                <Image src="/images/cidolit.png" alt="Athlète AVAP VTT handisport"
                  fill className="object-contain" sizes="(max-width: 768px) 100vw, 600px" />
              </div>
            </RevealSection>

            <RevealSection delay={0.2}>
              <div>
                <span className="text-sm font-semibold text-orange-400 uppercase tracking-widest">Le sport comme levier</span>
                <h2 className="font-sora text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight leading-tight">
                  Dépasser les limites,<br />
                  <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">inspirer le changement</span>
                </h2>
                <p className="mt-6 text-slate-400 leading-relaxed text-[15px]">
                  Chaque athlète de la Team Boulogne Yang-Ting démontre que le handicap n&apos;est pas un obstacle mais un tremplin. Du VTT au judo en passant par l&apos;escrime, nos champions prouvent chaque jour que la volonté n&apos;a pas de limites.
                </p>
                <p className="mt-4 text-slate-400 leading-relaxed text-[15px]">
                  L&apos;association AVAP accompagne ces parcours avec un soutien matériel, logistique et humain pour permettre à chacun d&apos;atteindre l&apos;excellence.
                </p>
                <Link href="/photos" className="inline-flex items-center gap-2 mt-8 text-orange-400 font-semibold hover:text-orange-300 transition-colors">
                  Voir la galerie
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
           QUIZ CTA
         ═══════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-950/10 to-transparent" />

        <RevealSection>
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-sm text-orange-400 mb-8">
              <Gamepad2 className="w-4 h-4" />
              Quiz interactif
            </div>

            <h2 className="font-sora text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Sécurité Routière &<br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Connaissance du Droit</span>
            </h2>

            <p className="mt-8 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
              20 questions sur la sécurité routière et le droit en Martinique. Jouez en temps réel avec jusqu&apos;à 40+ participants.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-5 max-w-md mx-auto text-left">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <ShieldCheck className="w-7 h-7 text-orange-400 mb-3" />
                <div className="font-sora font-bold text-white text-sm">10 questions Route</div>
                <div className="text-xs text-slate-400 mt-1.5">Chiffres, lois, sanctions</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <Scale className="w-7 h-7 text-orange-400 mb-3" />
                <div className="font-sora font-bold text-white text-sm">10 questions Droit</div>
                <div className="text-xs text-slate-400 mt-1.5">Pénal, armes, harcèlement</div>
              </div>
            </div>

            <Link href="/quiz" className="inline-flex items-center gap-2 mt-12 px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all">
              Accéder au Quiz
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </RevealSection>
      </section>

      {/* ═══════════════════════════════════════════
           PARTENAIRE
         ═══════════════════════════════════════════ */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-widest mb-10">Avec le soutien de</p>
          <RevealSection>
            <div className="flex items-center justify-center gap-12">
              {/* Ajoute d'autres logos partenaires ici si besoin */}
              <div className="opacity-40 hover:opacity-100 transition-opacity duration-300">
                <div className="text-slate-400 text-sm font-medium">Nos partenaires</div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>
    </>
  );
}
