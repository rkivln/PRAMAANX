const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

export async function getAdminStats(accessToken: string) {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function getAdminVerifications(accessToken: string, params?: { checkpoint?: string; decision?: string; date?: string; page?: number; page_size?: number }) {
  const qs = new URLSearchParams();
  if (params?.checkpoint) qs.set('checkpoint', params.checkpoint);
  if (params?.decision) qs.set('decision', params.decision);
  if (params?.date) qs.set('date', params.date);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.page_size) qs.set('page_size', String(params.page_size));

  const res = await fetch(`${API_BASE}/admin/verifications?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}
