"use client";

import { useState, useEffect } from "react";

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Булки и плюшки</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "+ Добавить"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <input className="input" placeholder="Название" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 8 }} />
          <input className="input" placeholder="Описание" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: 8 }} />
          <input className="input" placeholder="Состав (для аллергиков)" value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })} style={{ marginBottom: 8 }} />
          <input className="input" type="number" placeholder="Цена" value={form.price || ""}
            onChange={(e) => setForm({ ...form, price: +e.target.value })} style={{ marginBottom: 8 }} />
          <button className="btn btn-primary" onClick={handleCreate} style={{ width: "100%" }}>
            Сохранить
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state"><p>Булок пока нет</p></div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                {item.description && <div style={{ fontSize: 13, color: "var(--text)", marginTop: 4 }}>{item.description}</div>}
                <div style={{ fontSize: 12, color: "var(--text)", marginTop: 4 }}>
                  <b>Состав:</b> {item.ingredients}
                </div>
                <div style={{ fontWeight: 600, marginTop: 6 }}>{item.price} ₽</div>
              </div>
              <button
                className={`btn btn-small ${item.is_available ? "btn-primary" : "btn-secondary"}`}
                onClick={() => toggleAvailability(item)}
              >
                {item.is_available ? "Есть" : "Нет"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
