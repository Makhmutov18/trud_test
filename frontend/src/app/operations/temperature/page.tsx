"use client";

import { useState, useEffect } from "react";
import { Thermometer, Plus, X } from "lucide-react";

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
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-heading text-coffee uppercase tracking-widest">ТЕМПЕРАТУРА</h1>
        <button className="btn flex items-center gap-1.5" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
          {showForm ? "ОТМЕНА" : "ЗАПИСАТЬ"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <input className="input" type="number" placeholder="НОМЕР ХОЛОДИЛЬНИКА" value={form.fridge_number}
            onChange={(e) => setForm({ ...form, fridge_number: +e.target.value })} />
          <input className="input" type="number" step="0.1" placeholder="ТЕМПЕРАТУРА (°C)" value={form.temperature}
            onChange={(e) => setForm({ ...form, temperature: +e.target.value })} />
          <button className="btn btn-primary w-full uppercase tracking-widest" onClick={handleCreate}>
            ЗАПИСАТЬ
          </button>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="empty-state uppercase tracking-widest"><p>ЗАПИСЕЙ ПОКА НЕТ</p></div>
      ) : (
        logs.slice(0, 30).map((l) => (
          <div key={l.id} className="card mb-3" style={{ borderLeft: l.is_alarm ? "3px solid var(--red)" : undefined }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer size={16} strokeWidth={1.5} className={l.is_alarm ? "text-red" : "text-clay"} />
                <span className="text-caption text-coffee">ХОЛОДИЛЬНИК #{l.fridge_number}</span>
              </div>
              <span className={`text-caption font-semibold ${l.is_alarm ? "text-red" : "text-coffee"}`}>
                {l.temperature}°C
              </span>
            </div>
            <div className="text-caption text-earth mt-1 uppercase tracking-widest">
              {new Date(l.recorded_at).toLocaleString("ru-RU")}
            </div>
            {l.is_alarm && <span className="chip chip-active text-caption mt-2 inline-block">ВНЕ НОРМЫ!</span>}
          </div>
        ))
      )}
    </div>
  );
}
