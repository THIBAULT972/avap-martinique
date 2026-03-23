"use client";

import { useState, useEffect } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("avap-cookies-accepted")) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[100] p-5 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/40">
      <div className="flex items-start gap-4">
        <span className="text-2xl flex-shrink-0 mt-0.5">🍪</span>
        <div className="flex-1">
          <p className="text-sm text-slate-300 leading-relaxed">
            Ce site utilise des cookies pour améliorer votre expérience. En continuant, vous acceptez notre{" "}
            <a href="/mentions-legales" className="text-orange-400 underline underline-offset-2 hover:text-orange-300">politique de confidentialité</a>.
          </p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => { localStorage.setItem("avap-cookies-accepted", "true"); setVisible(false); }}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/25 active:scale-95 transition-all">
              Accepter
            </button>
            <button onClick={() => setVisible(false)}
              className="px-5 py-2 rounded-full text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
