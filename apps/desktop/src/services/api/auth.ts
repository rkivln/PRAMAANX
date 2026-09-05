const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

export async function login(officerId: string, password: string, checkpointCode: string, role: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ officer_id: officerId, password, checkpoint_code: checkpointCode, role }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Login failed');
  return json.data;
}

export async function logout(accessToken: string) {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export async function getMe(accessToken: string) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed');
  return json.data;
}