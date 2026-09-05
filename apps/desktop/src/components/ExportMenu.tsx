import { useState, useEffect, useRef } from 'react';

export default function ExportMenu({ verificationId, onClose }: { verificationId: string; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="bg-white text-navy border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] font-medium inline-flex items-center gap-[6px] hover:bg-section transition-colors"
      >
        ⬇ Download Report <span className="text-[9px]">▼</span>
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-[8px] bg-white border border-border rounded-[6px] shadow-[0_12px_32px_rgba(11,41,66,0.2)] min-w-[290px] z-[1000] overflow-hidden" style={{ animation: 'dropUp 0.18s ease-out' }}>
          {[
            { icon: '📄', title: 'PDF Document (.pdf)', sub: 'Official Certificate with photos & seal', color: '#D9381E', fmt: 'pdf' },
            { icon: '📝', title: 'Microsoft Word (.doc)', sub: 'Formatted dossier with embedded images', color: '#2B579A', fmt: 'word' },
            { icon: '📊', title: 'Excel Spreadsheet (.xlsx)', sub: 'Multi-sheet: Summary, Checks, Audit', color: '#217346', fmt: 'excel' },
            { icon: '📑', title: 'CSV Raw Data (.csv)', sub: 'Standard RFC 4180 export dataset', color: '#107C41', fmt: 'csv' },
          ].map((item) => (
            <div
              key={item.fmt}
              onClick={() => {
                console.log('Export report', verificationId, item.fmt);
                setOpen(false);
                onClose();
              }}
              className="flex items-center gap-[12px] px-[14px] py-[10px] cursor-pointer transition-colors border-b border-border-light last:border-b-0 hover:bg-[#EDF3F8]"
            >
              <span className="text-[20px] flex-shrink-0" style={{ color: item.color }}>{item.icon}</span>
              <div>
                <div className="text-[12px] font-semibold text-navy-dark">{item.title}</div>
                <div className="text-[10px] text-text-muted mt-[1px]">{item.sub}</div>
              </div>
            </div>
          ))}
          <div className="h-[1px] bg-border my-[3px]"></div>
          <div
            onClick={() => {
              setOpen(false);
              onClose();
            }}
            className="flex items-center gap-[12px] px-[14px] py-[10px] cursor-pointer transition-colors hover:bg-[#EDF3F8]"
          >
            <span className="text-[20px] flex-shrink-0 text-navy">🖨️</span>
            <div>
              <div className="text-[12px] font-semibold text-navy-dark">Print Official Certificate</div>
              <div className="text-[10px] text-text-muted mt-[1px]">High-resolution Government layout</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
