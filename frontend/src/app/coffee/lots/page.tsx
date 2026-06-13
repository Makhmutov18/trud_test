"use client";

import { useState, useEffect } from "react";
import { Coffee, Plus, X } from "lucide-react";

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
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-heading text-coffee uppercase tracking-widest">ЛОТЫ КОФЕ</h1>
        <button className="btn flex items-center gap-1.5" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
          {showForm ? "ОТМЕНА" : "ДОБАВИТЬ"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <input className="input" placeholder="НАЗВАНИЕ ЛОТА" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="СТРАНА" value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <input className="input" placeholder="РЕГИОН" value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })} />
          <input className="input" placeholder="ОБРАБОТКА (WASHED, NATURAL...)" value={form.process}
            onChange={(e) => setForm({ ...form, process: e.target.value })} />
          <input className="input" placeholder="ВКУСОВОЙ ПРОФИЛЬ" value={form.flavor_profile}
            onChange={(e) => setForm({ ...form, flavor_profile: e.target.value })} />
          <button className="btn btn-primary w-full uppercase tracking-widest" onClick={handleCreate}>
            СОХРАНИТЬ
          </button>
        </div>
      )}

      {lots.length === 0 ? (
        <div className="empty-state uppercase tracking-widest"><p>ЛОТОВ ПОКА НЕТ</p></div>
      ) : (
        <div className="grid-2">
          {lots.map((lot) => (
            <div key={lot.id} className="card">
              <div className="flex items-center gap-2 mb-2">
                <Coffee size={16} strokeWidth={1.5} className="text-clay" />
                <span className="text-caption font-semibold text-coffee uppercase tracking-widest">{lot.name}</span>
              </div>
              <div className="text-caption text-earth uppercase tracking-widest">
                {lot.country} {lot.region ? `· ${lot.region}` : ""}
              </div>
              {lot.process && <span className="chip text-caption mt-2 inline-block">{lot.process}</span>}
              {lot.flavor_profile && (
                <div className="text-caption text-earth mt-2 uppercase tracking-widest">{lot.flavor_profile}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
