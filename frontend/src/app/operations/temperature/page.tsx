"use client";

import { useState, useEffect } from "react";

type TempLog = {
  id: number;
  fridge_number: number;
  temperature: number;
  recorded_at: string;
  is_alarm: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TemperaturePage() {
  const [logs, setLogs] = useState<TempLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fridge_number: 1, temperature: 4.0 });

  useEffect(() => {
    fetch(`${API}/api/operations/temperature`).then((r) => r.json()).then(setLogs).catch(console.error);
  }, []);

  const handleCreate = async () => {
    const res = await fetch(`${API}/api/operations/temperature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const log = await res.json();
      setLogs([log, ...logs]);
      setShowForm(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Температура</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "+ Записать"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <input className="input" type="number" placeholder="Номер холодильника" value={form.fridge_number}
            onChange={(e) => setForm({ ...form, fridge_number: +e.target.value })} style={{ marginBottom: 8 }} />
          <input className="input" type="number" step="0.1" placeholder="Температура (°C)" value={form.temperature}
            onChange={(e) => setForm({ ...form, temperature: +e.target.value })} style={{ marginBottom: 8 }} />
          <button className="btn btn-primary" onClick={handleCreate} style={{ width: "100%" }}>
            Записать
          </button>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="empty-state"><p>Записей пока нет</p></div>
      ) : (
        logs.slice(0, 30).map((l) => (
          <div key={l.id} className="card" style={{ borderLeft: l.is_alarm ? "3px solid var(--error)" : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Холодильник #{l.fridge_number}</span>
              <span style={{ fontWeight: 600 }}>{l.temperature}°C</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text)", marginTop: 4 }}>
              {new Date(l.recorded_at).toLocaleString("ru-RU")}
            </div>
            {l.is_alarm && <span className="badge badge-error" style={{ marginTop: 4 }}>Вне нормы!</span>}
          </div>
        ))
      )}
    </div>
  );
}
