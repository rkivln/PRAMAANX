import { useState } from 'react';
import { Checkpoint } from '@/types';

const CHECKPOINTS: Checkpoint[] = [
  { id: 'CHK-JALP-01', checkpoint_code: 'CHK-JALP-01', name: 'Border Entry Checkpoint', location: 'Jalpesh, West Bengal', checkpoint_type: 'Border Entry', status: 'active' },
  { id: 'CHK-SILG-02', checkpoint_code: 'CHK-SILG-02', name: 'Immigration Verification Desk', location: 'Siliguri, West Bengal', checkpoint_type: 'Immigration', status: 'active' },
  { id: 'CHK-DOC-03', checkpoint_code: 'CHK-DOC-03', name: 'Document Screening Counter', location: 'Darjeeling, W.B.', checkpoint_type: 'Document', status: 'active' },
  { id: 'CHK-SEC-04', checkpoint_code: 'CHK-SEC-04', name: 'Secondary Verification', location: 'Secondary Unit', checkpoint_type: 'Secondary', status: 'active' },
  { id: 'CHK-TRAIN', checkpoint_code: 'CHK-TRAIN', name: 'Training / Demonstration', location: 'Training Centre', checkpoint_type: 'Training', status: 'demo' },
];

export default function CheckpointScreen({ onSelect, onBack }: { onSelect: (cp: Checkpoint) => void; onBack: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen">
      <div className="h-[60px] bg-navy-dark flex items-center px-[18px] gap-[14px] flex-shrink-0 border-t-[3px] border-saffron relative z-[100]">
        <div className="w-[44px] h-[44px] rounded-full border-[1.5px] border-saffron/70 flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#18191B]">
          <img src="/emblem_logo.jpg" alt="Government of India Emblem" className="w-full h-full object-cover" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }} />
        </div>
        <div className="border-r border-white/12 pr-[14px] flex-shrink-0">
          <div className="text-white/88 text-[10px] font-semibold tracking-[0.9px] uppercase">Government of India</div>
          <div className="text-white/50 text-[9px] tracking-[0.4px] uppercase mt-[1px]">Ministry of Home Affairs</div>
        </div>
        <div className="flex-1 pl-[2px]">
          <div className="text-white text-[16px] font-bold tracking-[0.6px]">PRAMAANX</div>
          <div className="text-white/42 text-[9.5px] tracking-[0.2px] mt-[1px]">Identity &amp; Document Verification System</div>
        </div>
        <div className="flex items-center gap-[16px] ml-auto">
          <div className="flex items-center gap-[5px] bg-green/14 border border-green/38 rounded-[3px] px-[8px] py-[3px]">
            <span className="w-[5px] h-[5px] rounded-full bg-[#4caf50] flex-shrink-0"></span>
            <span className="text-[#7dcc76] text-[9.5px] font-semibold tracking-[0.5px]">SECURE SESSION</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-[36px] overflow-y-auto">
        <div className="w-full max-w-[780px]">
          <div className="mb-[20px]">
            <h2 className="text-[18px] font-bold text-text-primary">Select Verification Checkpoint</h2>
            <p className="text-text-sec text-[12.5px] mt-[3px]">Select the checkpoint where you are currently stationed before beginning operations.</p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[10px]">
            {CHECKPOINTS.map((cp) => (
              <div
                key={cp.id}
                onClick={() => { setSelected(cp.id); onSelect(cp); }}
                className={`bg-white border-[1.5px] rounded-[4px] p-[13px_14px] cursor-pointer transition-all ${
                  selected === cp.id ? 'border-navy bg-[#EAF1F8] shadow-[0_0_0_2px_rgba(18,59,99,0.09)]' : 'border-border hover:border-navy-mid hover:bg-[#F3F7FB]'
                }`}
              >
                <div className="text-[9.5px] text-text-muted font-semibold tracking-[0.5px] uppercase mb-[5px] font-mono">{cp.checkpoint_code}</div>
                <div className="text-[13px] font-semibold text-text-primary mb-[8px]">{cp.name}</div>
                <div className="flex flex-col gap-[3px]">
                  <div className="flex items-center gap-[6px] text-[11px] text-text-sec">
                    <span className="text-[11px]">📍</span>{cp.location}
                  </div>
                  <div className="flex items-center gap-[6px] text-[11px]">
                    <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${cp.status === 'active' ? 'bg-green' : 'bg-review'}`}></span>
                    <span style={{ color: cp.status === 'active' ? 'var(--green)' : 'var(--review)', fontWeight: 600 }}>
                      {cp.status === 'active' ? 'Active' : 'Demo Only'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[20px] flex items-center justify-between">
            <button onClick={onBack} className="bg-transparent text-text-sec border border-border px-[14px] py-[7px] rounded-[3px] text-[12px] font-medium hover:bg-section hover:text-text-primary transition-colors">
              ← Back to Login
            </button>
            <button
              onClick={() => selected && onSelect(CHECKPOINTS.find(c => c.id === selected)!)}
              disabled={!selected}
              className="bg-navy text-white border border-navy px-[14px] py-[9px] rounded-[3px] text-[12.5px] font-medium hover:bg-navy-dark hover:border-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CONTINUE →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
