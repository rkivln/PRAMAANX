// PRAMAANX Frontend-Backend Integration
// This script bridges the existing HTML prototype with the FastAPI backend
// Include after api-client.js

const PRAMAANX_INTEGRATION = (() => {
  const API = window.PRAMAANX_API;
  if (!API) {
    console.warn('PRAMAANX_API not found. Include api-client.js first.');
    return;
  }

  let currentVerificationId = null;
  let currentCheckpointId = null;
  let currentOfficer = null;

  async function apiLogin() {
    const email = document.getElementById('li-email').value.trim();
    const pw = document.getElementById('li-pw').value;
    if (!email || !pw) { alert('Please enter email and password.'); return; }
    try {
      const data = await API.login(email, pw);
      currentOfficer = data.user;
      S.officer = { name: data.user.name, id: data.user.officer_id, role: data.user.role, roleKey: data.user.role };
      await loadCheckpoints();
      showScreen('scr-checkpoint');
    } catch (e) {
      alert('Login failed: ' + e.message);
    }
  }

  async function loadCheckpoints() {
    try {
      const cps = await API.getCheckpoints();
      CHECKPOINTS.length = 0;
      cps.forEach(cp => {
        CHECKPOINTS.push({ id: cp.checkpoint_code, name: cp.name, loc: cp.location || '', type: cp.checkpoint_type || '', ok: cp.status === 'active' });
      });
      renderCheckpoints();
    } catch (e) {
      console.error('Failed to load checkpoints:', e);
    }
  }

  async function apiContinueCheckpoint() {
    if (!S.checkpoint) { alert('Please select a checkpoint.'); return; }
    try {
      const res = await API.selectCheckpoint(S.checkpoint.id);
      currentCheckpointId = res.checkpoint.id;
      initApp();
      showScreen('scr-app');
      navTo('pg-dashboard', null);
      await loadDashboardData();
    } catch (e) {
      alert('Checkpoint selection failed: ' + e.message);
    }
  }

  async function apiStartNewVerification() {
    stopAllStreams();
    try {
      const data = await API.createVerification(currentCheckpointId);
      S.wf = { id: data.verification_id, step: 1, result: null, docStream: null, faceStream: null };
      currentVerificationId = data.verification_id;
      navTo('pg-verification', document.querySelector('.nav-item[data-page="pg-verification"]'));
      renderStepBar(1);
      renderStep(1);
    } catch (e) {
      alert('Failed to start verification: ' + e.message);
    }
  }

  async function apiCaptureDoc() {
    const v = document.getElementById('doc-vid');
    if (v && v.srcObject && v.videoWidth > 0) {
      try {
        const cvs = document.createElement('canvas');
        cvs.width = v.videoWidth;
        cvs.height = v.videoHeight;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(v, 0, 0, cvs.width, cvs.height);
        S.wf.docImage = cvs.toDataURL('image/jpeg', 0.95);
      } catch(e) { console.error('Doc snap error:', e); }
    }
    if (!S.wf.docImage) S.wf.docImage = generateSampleDoc();
    if (!S.wf.docPhoto) S.wf.docPhoto = extractDocPhoto(S.wf.docImage);
    if (S.wf.docStream) { S.wf.docStream.getTracks().forEach(t=>t.stop()); S.wf.docStream=null; }

    if (currentVerificationId) {
      try {
        await API.submitDocument(currentVerificationId, {
          document_type: 'Aadhaar Card',
          document_number_masked: 'XXXX XXXX 4821',
          subject_name_masked: 'R*** S***',
          date_of_birth_masked: '14 / 08 / 1989',
          issuing_authority: 'UIDAI',
          image_sha256: 'sha256-placeholder',
          capture_resolution: '1280x720',
          mime_type: 'image/jpeg',
        });
      } catch (e) {
        console.error('Document submit failed:', e);
      }
    }
    renderStep(2);
  }

  async function apiAnalyzeDocument() {
    const items = [
      'Image received','Document type detected','OCR extraction',
      'Indian document pattern validation','MRZ analysis','Stamp verification',
      'Image integrity / tamper analysis','Rule validation','Risk assessment',
    ];
    const delays = [350,700,1050,1450,1850,2250,2700,3100,3500];
    for (let i = 0; i < items.length; i++) {
      await new Promise(r => setTimeout(r, delays[i] - (delays[i-1] || 0)));
      const icon = document.getElementById('dck-'+i);
      const row = document.getElementById('dci-'+i);
      const lbl = document.getElementById('dplabel');
      if (icon) { icon.textContent='✓'; icon.classList.add('done'); }
      if (row) row.classList.add('cl-done');
      if (lbl) lbl.textContent = items[i] + '…';
      if (i === 1) {
        const dd = document.getElementById('ddetected');
        if (dd) dd.innerHTML = `<div style="text-align:left;"><div class="mb-10"><span class="badge b-info">AADHAAR CARD</span></div><div style="font-size:12px;color:var(--text-sec);">Issuing Authority: UIDAI, Government of India</div></div>`;
      }
      if (i === items.length-1) {
        const sp = document.getElementById('dspin');
        const es = document.getElementById('dengst');
        if (sp) sp.style.display='none';
        if (lbl) lbl.textContent='Document verification complete';
        if (es) { es.textContent='COMPLETE'; es.style.color='var(--green)'; }
        if (currentVerificationId) {
          try { await API.analyzeDocument(currentVerificationId); } catch(e) { console.error(e); }
        }
        setTimeout(() => renderStep(3), 700);
      }
    }
  }

  async function apiCaptureFace() {
    const v = document.getElementById('face-vid');
    if (v && v.srcObject && v.videoWidth > 0) {
      try {
        const cvs = document.createElement('canvas');
        cvs.width = v.videoWidth;
        cvs.height = v.videoHeight;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(v, 0, 0, cvs.width, cvs.height);
        S.wf.faceImage = cvs.toDataURL('image/jpeg', 0.95);
      } catch(e) { console.error('Face snap error:', e); }
    }
    if (!S.wf.faceImage) S.wf.faceImage = generateSampleFace();
    if (S.wf.faceStream) { S.wf.faceStream.getTracks().forEach(t=>t.stop()); S.wf.faceStream=null; }
    if (currentVerificationId) {
      try { await API.submitFace(currentVerificationId); } catch(e) { console.error(e); }
    }
    renderStep(4);
  }

  async function apiAnalyzeBiometric() {
    const items = [
      'Face detected in image','Facial landmarks extracted','Face alignment completed',
      'Identity embedding generated','Face similarity calculated','Liveness assessment completed',
      'Face quality assessed','Visual consistency checked','Evidence fusion completed',
    ];
    const delays = [400,850,1300,1800,2300,2800,3200,3650,4100];
    const pcts = [10,22,34,47,61,73,82,91,100];
    for (let i = 0; i < items.length; i++) {
      await new Promise(r => setTimeout(r, delays[i] - (delays[i-1] || 0)));
      const icon = document.getElementById('bck-'+i);
      const row = document.getElementById('bci-'+i);
      const lbl = document.getElementById('bplabel');
      const prog = document.getElementById('bprog');
      const pct = document.getElementById('bpct');
      if (icon) { icon.textContent='✓'; icon.classList.add('done'); }
      if (row) row.classList.add('cl-done');
      if (lbl) lbl.textContent = items[i] + '…';
      if (prog) prog.style.width = pcts[i]+'%';
      if (pct) pct.textContent = pcts[i]+'%';
      if (i === items.length-1) {
        const sp = document.getElementById('bspin');
        const st = document.getElementById('bst');
        if (sp) sp.style.display='none';
        if (st) { st.textContent='COMPLETE'; st.style.color='var(--green)'; }
        if (lbl) lbl.textContent='Biometric analysis complete';
        if (currentVerificationId) {
          try { await API.analyzeBiometric(currentVerificationId); } catch(e) { console.error(e); }
          try { await API.calculateRisk(currentVerificationId); } catch(e) { console.error(e); }
        }
        setTimeout(() => renderStep(5), 700);
      }
    }
  }

  async function apiFinalAction(action) {
    if (!currentVerificationId) { alert('No active verification'); return; }
    try {
      await API.recordDecision(currentVerificationId, action, 'Officer decision');
      alert('Decision recorded successfully.');
      stopAllStreams();
      navTo('pg-dashboard', document.querySelector('.nav-item[data-page="pg-dashboard"]'));
      await loadDashboardData();
    } catch (e) {
      alert('Failed to record decision: ' + e.message);
    }
  }

  async function loadDashboardData() {
    if (!API.isLoggedIn()) return;
    try {
      const data = await API.getHistory({ page: 1, page_size: 7 });
      if (data && data.items) {
        const rows = data.items.map(v => `
          <tr>
            <td class="mono">${v.verification_id || '—'}</td>
            <td>${v.timestamp ? new Date(v.timestamp).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) : '—'}</td>
            <td>${v.document_type || '—'}</td>
            <td>${decBadge(v.decision || v.status)}</td>
            <td>${v.officer || '—'}</td>
            <td><span class="status-dot ${v.status==='verified'?'sd-green':v.status==='pending_review'?'sd-amber':'sd-red'}"></span> ${v.status || '—'}</td>
            <td><button class="btn btn-ghost btn-sm" onclick="openReportModal('${v.verification_id}')">View</button></td>
          </tr>`).join('');
        const dbTbl = document.getElementById('db-tbl');
        if (dbTbl) dbTbl.innerHTML = rows || '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">No records</td></tr>';
      }
    } catch (e) {
      console.error('Dashboard load error:', e);
    }
  }

  async function loadHistoryData() {
    if (!API.isLoggedIn()) return;
    try {
      const data = await API.getHistory({ page: 1, page_size: 50 });
      if (data && data.items) {
        const rows = data.items.map(v => `
          <tr>
            <td class="mono">${v.verification_id || '—'}</td>
            <td>${v.timestamp ? new Date(v.timestamp).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) : '—'}</td>
            <td>${v.document_type || '—'}</td>
            <td style="color:var(--text-muted)">${v.subject_name_masked || '***'}</td>
            <td>${decBadge(v.decision || v.status)}</td>
            <td>${v.face_match ? v.face_match + '%' : '—'}</td>
            <td>${riskSpan(v.risk || (v.status ? v.status.toUpperCase() : 'LOW'))}</td>
            <td>${v.officer || '—'}</td>
            <td><button class="btn btn-ghost btn-sm" onclick="openReportModal('${v.verification_id}')">Report</button></td>
          </tr>`).join('');
        const histTbl = document.getElementById('hist-tbl');
        if (histTbl) histTbl.innerHTML = rows || '<tr><td colspan="9" style="text-align:center;color:var(--text-muted)">No records</td></tr>';
      }
    } catch (e) {
      console.error('History load error:', e);
    }
  }

  async function loadAuditData() {
    if (!API.isLoggedIn()) return;
    try {
      const data = await API.getAuditTrail({ page: 1, page_size: 50 });
      if (data && data.items) {
        const d = new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'2-digit',year:'numeric'});
        const rows = data.items.map(e => `
          <tr>
            <td class="mono">${e.timestamp ? new Date(e.timestamp).toLocaleString('en-IN') : '—'}</td>
            <td class="mono" style="font-size:10.5px;">${e.officer_id || '—'}</td>
            <td>${evBadge(e.event_code)}</td>
            <td class="mono" style="font-size:10.5px;">${e.verification_id || '—'}</td>
            <td style="color:var(--text-sec)">${e.action || '—'}</td>
            <td>${e.result || '—'}</td>
            <td class="mono" style="font-size:10.5px;">${e.workstation || '—'}</td>
          </tr>`).join('');
        const auditTbl = document.getElementById('audit-tbl');
        if (auditTbl) auditTbl.innerHTML = rows || '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">No records</td></tr>';
      }
    } catch (e) {
      console.error('Audit load error:', e);
    }
  }

  async function loadAdminData() {
    if (!API.isLoggedIn() || !currentOfficer || (currentOfficer.role !== 'admin' && currentOfficer.role !== 'supervisor')) return;
    try {
      const data = await API.getAllVerifications({ page: 1, page_size: 50 });
      if (data && data.items) {
        const rows = data.items.map(v => `
          <tr>
            <td class="mono" style="font-size:10.5px;">${v.verification_id || '—'}</td>
            <td>${v.timestamp ? new Date(v.timestamp).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) : '—'}</td>
            <td><span class="badge b-info" style="font-size:9px;">${v.checkpoint || '—'}</span></td>
            <td>${v.officer || '—'}</td>
            <td>${v.document_type || '—'}</td>
            <td>${decBadge(v.decision || v.status)}</td>
            <td>${riskSpan(v.risk || 'LOW')}</td>
            <td><button class="btn btn-ghost btn-sm">View</button></td>
          </tr>`).join('');
        const adminTbl = document.getElementById('admin-tbl');
        if (adminTbl) adminTbl.innerHTML = rows || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">No records</td></tr>';
      }
    } catch (e) {
      console.error('Admin load error:', e);
    }
  }

  async function loadSystemStatusData() {
    if (!API.isLoggedIn()) return;
    try {
      const data = await API.getSystemStatus();
      if (data && data.components) {
        const sysRow = (c) => `<div class="sys-item">
          <div>
            <div class="sys-name">${c.component}</div>
            <div class="sys-detail">${c.detail || ''}</div>
          </div>
          <div class="sys-status" style="color:${c.status==='Operational'||c.status==='Active'||c.status==='Connected'||c.status==='Ready'||c.status==='Available'?'var(--green)':'var(--rejected)'}">
            <span class="status-dot ${c.status==='Operational'||c.status==='Active'||c.status==='Connected'||c.status==='Ready'||c.status==='Available'?'sd-green':'sd-red'}"></span> ${c.status}
          </div>
        </div>`;
        const core = document.getElementById('sys-core');
        const engines = document.getElementById('sys-engines');
        if (core) {
          const coreComponents = data.components.filter(c => ['Desktop Application','Authentication Service','Database','Node AI Service','Camera'].includes(c.component));
          core.innerHTML = coreComponents.map(sysRow).join('');
        }
        if (engines) {
          const engineComponents = data.components.filter(c => !['Desktop Application','Authentication Service','Database','Node AI Service','Camera'].includes(c.component));
          engines.innerHTML = engineComponents.map(sysRow).join('');
        }
        const sysTs = document.getElementById('sys-ts');
        if (sysTs) sysTs.textContent = new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) + ' IST';
      }
    } catch (e) {
      console.error('System status load error:', e);
    }
  }

  function patch() {
    window.doLogin = apiLogin;
    window.doContinueCheckpoint = apiContinueCheckpoint;
    window.startNewVerification = apiStartNewVerification;
    window.captureDoc = apiCaptureDoc;
    window.runDocProcessing = apiAnalyzeDocument;
    window.captureFace = apiCaptureFace;
    window.runBioProcessing = apiAnalyzeBiometric;
    window.finalAction = apiFinalAction;

    const originalNavTo = window.navTo;
    window.navTo = function(pageId, navEl) {
      originalNavTo(pageId, navEl);
      if (pageId === 'pg-dashboard') loadDashboardData();
      else if (pageId === 'pg-history') loadHistoryData();
      else if (pageId === 'pg-audit') loadAuditData();
      else if (pageId === 'pg-admin') loadAdminData();
      else if (pageId === 'pg-system') loadSystemStatusData();
    };
  }

  return {
    patch,
    apiLogin,
    apiStartNewVerification,
    loadDashboardData,
    loadHistoryData,
    loadAuditData,
    loadAdminData,
    loadSystemStatusData,
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PRAMAANX_INTEGRATION.patch());
} else {
  PRAMAANX_INTEGRATION.patch();
}
