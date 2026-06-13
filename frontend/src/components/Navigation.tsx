"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, ClipboardList, Croissant, LayoutDashboard } from "lucide-react";

const tabs = [
  { href: "/coffee", label: "Кофе", icon: Coffee },
  { href: "/operations", label: "Операции", icon: ClipboardList },
  { href: "/bakery", label: "Булки", icon: Croissant },
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="nav-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
