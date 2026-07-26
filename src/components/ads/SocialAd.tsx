import React, { useEffect } from 'react';

const SOCIAL_AD_INTERVAL_MS = 60 * 60 * 1000; // 1 hour cooldown between social ads

interface SocialAdProps {
  isLoggedIn?: boolean;
}

export const SocialAd: React.FC<SocialAdProps> = ({ isLoggedIn = false }) => {
  useEffect(() => {
    const cleanUpAd = () => {
      const scriptEl = document.getElementById('airdrop-social-ad-script') || document.querySelector(`script[src*="3270c2f81f5125c23087dcdeb00a9eb5.js"]`);
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
      const possibleAdContainers = document.querySelectorAll('div[class*="social-bar"], div[id*="effectivecpmnetwork"], div[id*="adsterra"]');
      possibleAdContainers.forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };

    if (!isLoggedIn) {
      cleanUpAd();
      return;
    }

    // Check frequency cooldown (1 hour)
    try {
      const lastTimeStr = localStorage.getItem('last_social_ad_time');
      const now = Date.now();
      if (lastTimeStr) {
        const lastTime = parseInt(lastTimeStr, 10);
        if (!isNaN(lastTime) && now - lastTime < SOCIAL_AD_INTERVAL_MS) {
          const minutesLeft = Math.ceil((SOCIAL_AD_INTERVAL_MS - (now - lastTime)) / (60 * 1000));
          console.log(`[Ad] Social ad cooling down (Less aggressive: ${minutesLeft} mins left)`);
          return;
        }
      }
    } catch (e) {
      console.warn('[Ad] Social ad localStorage check error:', e);
    }

    const scriptUrl = 'https://pl30462134.effectivecpmnetwork.com/32/70/c2/3270c2f81f5125c23087dcdeb00a9eb5.js';
    
    // Gentle 4-second delay so it doesn't pop immediately when user enters tab
    const delayTimer = setTimeout(() => {
      if (!document.querySelector(`script[src*="3270c2f81f5125c23087dcdeb00a9eb5.js"]`)) {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.id = 'airdrop-social-ad-script';
        document.body.appendChild(script);
        try {
          localStorage.setItem('last_social_ad_time', Date.now().toString());
        } catch (e) {}
        console.log('[Ad] Social bar ad active on Airdrop page (Next cycle in 1 hour)');
      }
    }, 4000);

    return () => {
      clearTimeout(delayTimer);
      cleanUpAd();
      console.log('[Ad] Social bar ad cleaned up (Left Airdrop page)');
    };
  }, [isLoggedIn]);

  return null;
};

