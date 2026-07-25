import React, { useEffect, useRef } from 'react';

export const BannerAd: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set global atOptions required by HighPerformanceFormat / Adsterra
    (window as any).atOptions = {
      key: 'f9e63a6a53ed69257df1cd3189abe029',
      format: 'iframe',
      height: 60,
      width: 468,
      params: {}
    };

    // Create and append the invoke script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.highperformanceformat.com/f9e63a6a53ed69257df1cd3189abe029/invoke.js';
    script.async = true;

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center my-3 overflow-hidden bg-[#180d08] rounded-2xl border border-amber-500/40 p-3 shadow-inner">
      <div className="text-[10px] text-amber-300/80 font-mono uppercase tracking-widest mb-2 flex items-center gap-1.5 font-black">
        <span>✨ স্পনসরড রিওয়ার্ড ব্যানার (Sponsored Partner Ad) ✨</span>
      </div>
      <div
        ref={containerRef}
        className="min-h-[60px] w-full max-w-[468px] flex items-center justify-center overflow-x-auto bg-black/40 rounded-xl"
      />
    </div>
  );
};
