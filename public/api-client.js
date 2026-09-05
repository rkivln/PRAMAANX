// PRAMAANX API Client
// Standalone JavaScript API client for the HTML prototype
// Include this script after the PRAMAANX UI scripts

const PRAMAANX_API = (() => {
  const BASE = (window.PRAMAANX_API_URL || 'http://127.0.0.1:5000/api');
  let token = localStorage.getItem('pramaanx_token') || '';
  let officer = JSON.parse(localStorage.getItem('pramaanx_officer') || 'null');

  function setToken(t) {
    token = t;
    if (t) localStorage.setItem('pramaanx_token', t);
    else localStorage.removeItem('pramaanx_token');
  }

  function setOfficer(o) {
    officer = o;
    if (o) localStorage.setItem('pramaanx_officer', JSON.stringify(o));
    else localStorage.removeItem('pramaanx_officer');
  }

  function getHeaders() {
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async function request(path, options = {}) {
    const res = await fetch(BASE + path, {
      ...options,
      headers: { ...getHeaders(), ...(options.headers || {}) },
    });
    const json = await res.json();
    if (!json.success) {
      const err = new Error(json.error?.message || 'Request failed');
      err.code = json.error?.code;
      err.status = res.status;
      throw err;
    }
    return json.data;
  }

  return {
    token,
    officer,
    setToken,
    setOfficer,
    isLoggedIn: () => !!token,

    async login(email, password) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.access_token);
      setOfficer(data.user);
      return data;
    },

    async logout() {
      try { await request('/auth/logout', { method: 'POST' }); } catch {}
      setToken(null);
      setOfficer(null);
    },

    async getMe() {
      return request('/auth/me');
    },

    async getCheckpoints() {
      return request('/checkpoints');
    },

    async selectCheckpoint(checkpointCode) {
      return request('/checkpoints/select', {
        method: 'POST',
        body: JSON.stringify({ checkpoint_code: checkpointCode }),
      });
    },

    async createVerification(checkpointId) {
      return request('/verifications', {
        method: 'POST',
        body: JSON.stringify({ checkpoint_id: checkpointId }),
      });
    },

    async getVerification(verificationId) {
      return request(`/verifications/${verificationId}`);
    },

    async submitDocument(verificationId, payload) {
      return request(`/verifications/${verificationId}/document`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async analyzeDocument(verificationId) {
      return request(`/verifications/${verificationId}/document/analyze`, { method: 'POST' });
    },

    async submitFace(verificationId) {
      return request(`/verifications/${verificationId}/face`, { method: 'POST' });
    },

    async analyzeBiometric(verificationId) {
      return request(`/verifications/${verificationId}/biometric/analyze`, { method: 'POST' });
    },

    async calculateRisk(verificationId) {
      return request(`/verifications/${verificationId}/risk`, { method: 'POST' });
    },

    async getResult(verificationId) {
      return request(`/verifications/${verificationId}/result`);
    },

    async recordDecision(verificationId, action, reason) {
      return request(`/verifications/${verificationId}/decision`, {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
      });
    },

    async getHistory(params = {}) {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, String(v)); });
      return request(`/history?${qs.toString()}`);
    },

    async getPendingReviews() {
      return request('/reviews/pending');
    },

    async reviewCase(verificationId, action, reason) {
      return request(`/reviews/${verificationId}/review`, {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
      });
    },

    async getAuditTrail(params = {}) {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, String(v)); });
      return request(`/audit?${qs.toString()}`);
    },

    async getAdminStats() {
      return request('/admin/stats');
    },

    async getSystemStatus() {
      return request('/system/status');
    },
  };
})();
