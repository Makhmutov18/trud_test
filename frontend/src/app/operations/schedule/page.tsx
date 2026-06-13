"use client";

import { useState, useEffect } from "react";

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>График смен</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "+ Добавить"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <input className="input" type="date" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ marginBottom: 8 }} />
          <div className="grid-2" style={{ marginBottom: 8 }}>
            <input className="input" type="time" value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            <input className="input" type="time" value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={handleCreate} style={{ width: "100%" }}>
            Добавить смену
          </button>
        </div>
      )}

      {Object.entries(grouped).sort().map(([date, dayShifts]) => (
        <div key={date} style={{ marginBottom: 16 }}>
          <h2>{new Date(date).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</h2>
          {dayShifts.map((s) => (
            <div key={s.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}</span>
                <span className={`badge ${s.status === "completed" ? "badge-success" : "badge-warning"}`}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}

      {shifts.length === 0 && <div className="empty-state"><p>Смен пока нет</p></div>}
    </div>
  );
}
