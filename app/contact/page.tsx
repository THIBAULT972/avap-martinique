"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Globe, Send, ArrowRight } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    const mailto = `mailto:avap.team.boulogne.yangting@gmail.com?subject=Contact - ${encodeURIComponent(form.name)}&body=${encodeURIComponent(`Nom: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.open(mailto);
    setSent(true);
  };

  return (
    <div className="min-h-screen">
      <section className="relative py-32 text-center">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative z-10 px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-sm font-semibold text-orange-400 uppercase tracking-widest">Nous écrire</span>
            <h1 className="font-sora text-4xl md:text-6xl font-extrabold text-white mt-4 tracking-tight">Contact</h1>
            <p className="mt-5 text-slate-400 max-w-lg mx-auto">Une question, un partenariat ou envie de rejoindre l&apos;aventure ?</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-sora text-2xl font-bold text-white mb-8">Informations</h2>
            <div className="space-y-8">
              {[
                { icon: Mail, label: "Email", content: <a href="mailto:avap.team.boulogne.yangting@gmail.com" className="text-slate-400 text-sm hover:text-orange-400 transition-colors break-all">avap.team.boulogne.yangting@gmail.com</a> },
                { icon: Phone, label: "Téléphone", content: <p className="text-slate-400 text-sm">+33 7 81 67 69 52</p> },
                { icon: MapPin, label: "Adresse", content: <p className="text-slate-400 text-sm">11 Rue des Arts et Métiers<br />Fort-de-France 97200, Martinique</p> },
                { icon: Globe, label: "Réseaux", content: (
                  <div className="flex gap-4 mt-1">
                    <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-slate-400 text-sm hover:text-orange-400 transition-colors">Facebook</a>
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-slate-400 text-sm hover:text-orange-400 transition-colors">Instagram</a>
                  </div>
                )},
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-5">
                  <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div><p className="font-semibold text-white text-sm mb-1">{item.label}</p>{item.content}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            {sent ? (
              <div className="p-10 rounded-3xl bg-slate-900/80 border border-emerald-500/30 text-center">
                <Send className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <p className="font-sora text-xl font-bold text-emerald-400">Message prêt !</p>
                <p className="text-slate-400 mt-3 text-sm">Votre client mail s&apos;est ouvert.</p>
                <button onClick={() => setSent(false)} className="mt-5 inline-flex items-center gap-2 text-sm text-orange-400 hover:underline">
                  Envoyer un autre message <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/[0.06]">
                <h2 className="font-sora text-xl font-bold text-white mb-8">Envoyez-nous un message</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Nom</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none transition-colors" placeholder="Votre nom" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none transition-colors" placeholder="votre@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none transition-colors resize-none" placeholder="Votre message..." />
                  </div>
                  <button onClick={handleSubmit} disabled={!form.name || !form.email || !form.message}
                    className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Envoyer
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
