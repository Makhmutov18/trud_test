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
            <span className="text-[2.75rem] font-black leading-none tracking-[-0.08em] logo-t">Т</span>
            <span className="text-[2.75rem] font-black leading-none tracking-[-0.08em] logo-r">Р</span>
            <span className="text-[2.75rem] font-black leading-none tracking-[-0.08em] logo-u">У</span>
            <span className="text-[2.75rem] font-black leading-none tracking-[-0.08em] logo-d">Д</span>
          </div>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-[#70655B]">
            Кофейное пространство
          </p>
        </header>
        <main className="app-content">{children}</main>
        <Navigation />
      </body>
    </html>
  );
}
