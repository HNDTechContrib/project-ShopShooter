import { useState, useEffect, useRef, useCallback } from 'react';

export type InputMode = 'keyboard_mouse' | 'touch';

export interface DeviceInputCapabilities {
  hasTouch: boolean;
  hasPointerCoarse: boolean;
  hasPointerFine: boolean;
  canHover: boolean;
  isHybrid: boolean;
  isPortrait: boolean;
  activeInputMode: InputMode;
  showVirtualControls: boolean;
  notifyTouchEvent: () => void;
}

/**
 * Intelligent automatic input detection for ShopShooter:
 * - Detects touch primary devices (mobile phones & tablets) via pointer: coarse or maxTouchPoints > 0.
 * - Displays touch controls (virtual joystick + action buttons) on touch devices and hides keyboard hints.
 * - Activates keyboard/mouse controls on desktop devices and hides virtual controls.
 * - For hybrid devices (touchscreen laptops), automatically detects based on the last used input event:
 *   - keydown or mousemove -> switches to desktop mode (hides virtual controls)
 *   - touchstart -> switches to touch mode (shows virtual controls)
 * - Transitions seamlessly without buttons, reloads, or manual toggles.
 * - Updates on 'resize' and 'orientationchange' to keep layout accurate.
 */
export function useInputDevice(): DeviceInputCapabilities {
  const checkTouchPoints = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return (
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      Boolean((navigator as any).msMaxTouchPoints && (navigator as any).msMaxTouchPoints > 0)
    );
  };

  const checkPointerCoarse = (): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(pointer: coarse)').matches;
  };

  const checkPointerFine = (): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(pointer: fine)').matches;
  };

  const checkCanHover = (): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(hover: hover)').matches;
  };

  const checkIsPortrait = (): boolean => {
    if (typeof window === 'undefined') return false;
    if (window.screen?.orientation?.type) {
      return window.screen.orientation.type.includes('portrait');
    }
    return window.innerHeight > window.innerWidth;
  };

  // Initial detection: touch device if pointer is coarse or has touch points
  const [activeInputMode, setActiveInputMode] = useState<InputMode>(() => {
    if (typeof window === 'undefined') return 'keyboard_mouse';
    const isCoarse = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
    const hasPoints = typeof navigator !== 'undefined' && (
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      Boolean((navigator as any).msMaxTouchPoints && (navigator as any).msMaxTouchPoints > 0)
    );
    const hasTouchStart = 'ontouchstart' in window;

    // Mobile / Tablet touchscreens initialize directly in touch mode
    if (isCoarse || hasPoints || hasTouchStart) {
      return 'touch';
    }
    return 'keyboard_mouse';
  });

  const [deviceCaps, setDeviceCaps] = useState(() => {
    const hasTouch = checkTouchPoints() || ('ontouchstart' in (typeof window !== 'undefined' ? window : {}));
    const hasPointerCoarse = checkPointerCoarse();
    const hasPointerFine = checkPointerFine();
    const canHover = checkCanHover();
    const isHybrid = (hasTouch || hasPointerCoarse) && (hasPointerFine || canHover);
    const isPortrait = checkIsPortrait();

    return {
      hasTouch: Boolean(hasTouch || hasPointerCoarse),
      hasPointerCoarse,
      hasPointerFine,
      canHover,
      isHybrid,
      isPortrait,
    };
  });

  // Track timestamp of last touch interaction to prevent synthetic mousemove events from immediately reverting mode
  const lastTouchTimeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // On touch event: switch to touch mode immediately
    const handleTouchStart = () => {
      lastTouchTimeRef.current = Date.now();
      setActiveInputMode((current) => (current !== 'touch' ? 'touch' : current));
    };

    // On keyboard event: switch to desktop mode immediately
    const handleKeyDown = () => {
      setActiveInputMode((current) => (current !== 'keyboard_mouse' ? 'keyboard_mouse' : current));
    };

    // On mouse move: switch to desktop mode (safeguarded against synthetic touch-generated mousemove)
    const handleMouseMove = (e: MouseEvent) => {
      // Ignore synthetic mousemove within 650ms after touch
      if (Date.now() - lastTouchTimeRef.current < 650) {
        return;
      }
      // Ignore static mouse movements (some browsers fire mousemove with 0 delta on tap)
      if (e.movementX === 0 && e.movementY === 0) {
        return;
      }
      setActiveInputMode((current) => (current !== 'keyboard_mouse' ? 'keyboard_mouse' : current));
    };

    // Screen resize and orientation change handler
    const handleScreenChange = () => {
      const hasTouch = checkTouchPoints() || ('ontouchstart' in window);
      const hasPointerCoarse = checkPointerCoarse();
      const hasPointerFine = checkPointerFine();
      const canHover = checkCanHover();
      const isHybrid = (hasTouch || hasPointerCoarse) && (hasPointerFine || canHover);
      const isPortrait = checkIsPortrait();

      setDeviceCaps({
        hasTouch: Boolean(hasTouch || hasPointerCoarse),
        hasPointerCoarse,
        hasPointerFine,
        canHover,
        isHybrid,
        isPortrait,
      });

      // If switched to pure touch screen device without fine pointer on resize/orientation
      if (hasPointerCoarse && !hasPointerFine && !canHover) {
        setActiveInputMode('touch');
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleScreenChange);
    window.addEventListener('orientationchange', handleScreenChange);

    // Initial orientation/screen check
    handleScreenChange();

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleScreenChange);
      window.removeEventListener('orientationchange', handleScreenChange);
    };
  }, []);

  const notifyTouchEvent = useCallback(() => {
    lastTouchTimeRef.current = Date.now();
    setActiveInputMode((current) => (current !== 'touch' ? 'touch' : current));
  }, []);

  const showVirtualControls = activeInputMode === 'touch';

  return {
    ...deviceCaps,
    activeInputMode,
    showVirtualControls,
    notifyTouchEvent,
  };
}
