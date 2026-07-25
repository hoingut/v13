import React, { useEffect } from 'react';

const POPUNDER_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export const PopunderAd: React.FC = () => {
  useEffect(() => {
    try {
      const lastTimeStr = localStorage.getItem('last_popunder_time');
      const now = Date.now();
      let shouldInject = false;

      if (!lastTimeStr) {
        shouldInject = true;
      } else {
        const lastTime = parseInt(lastTimeStr, 10);
        if (isNaN(lastTime) || now - lastTime >= POPUNDER_INTERVAL_MS) {
          shouldInject = true;
        }
      }

      if (shouldInject) {
        // Check if script already exists in document
        if (!document.querySelector('script[src*="e4fcc6b598baf9838dbbdb282555f8b2.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://pl30462125.effectivecpmnetwork.com/e4/fc/c6/e4fcc6b598baf9838dbbdb282555f8b2.js';
          script.async = true;
          script.id = 'nxb-popunder-ad';
          document.body.appendChild(script);
          localStorage.setItem('last_popunder_time', now.toString());
          console.log('[Ad] Popunder ad script active (Next cycle in 2 hours)');
        }
      } else {
        const minutesLeft = Math.ceil((POPUNDER_INTERVAL_MS - (now - parseInt(lastTimeStr || '0', 10))) / (60 * 1000));
        console.log(`[Ad] Popunder ad cooling down (Active once every 2 hours - ${minutesLeft} mins left)`);
      }
    } catch (e) {
      console.warn('[Ad] Popunder ad error:', e);
    }
  }, []);

  return null;
};
