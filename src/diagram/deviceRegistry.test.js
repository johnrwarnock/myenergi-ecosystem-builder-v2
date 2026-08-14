import { describe, it, expect } from 'vitest';
import { DEVICE_REGISTRY } from './deviceRegistry.js';
import { PRODUCTS } from '../systembuilder.jsx';

// This is the test that would have caught the CTRL_CTS-vs-PRODUCTS.ctsSupported
// drift bug fixed alongside this registry: every trunk device sold as a
// myenergi PRODUCTS entry must have a diagram registry entry, or a future
// product addition silently falls back to devHOf/devWOf's `|| 1` default
// (unscaled) instead of rendering at its real size.
describe('DEVICE_REGISTRY covers every PRODUCTS entry', () => {
  it('has a registry entry for each product friendlyName', () => {
    const missing = PRODUCTS
      .map(p => p.friendlyName)
      .filter(name => !DEVICE_REGISTRY[name]);
    expect(missing, `PRODUCTS entries with no DEVICE_REGISTRY match: ${missing.join(', ')}`).toEqual([]);
  });

  it('every registry entry has a positive scale, and icon is either a real URL or an explicit null (documented "no artwork yet" fallback)', () => {
    for (const [name, spec] of Object.entries(DEVICE_REGISTRY)) {
      expect(
        spec.icon === null || (typeof spec.icon === 'string' && spec.icon.length > 0),
        `${name}.icon must be null or a non-empty string, got ${JSON.stringify(spec.icon)}`
      ).toBe(true);
      expect(spec.scale, `${name} missing/invalid scale`).toBeGreaterThan(0);
    }
  });
});
