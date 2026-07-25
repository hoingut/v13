import React, { useEffect } from 'react';

export const SocialAd: React.FC = () => {
  useEffect(() => {
    const scriptUrl = 'https://pl30462134.effectivecpmnetwork.com/32/70/c2/3270c2f81f5125c23087dcdeb00a9eb5.js';
    
    // Check if already injected
    if (!document.querySelector(`script[src*="3270c2f81f5125c23087dcdeb00a9eb5.js"]`)) {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.id = 'airdrop-social-ad-script';
      document.body.appendChild(script);
      console.log('[Ad] Social bar ad active on Airdrop page');
    }

    return () => {
      // Remove script when unmounting (leaving Airdrop page)
      const scriptEl = document.getElementById('airdrop-social-ad-script') || document.querySelector(`script[src*="3270c2f81f5125c23087dcdeb00a9eb5.js"]`);
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
      
      // Clean up any injected social bar floating divs created by the ad network
      const possibleAdContainers = document.querySelectorAll('div[class*="social-bar"], div[id*="effectivecpmnetwork"], div[id*="adsterra"]');
      possibleAdContainers.forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      console.log('[Ad] Social bar ad cleaned up (Left Airdrop page)');
    };
  }, []);

  return null;
};
