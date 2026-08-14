import { describe, it, expect } from 'vitest';
import { computeSecondaryRow } from './secondaryRow.js';
import { computeViewBox } from './viewBox.js';
import { computeMainSwitchFork } from './fork.js';

// All expected values below are hand-derived from each function's own
// documented formula, not copied from the function's own output.

describe('computeSecondaryRow', () => {
  const devWOf = name => Math.round(96 * ({ zappi: 2, eddi: 1.5, libbi: 2.25 }[name] || 1));

  it('spaces two differently-sized devices by real width + margin, and staggers the second', () => {
    const result = computeSecondaryRow({
      ctrlCX: 308, boardW: 96, devW: 96, secRowY: 400,
      secDevList: ['eddi', 'libbi'], devWOf,
    });
    expect(result).toEqual([
      { name: 'eddi',  isCtrl: false, x: 118, cx: 190, y: 400, boardExitCx: 292 },
      { name: 'libbi', isCtrl: false, x: 282, cx: 390, y: 444, boardExitCx: 324 },
    ]);
  });

  it('a single secondary centres under the controller with no stagger (cx === boardExitCx, so the caller draws a straight line)', () => {
    const result = computeSecondaryRow({
      ctrlCX: 308, boardW: 96, devW: 96, secRowY: 400,
      secDevList: ['eddi'], devWOf,
    });
    expect(result).toEqual([
      { name: 'eddi', isCtrl: false, x: 236, cx: 308, y: 400, boardExitCx: 308 },
    ]);
  });

  it('zappi as a secondary uses the special x offset (cx - devW/2), not the generic cx - fullWidth/2', () => {
    const result = computeSecondaryRow({
      ctrlCX: 308, boardW: 96, devW: 96, secRowY: 400,
      secDevList: ['zappi'], devWOf,
    });
    expect(result[0]).toEqual({ name: 'zappi', isCtrl: false, x: 260, cx: 308, y: 400, boardExitCx: 308 });
  });
});

describe('computeViewBox', () => {
  it('base viewBox wins when content fits comfortably inside it', () => {
    const result = computeViewBox({
      devPositions: [{ name: 'other', x: 100, cx: 150 }],
      devW: 96, devWOf: () => 50, VX: -20, VW: 730, VH: 400,
    });
    expect(result).toEqual({ VXeff: -30, VWeff: 750, VH: 400 });
  });

  it('grows past the base viewBox when a device extends beyond it', () => {
    const result = computeViewBox({
      devPositions: [{ name: 'other', x: 0, cx: 900 }],
      devW: 96, devWOf: () => 50, VX: -20, VW: 730, VH: 400,
    });
    expect(result).toEqual({ VXeff: -30, VWeff: 965, VH: 400 });
  });
});

describe('computeMainSwitchFork', () => {
  const base = { meterX: 115, meterW: 56, boardX: 260, boardCX: 308, busY: 175, boardH: 50 };

  it('when not split, grid CT sits at its default (75%) position and fork coordinates are zeroed', () => {
    const result = computeMainSwitchFork({ ...base, showMainSwitch: false });
    expect(result).toEqual({ gridCtX: 238, mainSwitchX: 0, topY: 95, propertyCtX: 0, propDashY: 77, bypassY: 224 });
  });

  it('when split, grid CT moves upstream (30%) and the fork/property-CT positions are derived from the main switch', () => {
    const result = computeMainSwitchFork({ ...base, showMainSwitch: true });
    expect(result).toEqual({ gridCtX: 198, mainSwitchX: 229, topY: 95, propertyCtX: 272, propDashY: 77, bypassY: 224 });
  });
});
