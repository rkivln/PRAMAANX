const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:5000/api';

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed');
  return json.data;
}

export async function createVerification(accessToken: string, checkpointId: string, demoMode = false) {
  const res = await fetch(`${API_BASE}/verifications`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ checkpoint_id: checkpointId, demo_mode: demoMode }),
  });
  return handleResponse(res);
}

export async function getVerification(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
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

export async function runForensics(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/forensics/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function runConsistency(accessToken: string, verificationId: string, evidence: any) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/consistency`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ evidence }),
  });
  return handleResponse(res);
}

export async function getConsistency(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/consistency`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function calculateRisk(accessToken: string, verificationId: string, evidence: any) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/risk`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ evidence }),
  });
  return handleResponse(res);
}

export async function getRisk(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/risk`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function getResult(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/result`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function getReport(accessToken: string, verificationId: string) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/report`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

export async function recordDecision(accessToken: string, verificationId: string, action: string, reason?: string, confirmation = false) {
  const res = await fetch(`${API_BASE}/verifications/${verificationId}/decision`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, reason, confirmation }),
  });
  return handleResponse(res);
}
