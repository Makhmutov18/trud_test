"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, X } from "lucide-react";

type Shift = {
  id: number;
  user_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SchedulePage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ user_id: 1, date: new Date().toISOString().split("T")[0], start_time: "08:00", end_time: "20:00" });

  useEffect(() => {
    fetch(`${API}/api/operations/shifts`).then((r) => r.json()).then(setShifts).catch(console.error);
  }, []);

  const handleCreate = async () => {
    const res = await fetch(`${API}/api/operations/shifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const shift = await res.json();
      setShifts([...shifts, shift]);
      setShowForm(false);
    }
  };

  const grouped = shifts.reduce<Record<string, Shift[]>>((acc, s) => {
    (acc[s.date] = acc[s.date] || []).push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-heading text-coffee uppercase tracking-widest">ГРАФИК СМЕН</h1>
        <button className="btn flex items-center gap-1.5" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
          {showForm ? "ОТМЕНА" : "ДОБАВИТЬ"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <input className="input" type="date" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <div className="grid-2">
            <input className="input" type="time" value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            <input className="input" type="time" value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          <button className="btn btn-primary w-full uppercase tracking-widest" onClick={handleCreate}>
            ДОБАВИТЬ СМЕНУ
          </button>
        </div>
      )}

      {Object.entries(grouped).sort().map(([date, dayShifts]) => (
        <div key={date} className="mb-4">
          <h2 className="text-caption font-bold text-coffee uppercase tracking-widest mb-3">
            {new Date(date).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
          </h2>
          {dayShifts.map((s) => (
            <div key={s.id} className="card mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} strokeWidth={1.5} className="text-clay" />
                  <span className="text-caption text-coffee">{s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}</span>
                </div>
                <span className={`chip text-caption ${s.status === "completed" ? "chip-active" : ""}`}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}

      {shifts.length === 0 && <div className="empty-state uppercase tracking-widest"><p>СМЕН ПОКА НЕТ</p></div>}
    </div>
  );
}
