"use client";

import Link from "next/link";

export default function OperationsPage() {
  const sections = [
    { href: "/operations/schedule", icon: "📅", title: "График смен", desc: "Календарь, редактирование" },
    { href: "/operations/temperature", icon: "🌡️", title: "Температура", desc: "Лог холодильников" },
    { href: "/operations/checklists", icon: "✅", title: "Чек-листы", desc: "Открытие, закрытие, уборка" },
  ];

  return (
    <div>
      <h1>Операции</h1>
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
