"use client";

import { useState, useEffect } from "react";

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Лог завариваний</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "+ Записать"}
        </button>
      </div>

      {todayLogs.length > 0 && (
        <div className="card" style={{ background: "var(--bg-secondary)" }}>
          <div style={{ fontSize: 13, color: "var(--text)" }}>
            Сегодня: {todayLogs.length} заваров · {withinSpec} в норме · {todayLogs.length - withinSpec} выход
          </div>
        </div>
      )}

      {showForm && (
        <div className="card">
          <input className="input" placeholder="Зерно" value={form.coffee_beans}
            onChange={(e) => setForm({ ...form, coffee_beans: e.target.value })} style={{ marginBottom: 8 }} />
          <div className="grid-2" style={{ marginBottom: 8 }}>
            <input className="input" type="number" placeholder="Закладка (г)" value={form.weight_in}
              onChange={(e) => setForm({ ...form, weight_in: +e.target.value })} />
            <input className="input" type="number" placeholder="Выход (г)" value={form.weight_out}
              onChange={(e) => setForm({ ...form, weight_out: +e.target.value })} />
          </div>
          <div className="grid-2" style={{ marginBottom: 8 }}>
            <input className="input" type="number" placeholder="Время (сек)" value={form.brew_time}
              onChange={(e) => setForm({ ...form, brew_time: +e.target.value })} />
            <input className="input" type="number" placeholder="TDS %" value={form.tds || ""}
              onChange={(e) => setForm({ ...form, tds: +e.target.value || null })} />
          </div>
          <button className="btn btn-primary" onClick={handleCreate} style={{ width: "100%" }}>
            Сохранить
          </button>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="empty-state"><p>Записей пока нет</p></div>
      ) : (
        logs.slice(0, 30).map((l) => (
          <div key={l.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{l.coffee_beans}</div>
                <div style={{ fontSize: 13, color: "var(--text)", marginTop: 2 }}>
                  {l.method} · {l.weight_in}г→{l.weight_out}г · {l.brew_time}с
                </div>
              </div>
              <span className={`badge ${l.status === "within_spec" ? "badge-success" : "badge-error"}`}>
                {l.extraction ? `${l.extraction}%` : "—"}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
