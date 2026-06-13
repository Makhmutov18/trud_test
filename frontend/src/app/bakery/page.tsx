"use client";

import { useState, useEffect } from "react";
import { Croissant, Plus, X } from "lucide-react";

type BakeryItem = {
  id: number;
  name: string;
  description: string | null;
  ingredients: string;
  price: number;
  is_available: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function BakeryPage() {
  const [items, setItems] = useState<BakeryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", ingredients: "", price: 0 });

  useEffect(() => {
    fetch(`${API}/api/bakery/items`).then((r) => r.json()).then(setItems).catch(console.error);
  }, []);

  const handleCreate = async () => {
    const res = await fetch(`${API}/api/bakery/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, description: form.description || null }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems([item, ...items]);
      setShowForm(false);
      setForm({ name: "", description: "", ingredients: "", price: 0 });
    }
  };

  const toggleAvailability = async (item: BakeryItem) => {
    const res = await fetch(`${API}/api/bakery/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !item.is_available }),
    });
    if (res.ok) {
      setItems(items.map((i) => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-heading text-coffee uppercase tracking-widest">БУЛКИ И ПЛЮШКИ</h1>
        <button className="btn flex items-center gap-1.5" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
          {showForm ? "ОТМЕНА" : "ДОБАВИТЬ"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <input className="input" placeholder="НАЗВАНИЕ" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="ОПИСАНИЕ" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input" placeholder="СОСТАВ (ДЛЯ АЛЛЕРГИКОВ)" value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
          <input className="input" type="number" placeholder="ЦЕНА" value={form.price || ""}
            onChange={(e) => setForm({ ...form, price: +e.target.value })} />
          <button className="btn btn-primary w-full uppercase tracking-widest" onClick={handleCreate}>
            СОХРАНИТЬ
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state uppercase tracking-widest"><p>БУЛОК ПОКА НЕТ</p></div>
      ) : (
        <div className="grid-2">
          {items.map((item) => (
            <div key={item.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-center h-32 rounded-2xl border bg-sand mb-4">
                  <Croissant size={36} strokeWidth={1.5} className="text-clay" />
                </div>
                <div className="text-caption font-semibold text-coffee uppercase tracking-widest">{item.name}</div>
                {item.description && <div className="text-caption text-earth mt-1 uppercase tracking-widest">{item.description}</div>}
                <div className="text-caption text-earth mt-1 uppercase tracking-widest">
                  <b>СОСТАВ:</b> {item.ingredients}
                </div>
                <div className="text-subheading font-bold text-red mt-2">{item.price} ₽</div>
              </div>
              <button
                className={`btn mt-4 w-full uppercase tracking-widest ${item.is_available ? "btn-primary" : ""}`}
                onClick={() => toggleAvailability(item)}
              >
                {item.is_available ? "ЕСТЬ" : "НЕТ"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
