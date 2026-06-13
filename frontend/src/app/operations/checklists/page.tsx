"use client";

import { useState, useEffect } from "react";
import { ClipboardCheck, Plus, X, CheckSquare, Square } from "lucide-react";

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
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-heading text-coffee uppercase tracking-widest">ЧЕК-ЛИСТЫ</h1>
        <button className="btn flex items-center gap-1.5" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
          {showForm ? "ОТМЕНА" : "СОЗДАТЬ"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <input className="input" placeholder="НАЗВАНИЕ" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="input" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="opening">ОТКРЫТИЕ СМЕНЫ</option>
            <option value="closing">ЗАКРЫТИЕ СМЕНЫ</option>
            <option value="cleaning">ГЕНУБОРКА</option>
            <option value="toilet">ТУАЛЕТ</option>
          </select>
          {form.items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input className="input flex-1" placeholder="ПУНКТ" value={item.text}
                onChange={(e) => {
                  const newItems = [...form.items];
                  newItems[idx] = { ...newItems[idx], text: e.target.value };
                  setForm({ ...form, items: newItems });
                }} />
              {idx === form.items.length - 1 && (
                <button className="btn"
                  onClick={() => setForm({ ...form, items: [...form.items, { text: "", done: false }] })}>
                  <Plus size={16} strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
          <button className="btn btn-primary w-full uppercase tracking-widest" onClick={handleCreate}>
            СОЗДАТЬ
          </button>
        </div>
      )}

      {checklists.length === 0 ? (
        <div className="empty-state uppercase tracking-widest"><p>ЧЕК-ЛИСТОВ ПОКА НЕТ</p></div>
      ) : (
        checklists.map((cl) => (
          <div key={cl.id} className="card mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={16} strokeWidth={1.5} className="text-clay" />
                <span className="text-caption font-semibold text-coffee uppercase tracking-widest">{cl.name}</span>
              </div>
              {cl.completed_at && <span className="chip chip-active text-caption">ВЫПОЛНЕНО</span>}
            </div>
            <div className="text-caption text-earth uppercase tracking-widest mb-3">{cl.type}</div>
            <div>
              {cl.items.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleItem(cl, idx)}
                  className="flex items-center gap-3 py-3 border-b border-border last:border-0 cursor-pointer"
                >
                  {item.done ? (
                    <CheckSquare size={18} strokeWidth={1.5} className="text-olive shrink-0" />
                  ) : (
                    <Square size={18} strokeWidth={1.5} className="text-clay shrink-0" />
                  )}
                  <span className={`text-caption ${item.done ? "text-earth line-through" : "text-coffee"}`}>
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
