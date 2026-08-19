import { useEffect, useState } from 'react';
import { isMobileDevice } from '../utils/isMobileDevice';

export function useIsMobileLayout(): boolean {
  const [isMobile, setIsMobile] = useState(isMobileDevice);

  useEffect(() => {
    const handler = () => setIsMobile(isMobileDevice());
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }, []);

  return isMobile;
}
