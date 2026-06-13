"use client";

import Link from "next/link";
import { Calendar, Thermometer, ClipboardCheck } from "lucide-react";

export default function OperationsPage() {
  const sections = [
    { href: "/operations/schedule", icon: Calendar, title: "ГРАФИК СМЕН", desc: "КАЛЕНДАРЬ, РЕДАКТИРОВАНИЕ" },
    { href: "/operations/temperature", icon: Thermometer, title: "ТЕМПЕРАТУРА", desc: "ЛОГ ХОЛОДИЛЬНИКОВ" },
    { href: "/operations/checklists", icon: ClipboardCheck, title: "ЧЕК-ЛИСТЫ", desc: "ОТКРЫТИЕ, ЗАКРЫТИЕ, УБОРКА" },
  ];

  return (
    <div>
      <h1 className="text-heading text-coffee mb-5 uppercase tracking-widest">ОПЕРАЦИИ</h1>
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
