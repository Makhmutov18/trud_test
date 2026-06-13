import { Coffee, ClipboardList, Croissant, BarChart3 } from "lucide-react";

export default function Home() {
  const links = [
    { href: "/coffee", icon: Coffee, label: "КОФЕ", desc: "РЕЦЕПТЫ, ЛОТЫ, ЧАЙ" },
    { href: "/operations", icon: ClipboardList, label: "ОПЕРАЦИИ", desc: "СМЕНЫ, ЧЕК-ЛИСТЫ" },
    { href: "/bakery", icon: Croissant, label: "БУЛКИ", desc: "МЕНЮ, СОСТАВ" },
    { href: "/dashboard", icon: BarChart3, label: "ОБЗОР ДНЯ", desc: "СТАТИСТИКА" },
  ];

  return (
    <div>
      <h1 className="text-heading text-coffee mb-5 uppercase tracking-widest">ТРУД</h1>
      <div className="card mb-4">
        <h2 className="text-subheading text-coffee uppercase tracking-widest">ДОБРО ПОЖАЛОВАТЬ</h2>
        <p className="text-caption text-earth mt-2 uppercase tracking-widest">
          ПРОСТРАНСТВО, ГДЕ ТРУД СТАНОВИТСЯ ВИДИМЫМ
        </p>
      </div>
      <div className="grid-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.href}
              href={link.href}
              className="card card-hover flex flex-col items-center justify-center text-center gap-3"
              style={{ textDecoration: "none" }}
            >
              <Icon size={32} strokeWidth={1.5} className="text-clay" />
              <div>
                <div className="text-caption font-semibold text-coffee uppercase tracking-widest">{link.label}</div>
                <div className="text-caption text-earth mt-1 uppercase tracking-widest">{link.desc}</div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
