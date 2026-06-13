"use client";

import { useState, useEffect } from "react";

type Checklist = {
  id: number;
  name: string;
  type: string;
  items: { text: string; done: boolean }[];
  completed_at: string | null;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "opening", frequency: "per_shift", items: [{ text: "", done: false }] });

  useEffect(() => {
    fetch(`${API}/api/operations/checklists`).then((r) => r.json()).then(setChecklists).catch(console.error);
  }, []);

  const handleCreate = async () => {
    const res = await fetch(`${API}/api/operations/checklists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const cl = await res.json();
      setChecklists([cl, ...checklists]);
      setShowForm(false);
    }
  };

  const toggleItem = async (cl: Checklist, idx: number) => {
    const newItems = cl.items.map((item, i) => i === idx ? { ...item, done: !item.done } : item);
    const allDone = newItems.every((i) => i.done);
    const res = await fetch(`${API}/api/operations/checklists/${cl.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: newItems, completed_at: allDone ? new Date().toISOString() : null }),
    });
    if (res.ok) {
      setChecklists(checklists.map((c) => c.id === cl.id ? { ...c, items: newItems, completed_at: allDone ? new Date().toISOString() : null } : c));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Чек-листы</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "+ Создать"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <input className="input" placeholder="Название" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 8 }} />
          <select className="input" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ marginBottom: 8 }}>
            <option value="opening">Открытие смены</option>
            <option value="closing">Закрытие смены</option>
            <option value="cleaning">Генуборка</option>
            <option value="toilet">Туалет</option>
          </select>
          {form.items.map((item, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input className="input" placeholder="Пункт" value={item.text}
                onChange={(e) => {
                  const newItems = [...form.items];
                  newItems[idx] = { ...newItems[idx], text: e.target.value };
                  setForm({ ...form, items: newItems });
                }} />
              {idx === form.items.length - 1 && (
                <button className="btn btn-secondary btn-small"
                  onClick={() => setForm({ ...form, items: [...form.items, { text: "", done: false }] })}>
                  +
                </button>
              )}
            </div>
          ))}
          <button className="btn btn-primary" onClick={handleCreate} style={{ width: "100%" }}>
            Создать
          </button>
        </div>
      )}

      {checklists.length === 0 ? (
        <div className="empty-state"><p>Чек-листов пока нет</p></div>
      ) : (
        checklists.map((cl) => (
          <div key={cl.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 600 }}>{cl.name}</div>
              {cl.completed_at && <span className="badge badge-success">Выполнено</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--text)", marginTop: 2 }}>{cl.type}</div>
            <div style={{ marginTop: 12 }}>
              {cl.items.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleItem(cl, idx)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 0",
                    cursor: "pointer", borderBottom: idx < cl.items.length - 1 ? "1px solid var(--border)" : undefined,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.done ? "☑️" : "☐"}</span>
                  <span style={{ textDecoration: item.done ? "line-through" : undefined, color: item.done ? "var(--text)" : undefined }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
