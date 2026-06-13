"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, X, Trash2 } from "lucide-react";

type Recipe = {
  id: number;
  name: string;
  type: string;
  bean_variety: string;
  dose: number;
  dripper_type: string | null;
  total_water: number;
  brew_time: number | null;
  is_active: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "pourover", bean_variety: "", dose: 15,
    total_water: 250, dripper_type: "V60", brew_time: 180,
  });

  useEffect(() => {
    fetch(`${API}/api/coffee/recipes`)
      .then((r) => r.json())
      .then(setRecipes)
      .catch(console.error);
  }, []);

  const filtered = filter === "all" ? recipes : recipes.filter((r) => r.type === filter);

  const handleCreate = async () => {
    const res = await fetch(`${API}/api/coffee/recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const recipe = await res.json();
      setRecipes([recipe, ...recipes]);
      setShowForm(false);
      setForm({ name: "", type: "pourover", bean_variety: "", dose: 15, total_water: 250, dripper_type: "V60", brew_time: 180 });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`${API}/api/coffee/recipes/${id}`, { method: "DELETE" });
    if (res.ok) setRecipes(recipes.filter((r) => r.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-heading text-coffee uppercase tracking-widest">РЕЦЕПТЫ</h1>
        <button className="btn flex items-center gap-1.5" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
          {showForm ? "ОТМЕНА" : "ДОБАВИТЬ"}
        </button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
        {["all", "pourover", "espresso", "batch", "latte"].map((t) => (
          <button
            key={t}
            className={`chip text-caption uppercase tracking-widest ${filter === t ? "chip-active" : ""}`}
            onClick={() => setFilter(t)}
          >
            {t === "all" ? "ВСЕ" : t}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card mb-4 space-y-3">
          <input className="input" placeholder="НАЗВАНИЕ" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="input" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="pourover">ПУРОВЕР</option>
            <option value="espresso">ЭСПРЕССО</option>
            <option value="batch">БАТЧ</option>
            <option value="latte">ЛАТТЕ</option>
          </select>
          <input className="input" placeholder="ЗЕРНО" value={form.bean_variety}
            onChange={(e) => setForm({ ...form, bean_variety: e.target.value })} />
          <div className="grid-2">
            <input className="input" type="number" placeholder="ДОЗА (Г)" value={form.dose}
              onChange={(e) => setForm({ ...form, dose: +e.target.value })} />
            <input className="input" type="number" placeholder="ВОДА (МЛ)" value={form.total_water}
              onChange={(e) => setForm({ ...form, total_water: +e.target.value })} />
          </div>
          <div className="grid-2">
            <input className="input" placeholder="ВОРОНКА" value={form.dripper_type || ""}
              onChange={(e) => setForm({ ...form, dripper_type: e.target.value })} />
            <input className="input" type="number" placeholder="ВРЕМЯ (СЕК)" value={form.brew_time || ""}
              onChange={(e) => setForm({ ...form, brew_time: +e.target.value })} />
          </div>
          <button className="btn btn-primary w-full uppercase tracking-widest" onClick={handleCreate}>
            СОХРАНИТЬ
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state uppercase tracking-widest"><p>РЕЦЕПТОВ ПОКА НЕТ</p></div>
      ) : (
        <div className="grid-2">
          {filtered.map((r) => (
            <div key={r.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} strokeWidth={1.5} className="text-clay" />
                  <span className="text-caption font-semibold text-coffee uppercase tracking-widest">{r.name || r.bean_variety}</span>
                </div>
                <div className="text-caption text-earth uppercase tracking-widest">
                  {r.type} · {r.bean_variety} · {r.dose}Г → {r.total_water}МЛ
                </div>
                {r.dripper_type && (
                  <div className="text-caption text-earth mt-1 uppercase tracking-widest">
                    {r.dripper_type} {r.brew_time ? `· ${r.brew_time}С` : ""}
                  </div>
                )}
              </div>
              <button
                className="btn mt-4 w-full uppercase tracking-widest"
                onClick={() => handleDelete(r.id)}
              >
                <Trash2 size={14} strokeWidth={1.5} />
                УДАЛИТЬ
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
