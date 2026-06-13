"use client";

import { useState, useEffect } from "react";
import { BarChart3, Coffee, ClipboardList, Thermometer, Bell } from "lucide-react";

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

  if (!data) return <div className="empty-state uppercase tracking-widest"><p>ЗАГРУЗКА...</p></div>;

  const stability = data.brew_stats.total > 0
    ? Math.round((data.brew_stats.within_spec / data.brew_stats.total) * 100)
    : 0;

  return (
    <div>
      <h1 className="text-heading text-coffee mb-1 uppercase tracking-widest">ОБЗОР ДНЯ</h1>
      <div className="text-caption text-earth mb-5 uppercase tracking-widest">
        {new Date(data.date).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
      </div>

      <div className="grid-2 mb-4">
        <div className="card flex flex-col items-center justify-center text-center gap-2">
          <Coffee size={24} strokeWidth={1.5} className="text-olive" />
          <div className="text-heading font-bold text-olive">{data.brew_stats.total}</div>
          <div className="text-caption text-earth uppercase tracking-widest">ЗАВАРОВ СЕГОДНЯ</div>
        </div>
        <div className="card flex flex-col items-center justify-center text-center gap-2">
          <BarChart3 size={24} strokeWidth={1.5} className={stability >= 80 ? "text-olive" : "text-red"} />
          <div className={`text-heading font-bold ${stability >= 80 ? "text-olive" : "text-red"}`}>{stability}%</div>
          <div className="text-caption text-earth uppercase tracking-widest">СТАБИЛЬНОСТЬ</div>
        </div>
      </div>

      {data.shifts.length > 0 && (
        <div className="card mb-4">
          <h2 className="text-caption font-bold text-coffee uppercase tracking-widest mb-3">СМЕНЫ</h2>
          {data.shifts.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-caption text-coffee">{s.start.slice(0, 5)} – {s.end.slice(0, 5)}</span>
              <span className="chip chip-active text-caption">{s.status}</span>
            </div>
          ))}
        </div>
      )}

      {data.temperatures.length > 0 && (
        <div className="card mb-4">
          <h2 className="text-caption font-bold text-coffee uppercase tracking-widest mb-3">ХОЛОДИЛЬНИКИ</h2>
          {data.temperatures.map((t, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <Thermometer size={16} strokeWidth={1.5} className={t.alarm ? "text-red" : "text-clay"} />
                <span className="text-caption text-coffee">#{t.fridge}</span>
              </div>
              <span className={`text-caption font-semibold ${t.alarm ? "text-red" : "text-coffee"}`}>
                {t.temp}°C {t.alarm ? "⚠️" : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {data.checklists.length > 0 && (
        <div className="card mb-4">
          <h2 className="text-caption font-bold text-coffee uppercase tracking-widest mb-3">ЧЕК-ЛИСТЫ</h2>
          {data.checklists.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-caption text-coffee">{c.name}</span>
              <span className={`chip text-caption ${c.done ? "chip-active" : ""}`}>
                {c.done ? "ГОТОВО" : "В ПРОЦЕССЕ"}
              </span>
            </div>
          ))}
        </div>
      )}

      {data.pending_reminders > 0 && (
        <div className="card flex items-center gap-3 border-red/30">
          <Bell size={20} strokeWidth={1.5} className="text-red" />
          <span className="text-caption font-semibold text-red uppercase tracking-widest">
            {data.pending_reminders} НАПОМИНАНИЙ
          </span>
        </div>
      )}
    </div>
  );
}
