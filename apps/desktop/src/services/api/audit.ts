const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

export async function getAuditLogs(accessToken: string, params?: { event_code?: string; officer_id?: string; date?: string; page?: number; page_size?: number }) {
  const qs = new URLSearchParams();
  if (params?.event_code) qs.set('event_code', params.event_code);
  if (params?.officer_id) qs.set('officer_id', params.officer_id);
  if (params?.date) qs.set('date', params.date);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.page_size) qs.set('page_size', String(params.page_size));

  const res = await fetch(`${API_BASE}/audit?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function getAuditIntegrity(accessToken: string) {
  const res = await fetch(`${API_BASE}/audit/integrity`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}
