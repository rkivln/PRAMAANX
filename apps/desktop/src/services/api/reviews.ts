const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

export async function getPendingReviews(accessToken: string) {
  const res = await fetch(`${API_BASE}/reviews/pending`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function approveReview(accessToken: string, verificationId: string, reason?: string) {
  const res = await fetch(`${API_BASE}/reviews/${verificationId}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'APPROVE', reason }),
  });
  return handleResponse(res);
}

export async function rejectReview(accessToken: string, verificationId: string, reason?: string) {
  const res = await fetch(`${API_BASE}/reviews/${verificationId}/reject`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'REJECT', reason }),
  });
  return handleResponse(res);
}

export async function escalateReview(accessToken: string, verificationId: string, reason?: string) {
  const res = await fetch(`${API_BASE}/reviews/${verificationId}/escalate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'ESCALATE', reason }),
  });
  return handleResponse(res);
}
