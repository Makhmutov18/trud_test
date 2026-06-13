const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getInitData(): string {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    return window.Telegram.WebApp.initData || "";
  }
  return "";
}

async function request(path: string, options: RequestInit = {}) {
  const initData = getInitData();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (initData) {
    headers["X-TG-Init-Data"] = initData;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, data: unknown) =>
    request(path, { method: "POST", body: JSON.stringify(data) }),
  put: (path: string, data: unknown) =>
    request(path, { method: "PUT", body: JSON.stringify(data) }),
  delete: (path: string) => request(path, { method: "DELETE" }),
};
