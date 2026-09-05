const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

export async function getCheckpoints(accessToken?: string) {
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const res = await fetch(`${API_BASE}/checkpoints`, { headers });
  return handleResponse(res);
}

export async function selectCheckpoint(accessToken: string, checkpointCode: string) {
  const res = await fetch(`${API_BASE}/checkpoints/select`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ checkpoint_code: checkpointCode }),
  });
  return handleResponse(res);
}
