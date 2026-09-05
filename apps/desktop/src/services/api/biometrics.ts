const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

export async function submitFace(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/face`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function analyzeBiometric(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/biometric/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}
