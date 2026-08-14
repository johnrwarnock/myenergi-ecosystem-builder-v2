/**
 * When split at the main switch: grid CT stays upstream (sees total site
 * flow), then the main switch is the central fork — switchboard fed from its
 * top, myenergi device fed from its bottom. Property CT sits on the
 * switchboard branch, above the board, and reports back to the
 * inverter/battery. When not split, grid CT sits at its default position and
 * the fork-specific coordinates are unused (still computed for simplicity —
 * the caller only renders them when showMainSwitch is true).
 *
 * Kept as its own module deliberately — this topology (trunk splits into two
 * circuits with an inline CT on one branch) isn't "attach a satellite to a
 * parent," it's a genuine one-off. If a second novel fork topology appears,
 * write a new function like this one rather than forcing it through the
 * satellite-attachment primitive.
 *
 * @param {Object} args
 * @param {number} args.meterX @param {number} args.meterW
 * @param {number} args.boardX @param {number} args.boardCX
 * @param {number} args.busY @param {number} args.boardH
 * @param {boolean} args.showMainSwitch
 * @returns {{gridCtX:number, mainSwitchX:number, topY:number, propertyCtX:number, propDashY:number, bypassY:number}}
 */
export function computeMainSwitchFork({ meterX, meterW, boardX, boardCX, busY, boardH, showMainSwitch }) {
  const busSegStart = meterX + meterW;
  const busSegSpan = boardX - busSegStart;
  const gridCtX = Math.round(busSegStart + busSegSpan * (showMainSwitch ? 0.3 : 0.75));
  const mainSwitchX = showMainSwitch ? Math.round(busSegStart + busSegSpan * 0.65) : 0;
  const topY = busY - 80;
  const propertyCtX = showMainSwitch ? Math.round(mainSwitchX + (boardCX - mainSwitchX) * 0.55) : 0;
  const propDashY = topY - 18;
  const bypassY = busY + boardH / 2 + 24;
  return { gridCtX, mainSwitchX, topY, propertyCtX, propDashY, bypassY };
}
