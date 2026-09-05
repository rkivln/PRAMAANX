const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

export async function listCheckpoints(accessToken: string) {
  const res = await fetch(`${API_BASE}/checkpoints`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed');
  return json.data;
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
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed');
  return json.data;
}