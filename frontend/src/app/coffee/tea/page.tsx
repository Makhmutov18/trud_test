"use client";

import { useState, useEffect } from "react";

type Tea = {
  id: number;
  name: string;
  type: string;
  origin: string | null;
  brew_temp: number | null;
  brew_time: number | null;
  dose: number | null;
  description: string | null;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TeaPage() {
  const [teas, setTeas] = useState<Tea[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "green", origin: "", brew_temp: 80, brew_time: 180, dose: 3, description: "" });

  useEffect(() => {
    fetch(`${API}/api/coffee/tea`).then((r) => r.json()).then(setTeas).catch(console.error);
  }, []);

  const handleCreate = async () => {
    const res = await fetch(`${API}/api/coffee/tea`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, origin: form.origin || null, description: form.description || null }),
    });
    if (res.ok) {
      const tea = await res.json();
      setTeas([tea, ...teas]);
      setShowForm(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Чай</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "+ Добавить"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <input className="input" placeholder="Название" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 8 }} />
          <select className="input" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ marginBottom: 8 }}>
            <option value="green">Зелёный</option>
            <option value="black">Чёрный</option>
            <option value="oolong">Улун</option>
            <option value="herbal">Травяной</option>
          </select>
          <div className="grid-2" style={{ marginBottom: 8 }}>
            <input className="input" type="number" placeholder="Темп. (°C)" value={form.brew_temp}
              onChange={(e) => setForm({ ...form, brew_temp: +e.target.value })} />
            <input className="input" type="number" placeholder="Время (сек)" value={form.brew_time}
              onChange={(e) => setForm({ ...form, brew_time: +e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={handleCreate} style={{ width: "100%" }}>
            Сохранить
          </button>
        </div>
      )}

      {teas.length === 0 ? (
        <div className="empty-state"><p>Чая пока нет</p></div>
      ) : (
        teas.map((t) => (
          <div key={t.id} className="card">
            <div style={{ fontWeight: 600 }}>{t.name}</div>
            <div style={{ fontSize: 13, color: "var(--text)", marginTop: 4 }}>
              {t.type} {t.brew_temp ? `· ${t.brew_temp}°C` : ""} {t.brew_time ? `· ${t.brew_time}с` : ""}
            </div>
            {t.description && <div style={{ fontSize: 12, marginTop: 6 }}>{t.description}</div>}
          </div>
        ))
      )}
    </div>
  );
}
