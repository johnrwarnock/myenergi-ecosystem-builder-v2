/**
 * Horizontal extent can exceed the base viewBox once several wide secondaries
 * are laid out with real, non-overlapping spacing — grow the viewBox to fit
 * rather than clip, the same way VH already grows to fit content height.
 *
 * @param {Object} args
 * @param {Array<{name:string, x:number, cx:number}>} args.devPositions
 * @param {number} args.devW - base device width (zappi's special-cased rendering needs this)
 * @param {(name: string) => number} args.devWOf - real rendered width for a device name
 * @param {number} args.VX - base viewBox x origin
 * @param {number} args.VW - base viewBox width
 * @param {number} args.VH - already-computed viewBox height (passed through unchanged)
 * @returns {{VXeff:number, VWeff:number, VH:number}}
 */
export function computeViewBox({ devPositions, devW, devWOf, VX, VW, VH }) {
  const devLeftEdge  = d => d.name === "zappi" ? (d.x - devW / 2) : (d.cx - devWOf(d.name) / 2);
  const devRightEdge = d => d.name === "zappi" ? (d.x - devW / 2 + devW * 2) : (d.cx + devWOf(d.name) / 2);
  const VXeff = Math.min(VX, ...devPositions.map(devLeftEdge)) - 10;
  const VWeff = Math.max(VX + VW, ...devPositions.map(devRightEdge)) + 10 - VXeff;
  return { VXeff, VWeff, VH };
}
