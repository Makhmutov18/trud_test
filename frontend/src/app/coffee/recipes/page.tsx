"use client";

import { useState, useEffect } from "react";

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Рецепты</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "+ Добавить"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
        {["all", "pourover", "espresso", "batch", "latte"].map((t) => (
          <button
            key={t}
            className={`tag ${filter === t ? "badge-success" : ""}`}
            onClick={() => setFilter(t)}
            style={{ cursor: "pointer", border: "none" }}
          >
            {t === "all" ? "Все" : t}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card">
          <input className="input" placeholder="Название" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 8 }} />
          <select className="input" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ marginBottom: 8 }}>
            <option value="pourover">Пуровер</option>
            <option value="espresso">Эспрессо</option>
            <option value="batch">Батч</option>
            <option value="latte">Латте</option>
          </select>
          <input className="input" placeholder="Зерно" value={form.bean_variety}
            onChange={(e) => setForm({ ...form, bean_variety: e.target.value })} style={{ marginBottom: 8 }} />
          <div className="grid-2" style={{ marginBottom: 8 }}>
            <input className="input" type="number" placeholder="Доза (г)" value={form.dose}
              onChange={(e) => setForm({ ...form, dose: +e.target.value })} />
            <input className="input" type="number" placeholder="Вода (мл)" value={form.total_water}
              onChange={(e) => setForm({ ...form, total_water: +e.target.value })} />
          </div>
          <div className="grid-2" style={{ marginBottom: 8 }}>
            <input className="input" placeholder="Воронка" value={form.dripper_type || ""}
              onChange={(e) => setForm({ ...form, dripper_type: e.target.value })} />
            <input className="input" type="number" placeholder="Время (сек)" value={form.brew_time || ""}
              onChange={(e) => setForm({ ...form, brew_time: +e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={handleCreate} style={{ width: "100%" }}>
            Сохранить
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>Рецептов пока нет</p>
        </div>
      ) : (
        filtered.map((r) => (
          <div key={r.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{r.name || r.bean_variety}</div>
                <div style={{ fontSize: 13, color: "var(--text)", marginTop: 4 }}>
                  {r.type} · {r.bean_variety} · {r.dose}г → {r.total_water}мл
                </div>
                {r.dripper_type && (
                  <div style={{ fontSize: 12, color: "var(--text)", marginTop: 2 }}>
                    {r.dripper_type} {r.brew_time ? `· ${r.brew_time}с` : ""}
                  </div>
                )}
              </div>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => handleDelete(r.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
