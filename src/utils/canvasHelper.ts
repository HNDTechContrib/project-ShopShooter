/**
 * Global Canvas Polyfills and Utilities
 * Ensures safe execution of roundRect across all browsers and devices.
 */

export function ensureCanvasPolyfills() {
  if (typeof window === 'undefined') return;

  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (
      x: number,
      y: number,
      w: number,
      h: number,
      radii?: number | number[]
    ) {
      let r = typeof radii === 'number' ? radii : Array.isArray(radii) ? radii[0] || 0 : 0;
      r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
      this.beginPath();
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
      return this;
    };
  }
}

// Auto-run on import
ensureCanvasPolyfills();
