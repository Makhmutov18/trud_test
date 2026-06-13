"use client";

import Link from "next/link";

export default function CoffeePage() {
  const sections = [
    { href: "/coffee/recipes", icon: "📝", title: "Рецепты", desc: "Pourover, espresso, batch" },
    { href: "/coffee/lots", icon: "🌱", title: "Лоты", desc: "Зерно, обжарка, происхождение" },
    { href: "/coffee/tea", icon: "🍵", title: "Чай", desc: "Заваривание, описание" },
    { href: "/coffee/brew-log", icon: "⏱️", title: "Лог завариваний", desc: "Записи, TDS, экстракция" },
  ];

  return (
    <div>
      <h1>Кофе</h1>
      {sections.map((s) => (
        <Link key={s.href} href={s.href} style={{ textDecoration: "none" }}>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div>
              <div style={{ fontWeight: 600, color: "var(--text-dark)" }}>{s.title}</div>
              <div style={{ fontSize: 13, color: "var(--text)" }}>{s.desc}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
