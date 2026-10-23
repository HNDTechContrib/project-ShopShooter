import { useState, useEffect, useCallback } from 'react';

export type InputMode = 'keyboard_mouse' | 'touch';
export type ControlPreference = 'auto' | 'keyboard_mouse' | 'touch';

export interface DeviceInputCapabilities {
  hasTouch: boolean;
  hasPointerFine: boolean;
  hasPointerCoarse: boolean;
  canHover: boolean;
  isHybrid: boolean;
  activeInputMode: InputMode;
  controlPreference: ControlPreference;
  showVirtualControls: boolean;
  setControlPreference: (pref: ControlPreference) => void;
  toggleVirtualControls: () => void;
  notifyTouchEvent: () => void;
}

/**
 * Hook to intelligently detect device capabilities (touch vs keyboard/mouse)
 * Handles desktop, laptops, smartphones, tablets, and touchscreen hybrid laptops.
 */
export function useInputDevice(): DeviceInputCapabilities {
  // Query hardware capabilities accurately
  const checkHardwareTouch = (): boolean => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      ((navigator as any).msMaxTouchPoints && (navigator as any).msMaxTouchPoints > 0)
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

  const [capabilities, setCapabilities] = useState(() => {
    const hasTouch = checkHardwareTouch();
    const hasPointerCoarse = checkPointerCoarse();
    const hasPointerFine = checkPointerFine();
    const canHover = checkCanHover();
    // Hybrid device: has touchscreen capability AND a fine pointer / mouse / touchpad
    const isHybrid = hasTouch && (hasPointerFine || canHover);

    return {
      hasTouch,
      hasPointerCoarse,
      hasPointerFine,
      canHover,
      isHybrid,
    };
  });

  // Stored user preference: 'auto' | 'keyboard_mouse' | 'touch'
  const [controlPreference, setControlPreferenceState] = useState<ControlPreference>(() => {
    try {
      const saved = localStorage.getItem('shopshooter_control_pref');
      if (saved === 'keyboard_mouse' || saved === 'touch' || saved === 'auto') {
        return saved;
      }
    } catch {}
    return 'auto';
  });

  // Dynamic state when touch event actually occurs at runtime
  const [detectedRuntimeTouch, setDetectedRuntimeTouch] = useState<boolean>(false);

  // Update capabilities on media query changes (e.g. tablet docked, external mouse connected)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const coarseQuery = window.matchMedia('(pointer: coarse)');
    const fineQuery = window.matchMedia('(pointer: fine)');
    const hoverQuery = window.matchMedia('(hover: hover)');

    const updateCapabilities = () => {
      const hasTouch = checkHardwareTouch();
      const hasPointerCoarse = coarseQuery.matches;
      const hasPointerFine = fineQuery.matches;
      const canHover = hoverQuery.matches;
      const isHybrid = hasTouch && (hasPointerFine || canHover);

      setCapabilities({
        hasTouch,
        hasPointerCoarse,
        hasPointerFine,
        canHover,
        isHybrid,
      });
    };

    coarseQuery.addEventListener?.('change', updateCapabilities);
    fineQuery.addEventListener?.('change', updateCapabilities);
    hoverQuery.addEventListener?.('change', updateCapabilities);

    return () => {
      coarseQuery.removeEventListener?.('change', updateCapabilities);
      fineQuery.removeEventListener?.('change', updateCapabilities);
      hoverQuery.removeEventListener?.('change', updateCapabilities);
    };
  }, []);

  // Set control preference and persist
  const setControlPreference = useCallback((pref: ControlPreference) => {
    setControlPreferenceState(pref);
    try {
      localStorage.setItem('shopshooter_control_pref', pref);
    } catch {}
  }, []);

  // When a touch interaction happens on the arena, record runtime touch
  const notifyTouchEvent = useCallback(() => {
    if (!detectedRuntimeTouch) {
      setDetectedRuntimeTouch(true);
    }
  }, [detectedRuntimeTouch]);

  // Determine active input mode
  let activeInputMode: InputMode = 'keyboard_mouse';

  if (controlPreference === 'touch') {
    activeInputMode = 'touch';
  } else if (controlPreference === 'keyboard_mouse') {
    activeInputMode = 'keyboard_mouse';
  } else {
    // 'auto' mode:
    // If no hardware touch at all -> desktop (keyboard/mouse)
    if (!capabilities.hasTouch) {
      activeInputMode = 'keyboard_mouse';
    } 
    // Pure touch device (smartphone or tablet with coarse pointer and no hover)
    else if (capabilities.hasPointerCoarse && !capabilities.canHover) {
      activeInputMode = 'touch';
    }
    // Hybrid laptop with touch and mouse:
    // If runtime touch was detected, or coarse is primary and no fine pointer -> touch
    // Otherwise default to keyboard_mouse so desktop arena stays clean!
    else if (capabilities.isHybrid) {
      if (detectedRuntimeTouch) {
        activeInputMode = 'touch';
      } else {
        activeInputMode = 'keyboard_mouse';
      }
    } else {
      activeInputMode = capabilities.hasTouch ? 'touch' : 'keyboard_mouse';
    }
  }

  const showVirtualControls = activeInputMode === 'touch';

  const toggleVirtualControls = useCallback(() => {
    const nextPref: ControlPreference = showVirtualControls ? 'keyboard_mouse' : 'touch';
    setControlPreference(nextPref);
  }, [showVirtualControls, setControlPreference]);

  return {
    ...capabilities,
    activeInputMode,
    controlPreference,
    showVirtualControls,
    setControlPreference,
    toggleVirtualControls,
    notifyTouchEvent,
  };
}
