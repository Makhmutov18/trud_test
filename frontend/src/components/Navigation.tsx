"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/coffee", label: "Кофе", icon: "☕" },
  { href: "/operations", label: "Операции", icon: "📋" },
  { href: "/bakery", label: "Булки", icon: "🥐" },
  { href: "/dashboard", label: "Обзор", icon: "📊" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </Link>
        );
      })}
      <style jsx>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-around;
          padding: 8px 0;
          padding-bottom: max(8px, env(safe-area-inset-bottom));
          z-index: 100;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          text-decoration: none;
          color: var(--text);
          padding: 4px 12px;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .nav-item.active {
          color: var(--primary);
          background: var(--bg-secondary);
        }
        .nav-icon {
          font-size: 20px;
        }
        .nav-label {
          font-size: 11px;
          font-weight: 600;
        }
      `}</style>
    </nav>
  );
}
