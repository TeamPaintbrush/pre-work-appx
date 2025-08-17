import { useState, useEffect, useCallback } from 'react';

interface TouchSupport {
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  viewportHeight: number;
  viewportWidth: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
}

export const useMobileDetection = (): TouchSupport => {
  const [touchSupport, setTouchSupport] = useState<TouchSupport>({
    isTouch: false,
    orientation: 'portrait',
    viewportHeight: 0,
    viewportWidth: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const updateTouchSupport = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const orientation = viewportHeight > viewportWidth ? 'portrait' : 'landscape';
      
      setTouchSupport({
        isTouch,
        orientation,
        viewportHeight,
        viewportWidth,
        isMobile: viewportWidth <= 768,
        isTablet: viewportWidth > 768 && viewportWidth <= 1024,
        isDesktop: viewportWidth > 1024,
      });
    };

    updateTouchSupport();
    window.addEventListener('resize', updateTouchSupport);
    window.addEventListener('orientationchange', updateTouchSupport);

    return () => {
      window.removeEventListener('resize', updateTouchSupport);
      window.removeEventListener('orientationchange', updateTouchSupport);
    };
  }, []);

  return touchSupport;
};

export const useSwipeGesture = (
  element: React.RefObject<HTMLElement>,
  onSwipe: (direction: SwipeDirection) => void,
  threshold: number = 50
) => {
  useEffect(() => {
    if (!element.current) return;

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      endX = e.touches[0].clientX;
      endY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (Math.max(absDeltaX, absDeltaY) < threshold) return;

      let direction: SwipeDirection['direction'] = null;
      let distance = 0;

      if (absDeltaX > absDeltaY) {
        direction = deltaX > 0 ? 'right' : 'left';
        distance = absDeltaX;
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
        distance = absDeltaY;
      }

      onSwipe({ direction, distance });
    };

    const el = element.current;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element, onSwipe, threshold]);
};

export const useLongPress = (
  callback: () => void,
  ms: number = 500
) => {
  const [isPressed, setIsPressed] = useState(false);

  const start = useCallback(() => {
    setIsPressed(true);
    const timeout = setTimeout(() => {
      callback();
      setIsPressed(false);
    }, ms);

    const cleanup = () => {
      clearTimeout(timeout);
      setIsPressed(false);
    };

    return cleanup;
  }, [callback, ms]);

  return {
    onTouchStart: start,
    onMouseDown: start,
    isPressed,
  };
};

export const useVibration = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return { vibrate };
};
