const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

export async function submitDocument(accessToken: string, verificationId: string, payload: any) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/document`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function analyzeDocument(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/document/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function runForensics(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/forensics/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}
