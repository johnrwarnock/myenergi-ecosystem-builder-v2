/**
 * Board-exit points (where each circuit visually leaves the switchboard) stay
 * evenly spaced within the board width. Actual device centres are spaced by
 * each device's real rendered width plus a fixed margin, so wide icons
 * (libbi, GLO) never overlap a neighbour — a short jog (drawn by the caller)
 * connects the two. Alternating secondaries stagger onto a lower row so
 * repeated devices (e.g. two zappis) each keep a clearly separate line.
 *
 * @param {Object} args
 * @param {number} args.ctrlCX - x-centre of the controller/switchboard
 * @param {number} args.boardW - switchboard width, used to space board-exit points
 * @param {number} args.devW - base device width (zappi's special-cased rendering needs this)
 * @param {number} args.secRowY - base y for the secondary row
 * @param {string[]} args.secDevList - device names in display order, excluding the controller
 * @param {(name: string) => number} args.devWOf - real rendered width for a device name
 * @returns {Array<{name:string, isCtrl:boolean, x:number, cx:number, y:number, boardExitCx:number}>}
 */
export function computeSecondaryRow({ ctrlCX, boardW, devW, secRowY, secDevList, devWOf }) {
  const SEC_MARGIN = 20;
  const STAGGER_Y = 44;
  const secLineStep = Math.floor(boardW / (secDevList.length + 1));
  const secWidths = secDevList.map(devWOf);
  const totalSecW = secWidths.reduce((s, w) => s + w, 0) + SEC_MARGIN * (secDevList.length - 1);
  let cursorX = ctrlCX - totalSecW / 2;
  return secDevList.map((name, i) => {
    const boardExitCx = ctrlCX + Math.round((i - (secDevList.length - 1) / 2) * secLineStep);
    const w = secWidths[i];
    const cx = cursorX + w / 2;
    cursorX += w + SEC_MARGIN;
    // The zappi image is rendered specially (x - devW/2, width devW*2 — see the
    // device-rendering block in Diagram()), so its stored x must match that
    // convention rather than the generic cx - fullWidth/2 used by every other
    // device, or its icon renders off-centre from its own wire.
    const x = name === "zappi" ? cx - devW / 2 : cx - w / 2;
    const y = secRowY + (i % 2 === 1 ? STAGGER_Y : 0);
    return { name, isCtrl: false, x, cx, y, boardExitCx };
  });
}
