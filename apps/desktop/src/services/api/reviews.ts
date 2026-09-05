const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

export async function getPendingReviews(accessToken: string) {
  const res = await fetch(`${API_BASE}/reviews/pending`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed');
  return json.data;
}

export async function reviewCase(accessToken: string, verificationId: string, action: string, reason?: string) {
  const res = await fetch(`${API_BASE}/reviews/${verificationId}/review`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, reason }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed');
  return json.data;
}