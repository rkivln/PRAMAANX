const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

export async function getDashboard(accessToken: string) {
  const res = await fetch(`${API_BASE}/dashboard`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}
