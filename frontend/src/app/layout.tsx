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
        <main className="app-content">{children}</main>
        <Navigation />
      </body>
    </html>
  );
}
