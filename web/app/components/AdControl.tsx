'use client';
import { useEffect } from 'react';

export default function AdControl() {
  useEffect(() => {
    const lastShown = localStorage.getItem('adsterra-popunder');
    const now = Date.now();

    // Show once every 12 hours
    if (!lastShown || now - parseInt(lastShown) > 12 * 60 * 60 * 1000) {
      // Fake click to trigger Adsterra popunder if needed
      document.addEventListener('click', () => {
        localStorage.setItem('adsterra-popunder', now.toString());
      }, { once: true });
    }
  }, []);

  return null;
}
