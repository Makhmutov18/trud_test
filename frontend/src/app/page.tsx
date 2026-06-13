export default function Home() {
  return (
    <div>
      <h1>ТРУД</h1>
      <div className="card">
        <h2>Добро пожаловать</h2>
        <p style={{ fontSize: 14, marginTop: 8 }}>
          Пространство, где труд становится видимым
        </p>
      </div>
      <div className="grid-2">
        <a href="/coffee" className="card" style={{ textDecoration: "none", textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>☕</div>
          <div style={{ fontWeight: 600, marginTop: 8 }}>Кофе</div>
          <div style={{ fontSize: 12, color: "var(--text)" }}>Рецепты, лоты, чай</div>
        </a>
        <a href="/operations" className="card" style={{ textDecoration: "none", textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>📋</div>
          <div style={{ fontWeight: 600, marginTop: 8 }}>Операции</div>
          <div style={{ fontSize: 12, color: "var(--text)" }}>Смены, чек-листы</div>
        </a>
        <a href="/bakery" className="card" style={{ textDecoration: "none", textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>🥐</div>
          <div style={{ fontWeight: 600, marginTop: 8 }}>Булки</div>
          <div style={{ fontSize: 12, color: "var(--text)" }}>Меню, состав</div>
        </a>
        <a href="/dashboard" className="card" style={{ textDecoration: "none", textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>📊</div>
          <div style={{ fontWeight: 600, marginTop: 8 }}>Обзор дня</div>
          <div style={{ fontSize: 12, color: "var(--text)" }}>Статистика</div>
        </a>
      </div>
    </div>
  );
}
