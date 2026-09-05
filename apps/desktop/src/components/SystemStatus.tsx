import React from 'react';

const SYS_CORE = [
  { name: 'Desktop Application', detail: 'Electron 28.0 · Main process', st: 'Operational', ok: true },
  { name: 'Authentication Service', detail: 'JWT · Session active · 0 failures', st: 'Active', ok: true },
  { name: 'Database', detail: 'SQLite · Local · AES-256 encrypted', st: 'Connected', ok: true },
  { name: 'Node.js AI Service', detail: 'Port 3001 · CORS restricted', st: 'Operational', ok: true },
  { name: 'Camera Access', detail: 'Device: Integrated Webcam', st: 'Connected', ok: true },
];

const SYS_ENGINES = [
  { name: 'Local Python Verification Engine', detail: 'Port 5000 · Sandboxed process', st: 'Operational', ok: true },
  { name: 'OCR Engine', detail: 'Tesseract 5.3 · Hindi + English', st: 'Ready', ok: true },
  { name: 'Face Recognition Engine', detail: 'InsightFace · Local model loaded', st: 'Ready', ok: true },
  { name: 'MRZ Parser', detail: 'ICAO 9303 · TD1/TD2/TD3 supported', st: 'Active', ok: true },
  { name: 'AI Document Analysis', detail: 'Remote endpoint · TLS 1.3 · Metadata only', st: 'Available', ok: true },
];

export default function SystemStatus() {
  const [ts, setTs] = React.useState('—');

  React.useEffect(() => {
    setTs(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST');
  }, []);

  const sysRow = (c: { name: string; detail: string; st: string; ok: boolean }) => (
    <div className="flex items-center justify-between px-[14px] py-[10px] border-b border-border-light last:border-b-0">
      <div>
        <div className="text-[12.5px] font-medium text-text-primary">{c.name}</div>
        <div className="text-[10.5px] text-text-muted mt-[1px]">{c.detail}</div>
      </div>
      <div className="flex items-center gap-[5px] text-[11.5px] font-semibold" style={{ color: c.ok ? 'var(--green)' : 'var(--rejected)' }}>
        <span className={`w-[6px] h-[6px] rounded-full inline-block flex-shrink-0 ${c.ok ? 'bg-green' : 'bg-red'}`}></span> {c.st}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-white border-b border-border px-[20px] py-[12px] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-text-primary">System Status</h1>
          <div className="text-[10.5px] text-text-muted mt-[1px]">All components · Last checked <span id="sys-ts">{ts}</span></div>
        </div>
        <span className="inline-flex items-center gap-[5px] bg-[#ddf2dc] border border-green px-[9px] py-[3px] rounded-[3px] text-[10px] font-bold uppercase tracking-[0.5px] text-[#0a6207]">
          <span className="w-[6px] h-[6px] rounded-full inline-block flex-shrink-0 bg-green"></span> All Systems Operational
        </span>
      </div>

      <div className="p-[18px_20px] flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
          <div className="bg-white border border-border rounded-[4px]">
            <div className="px-[14px] py-[10px] border-b border-border">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Core Application</h3>
            </div>
            <div id="sys-core">{SYS_CORE.map(sysRow)}</div>
          </div>
          <div className="bg-white border border-border rounded-[4px]">
            <div className="px-[14px] py-[10px] border-b border-border">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Verification Engines</h3>
            </div>
            <div id="sys-engines">{SYS_ENGINES.map(sysRow)}</div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-[4px]">
          <div className="px-[14px] py-[10px] border-b border-border">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-sec">Local Processing Architecture</h3>
          </div>
          <div className="p-[14px]">
            <div className="bg-section border border-border rounded-[4px] p-[14px]">
              <div className="text-[10px] text-text-muted uppercase tracking-[0.5px] font-semibold mb-[12px]">Data Flow · Local First</div>
              <div className="flex gap-[8px] items-center flex-wrap">
                <div className="bg-navy text-white px-[11px] py-[6px] rounded-[3px] text-[11px] font-semibold">Electron Desktop App</div>
                <span className="text-border">→</span>
                <div className="bg-navy-mid text-white px-[11px] py-[6px] rounded-[3px] text-[11px] font-semibold">Local Python Engine</div>
                <span className="text-border">→</span>
                <div className="bg-[#1E6AA0] text-white px-[11px] py-[6px] rounded-[3px] text-[11px] font-semibold">OCR + Face Engine</div>
                <span className="text-border">→</span>
                <div className="bg-green text-white px-[11px] py-[6px] rounded-[3px] text-[11px] font-semibold">Decision Engine</div>
              </div>
              <div className="mt-[12px] text-[11.5px] text-text-sec leading-[1.6]">
                Biometric data is processed locally by the Python engine. No facial images or biometric embeddings are transmitted to external services.
                AI document analysis uses document metadata and OCR output only. All processing is performed within the sandboxed environment.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
