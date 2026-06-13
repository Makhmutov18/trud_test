"use client";

import { useState, useEffect } from "react";
import { Leaf, Plus, X } from "lucide-react";

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
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-heading text-coffee uppercase tracking-widest">ЧАЙ</h1>
        <button className="btn flex items-center gap-1.5" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
          {showForm ? "ОТМЕНА" : "ДОБАВИТЬ"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <input className="input" placeholder="НАЗВАНИЕ" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="input" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="green">ЗЕЛЁНЫЙ</option>
            <option value="black">ЧЁРНЫЙ</option>
            <option value="oolong">УЛУН</option>
            <option value="herbal">ТРАВЯНОЙ</option>
          </select>
          <div className="grid-2">
            <input className="input" type="number" placeholder="ТЕМП. (°C)" value={form.brew_temp}
              onChange={(e) => setForm({ ...form, brew_temp: +e.target.value })} />
            <input className="input" type="number" placeholder="ВРЕМЯ (СЕК)" value={form.brew_time}
              onChange={(e) => setForm({ ...form, brew_time: +e.target.value })} />
          </div>
          <button className="btn btn-primary w-full uppercase tracking-widest" onClick={handleCreate}>
            СОХРАНИТЬ
          </button>
        </div>
      )}

      {teas.length === 0 ? (
        <div className="empty-state uppercase tracking-widest"><p>ЧАЯ ПОКА НЕТ</p></div>
      ) : (
        <div className="grid-2">
          {teas.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-center gap-2 mb-2">
                <Leaf size={16} strokeWidth={1.5} className="text-clay" />
                <span className="text-caption font-semibold text-coffee uppercase tracking-widest">{t.name}</span>
              </div>
              <div className="text-caption text-earth uppercase tracking-widest">
                {t.type} {t.brew_temp ? `· ${t.brew_temp}°C` : ""} {t.brew_time ? `· ${t.brew_time}С` : ""}
              </div>
              {t.description && <div className="text-caption text-coffee mt-2">{t.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
