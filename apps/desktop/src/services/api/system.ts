const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

export async function getSystemStatus(accessToken: string) {
  const res = await fetch(`${API_BASE}/system/status`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed');
  return json.data;
}