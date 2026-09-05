import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app';

export default function ImageLightbox() {
  const { lightbox, setLightbox } = useAppStore();
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    if (lightbox.open) {
      setZoom(1);
      setRotate(0);
    }
  }, [lightbox.open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox({ ...lightbox, open: false });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox, setLightbox]);

  if (!lightbox.open) return null;

  return (
    <div className="fixed inset-0 bg-black/92 backdrop-blur-[8px] z-[10000] flex items-center justify-center p-[20px]" onClick={() => setLightbox({ ...lightbox, open: false })}>
      <div className="max-w-[92vw] max-h-[92vh] w-[840px] bg-[#161F28] border border-[#2B3D4F] rounded-[8px] overflow-hidden flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.65)]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-navy-dark text-white px-[18px] py-[12px] flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-[8px]">
            <span>🔍</span>
            <span className="text-[14px] font-semibold">{lightbox.title}</span>
          </div>
          <button onClick={() => setLightbox({ ...lightbox, open: false })} className="bg-transparent text-white border border-white/18 px-[9px] py-[4px] rounded-[3px] text-[11px] hover:bg-white/9 transition-colors">✕ Close</button>
        </div>

        <div className="flex-1 min-h-[420px] max-h-[65vh] overflow-auto flex items-center justify-center p-[20px] bg-[#0D1318]">
          {lightbox.src && (
            <img
              src={lightbox.src}
              alt="Inspection Preview"
              className="max-w-full max-h-[60vh] object-contain transition-transform duration-200 rounded-[4px] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }}
            />
          )}
        </div>

        <div className="bg-[#111A22] px-[18px] py-[10px] flex items-center justify-between border-t border-[#243445] flex-wrap gap-[8px]">
          <div className="flex items-center gap-[6px]">
            <button onClick={() => setZoom(zoom + 0.25)} className="bg-white text-navy border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] font-medium hover:bg-section transition-colors">＋ Zoom In</button>
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="bg-white text-navy border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] font-medium hover:bg-section transition-colors">－ Zoom Out</button>
            <button onClick={() => { setZoom(1); setRotate(0); }} className="bg-white text-navy border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] font-medium hover:bg-section transition-colors">↺ Reset</button>
            <button onClick={() => setRotate((rotate + 90) % 360)} className="bg-white text-navy border border-border px-[9px] py-[4px] rounded-[3px] text-[11px] font-medium hover:bg-section transition-colors">⟳ Rotate</button>
          </div>
          <div className="flex gap-[8px] items-center">
            <span className="font-mono text-[10px] text-white/70">SHA-256: 7f8a...c92 · WS-CHK-01</span>
            <button className="bg-navy text-white border border-navy px-[9px] py-[4px] rounded-[3px] text-[11px] font-medium hover:bg-navy-dark transition-colors">⬇ Download Image</button>
          </div>
        </div>
      </div>
    </div>
  );
}
