"use client";

import { useState, useEffect } from "react";

type Dashboard = {
  date: string;
  shifts: { id: number; start: string; end: string; status: string }[];
  brew_stats: { total: number; within_spec: number; out_of_limits: number };
  temperatures: { fridge: number; temp: number; alarm: boolean; time: string }[];
  checklists: { id: number; name: string; type: string; done: boolean }[];
  pending_reminders: number;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetch(`${API}/api/dashboard`).then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="empty-state"><p>Загрузка...</p></div>;

  const stability = data.brew_stats.total > 0
    ? Math.round((data.brew_stats.within_spec / data.brew_stats.total) * 100)
    : 0;

  return (
    <div>
      <h1>Обзор дня</h1>
      <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 16 }}>
        {new Date(data.date).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
      </div>

      <div className="grid-2">
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>{data.brew_stats.total}</div>
          <div style={{ fontSize: 12, color: "var(--text)" }}>Заваров сегодня</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: stability >= 80 ? "var(--success)" : "var(--error)" }}>{stability}%</div>
          <div style={{ fontSize: 12, color: "var(--text)" }}>Стабильность</div>
        </div>
      </div>

      {data.shifts.length > 0 && (
        <div className="card">
          <h2>Смены</h2>
          {data.shifts.map((s) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span>{s.start.slice(0, 5)} – {s.end.slice(0, 5)}</span>
              <span className="badge badge-warning">{s.status}</span>
            </div>
          ))}
        </div>
      )}

      {data.temperatures.length > 0 && (
        <div className="card">
          <h2>Холодильники</h2>
          {data.temperatures.map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span>#{t.fridge}</span>
              <span style={{ fontWeight: 600, color: t.alarm ? "var(--error)" : undefined }}>
                {t.temp}°C {t.alarm ? "⚠️" : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {data.checklists.length > 0 && (
        <div className="card">
          <h2>Чек-листы</h2>
          {data.checklists.map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span>{c.name}</span>
              <span className={`badge ${c.done ? "badge-success" : "badge-warning"}`}>
                {c.done ? "✓" : "в процессе"}
              </span>
            </div>
          ))}
        </div>
      )}

      {data.pending_reminders > 0 && (
        <div className="card" style={{ borderLeft: "3px solid var(--warning)" }}>
          <span>⏰ {data.pending_reminders} напоминаний</span>
        </div>
      )}
    </div>
  );
}
