const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

export async function login(officerId: string, password: string, checkpointCode: string, role: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ officer_id: officerId, password, checkpoint_code: checkpointCode, role }),
  });
  return handleResponse(res);
}

export async function logout(accessToken: string) {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function getMe(accessToken: string) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function refreshToken(refreshToken: string) {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return handleResponse(res);
}
