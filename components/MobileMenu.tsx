"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
  highlight?: boolean;
}

export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="md:hidden" ref={menuRef}>
      <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors" aria-label="Menu">
        <div className="w-5 h-5 flex flex-col justify-center gap-1">
          <span className={`w-full h-0.5 bg-slate-300 rounded-full transition-transform duration-200 ${open ? "rotate-45 translate-y-[3px]" : ""}`} />
          <span className={`w-full h-0.5 bg-slate-300 rounded-full transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`w-full h-0.5 bg-slate-300 rounded-full transition-transform duration-200 ${open ? "-rotate-45 -translate-y-[3px]" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="absolute right-4 top-full mt-2 w-56 py-2 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/40">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
              className={`block px-5 py-3 text-sm font-medium transition-colors ${link.highlight ? "text-orange-400 hover:bg-orange-500/10" : "text-slate-300 hover:text-white hover:bg-white/[0.06]"}`}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
