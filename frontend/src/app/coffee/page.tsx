"use client";

import Link from "next/link";
import { FileText, Coffee, Leaf, Timer } from "lucide-react";

export default function CoffeePage() {
  const sections = [
    { href: "/coffee/recipes", icon: FileText, title: "РЕЦЕПТЫ", desc: "POUROVER, ESPRESSO, BATCH" },
    { href: "/coffee/lots", icon: Coffee, title: "ЛОТЫ", desc: "ЗЕРНО, ОБЖАРКА, ПРОИСХОЖДЕНИЕ" },
    { href: "/coffee/tea", icon: Leaf, title: "ЧАЙ", desc: "ЗАВАРИВАНИЕ, ОПИСАНИЕ" },
    { href: "/coffee/brew-log", icon: Timer, title: "ЛОГ ЗАВАРИВАНИЙ", desc: "ЗАПИСИ, TDS, ЭКСТРАКЦИЯ" },
  ];

  return (
    <div>
      <h1 className="text-heading text-coffee mb-5 uppercase tracking-widest">КОФЕ</h1>
      {sections.map((s) => {
        const Icon = s.icon;
        return (
          <Link key={s.href} href={s.href} style={{ textDecoration: "none" }}>
            <div className="card card-hover flex items-center gap-4 mb-3">
              <Icon size={28} strokeWidth={1.5} className="text-clay shrink-0" />
              <div>
                <div className="text-caption font-semibold text-coffee uppercase tracking-widest">{s.title}</div>
                <div className="text-caption text-earth mt-0.5 uppercase tracking-widest">{s.desc}</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
