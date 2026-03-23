"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

const PHOTOS = [
  { src: "/images/team.png", alt: "Team Boulogne Yang-Ting", caption: "L'équipe au complet" },
  // Ajoute tes photos ici :
  // { src: "/images/photo1.jpg", alt: "Description", caption: "Légende" },
];

function PhotoCard({ src, alt, caption, index }: { src: string; alt: string; caption: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-900">
      <div className="relative aspect-[4/3]">
        <Image src={src} alt={alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white font-semibold text-sm">{caption}</p>
      </div>
    </motion.div>
  );
}

export default function PhotosPage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-24 text-center">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative z-10 px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-sm font-semibold text-orange-400 uppercase tracking-widest">Galerie</span>
            <h1 className="font-sora text-4xl md:text-6xl font-extrabold text-white mt-3 tracking-tight">Nos Photos</h1>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto">Moments forts, compétitions et entraînements de la Team Boulogne Yang-Ting.</p>
          </motion.div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 pb-24">
        {PHOTOS.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PHOTOS.map((photo, i) => <PhotoCard key={i} index={i} {...photo} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📸</div>
            <p className="text-slate-400">Les photos arrivent bientôt !</p>
          </div>
        )}
      </section>
    </div>
  );
}
