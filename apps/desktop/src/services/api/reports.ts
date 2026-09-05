const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

export async function downloadPDF(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/report?format=pdf`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to download PDF');
  return res.blob();
}

export async function downloadWord(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/report?format=doc`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to download Word');
  return res.blob();
}

export async function downloadExcel(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/report?format=xlsx`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to download Excel');
  return res.blob();
}

export async function downloadCSV(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/report?format=csv`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to download CSV');
  return res.blob();
}
