const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

export async function getHistory(accessToken: string, params?: { decision?: string; document_type?: string; date_from?: string; date_to?: string; page?: number; page_size?: number }) {
  const qs = new URLSearchParams();
  if (params?.decision) qs.set('decision', params.decision);
  if (params?.document_type) qs.set('document_type', params.document_type);
  if (params?.date_from) qs.set('date_from', params.date_from);
  if (params?.date_to) qs.set('date_to', params.date_to);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.page_size) qs.set('page_size', String(params.page_size));

  const res = await fetch(`${API_BASE}/history?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}
