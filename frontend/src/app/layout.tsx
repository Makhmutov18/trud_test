import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "ТРУД",
  description: "Internal management app for ТРУД coffee bar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {/* Constructivist Header */}
        <header className="mb-6 flex flex-col items-center pt-4">
          <div className="flex items-baseline gap-0.5">
            <span className="text-display logo-t tracking-[-0.08em]">Т</span>
            <span className="text-display logo-r tracking-[-0.08em]">Р</span>
            <span className="text-display logo-u tracking-[-0.08em]">У</span>
            <span className="text-display logo-d tracking-[-0.08em]">Д</span>
          </div>
          <p className="mt-1 text-caption font-medium uppercase tracking-[0.2em] text-[#70655B]">
            Кофейное пространство
          </p>
        </header>
        <main className="app-content">{children}</main>
        <Navigation />
      </body>
    </html>
  );
}
