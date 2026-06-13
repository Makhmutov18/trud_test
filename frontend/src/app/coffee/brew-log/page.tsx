"use client";

import { useState, useEffect } from "react";
import { Timer, Plus, X } from "lucide-react";

type BrewLog = {
  id: number;
  coffee_beans: string;
  method: string;
  weight_in: number;
  weight_out: number;
  brew_time: number;
  temperature: number | null;
  tds: number | null;
  extraction: number | null;
  status: string;
  created_at: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function BrewLogPage() {
  const [logs, setLogs] = useState<BrewLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{
    coffee_beans: string; method: string; weight_in: number; weight_out: number;
    brew_time: number; temperature: number | null; tds: number | null; notes: string;
  }>({
    coffee_beans: "", method: "V60", weight_in: 15, weight_out: 250,
    brew_time: 180, temperature: 92, tds: 1.35, notes: "",
  });

  useEffect(() => {
    fetch(`${API}/api/coffee/brew-log`).then((r) => r.json()).then(setLogs).catch(console.error);
  }, []);

  const handleCreate = async () => {
    const extraction = form.tds ? +((form.weight_out * form.tds) / form.weight_in).toFixed(2) : null;
    const res = await fetch(`${API}/api/coffee/brew-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, extraction }),
    });
    if (res.ok) {
      const log = await res.json();
      setLogs([log, ...logs]);
      setShowForm(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todayLogs = logs.filter((l) => l.created_at.startsWith(today));
  const withinSpec = todayLogs.filter((l) => l.status === "within_spec").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-heading text-coffee uppercase tracking-widest">ЛОГ ЗАВАРИВАНИЙ</h1>
        <button className="btn flex items-center gap-1.5" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
          {showForm ? "ОТМЕНА" : "ЗАПИСАТЬ"}
        </button>
      </div>

      {todayLogs.length > 0 && (
        <div className="card bg-sand mb-4">
          <div className="text-caption text-earth uppercase tracking-widest">
            СЕГОДНЯ: {todayLogs.length} ЗАВАРОВ · {withinSpec} В НОРМЕ · {todayLogs.length - withinSpec} ВЫХОД
          </div>
        </div>
      )}

      {showForm && (
        <div className="card mb-4 space-y-3">
          <input className="input" placeholder="ЗЕРНО" value={form.coffee_beans}
            onChange={(e) => setForm({ ...form, coffee_beans: e.target.value })} />
          <div className="grid-2">
            <input className="input" type="number" placeholder="ЗАКЛАДКА (Г)" value={form.weight_in}
              onChange={(e) => setForm({ ...form, weight_in: +e.target.value })} />
            <input className="input" type="number" placeholder="ВЫХОД (Г)" value={form.weight_out}
              onChange={(e) => setForm({ ...form, weight_out: +e.target.value })} />
          </div>
          <div className="grid-2">
            <input className="input" type="number" placeholder="ВРЕМЯ (СЕК)" value={form.brew_time}
              onChange={(e) => setForm({ ...form, brew_time: +e.target.value })} />
            <input className="input" type="number" placeholder="TDS %" value={form.tds || ""}
              onChange={(e) => setForm({ ...form, tds: +e.target.value || null })} />
          </div>
          <button className="btn btn-primary w-full uppercase tracking-widest" onClick={handleCreate}>
            СОХРАНИТЬ
          </button>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="empty-state uppercase tracking-widest"><p>ЗАПИСЕЙ ПОКА НЕТ</p></div>
      ) : (
        logs.slice(0, 30).map((l) => (
          <div key={l.id} className="card mb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Timer size={16} strokeWidth={1.5} className="text-clay" />
                  <span className="text-caption font-semibold text-coffee uppercase tracking-widest">{l.coffee_beans}</span>
                </div>
                <div className="text-caption text-earth mt-1 uppercase tracking-widest">
                  {l.method} · {l.weight_in}Г→{l.weight_out}Г · {l.brew_time}С
                </div>
              </div>
              <span className={`chip text-caption ${l.status === "within_spec" ? "chip-active" : ""}`}>
                {l.extraction ? `${l.extraction}%` : "—"}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
