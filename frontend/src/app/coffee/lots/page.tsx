"use client";

import { useState, useEffect } from "react";

type Lot = {
  id: number;
  name: string;
  country: string;
  region: string | null;
  process: string | null;
  flavor_profile: string | null;
  is_available: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LotsPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", country: "", region: "", process: "", flavor_profile: "" });

  useEffect(() => {
    fetch(`${API}/api/coffee/lots`).then((r) => r.json()).then(setLots).catch(console.error);
  }, []);

  const handleCreate = async () => {
    const res = await fetch(`${API}/api/coffee/lots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, region: form.region || null, process: form.process || null, flavor_profile: form.flavor_profile || null }),
    });
    if (res.ok) {
      const lot = await res.json();
      setLots([lot, ...lots]);
      setShowForm(false);
      setForm({ name: "", country: "", region: "", process: "", flavor_profile: "" });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Лоты кофе</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "+ Добавить"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <input className="input" placeholder="Название лота" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 8 }} />
          <input className="input" placeholder="Страна" value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })} style={{ marginBottom: 8 }} />
          <input className="input" placeholder="Регион" value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })} style={{ marginBottom: 8 }} />
          <input className="input" placeholder="Обработка (washed, natural...)" value={form.process}
            onChange={(e) => setForm({ ...form, process: e.target.value })} style={{ marginBottom: 8 }} />
          <input className="input" placeholder="Вкусовой профиль" value={form.flavor_profile}
            onChange={(e) => setForm({ ...form, flavor_profile: e.target.value })} style={{ marginBottom: 8 }} />
          <button className="btn btn-primary" onClick={handleCreate} style={{ width: "100%" }}>
            Сохранить
          </button>
        </div>
      )}

      {lots.length === 0 ? (
        <div className="empty-state"><p>Лотов пока нет</p></div>
      ) : (
        lots.map((lot) => (
          <div key={lot.id} className="card">
            <div style={{ fontWeight: 600 }}>{lot.name}</div>
            <div style={{ fontSize: 13, color: "var(--text)", marginTop: 4 }}>
              {lot.country} {lot.region ? `· ${lot.region}` : ""}
            </div>
            {lot.process && <span className="tag" style={{ marginTop: 6 }}>{lot.process}</span>}
            {lot.flavor_profile && (
              <div style={{ fontSize: 12, color: "var(--text)", marginTop: 6 }}>{lot.flavor_profile}</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
