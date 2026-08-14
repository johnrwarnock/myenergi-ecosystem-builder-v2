/**
 * Computes wiring geometry for a battery-style satellite attached to a
 * parent node — covers both the AC-coupled standalone battery (wired to the
 * switchboard, often has its own CT) and the DC-hybrid sub-battery (wired
 * straight down from its parent inverter, never has its own CT since the
 * inverter's own CT already covers combined solar+battery reading).
 *
 * Two attach styles, matching what these two cases actually need — not a
 * generic N-way router:
 *  - 'below': a straight vertical drop from the parent anchor into the
 *    satellite's top edge (the DC-hybrid sub-battery case).
 *  - 'side': horizontal from the satellite's bottom-edge to the parent's x,
 *    then vertical into the parent anchor (the AC battery → switchboard case).
 *
 * @param {Object} args
 * @param {{x:number, y:number, w:number, h:number}} args.box - satellite's own box position/size
 * @param {'below'|'side'} args.attachStyle
 * @param {{x:number, y:number}} args.parentAnchor - point on the parent to wire into
 * @param {{x:number, y:number, label:string, dest:{x:number, y:number}}|null} args.ct
 *   - CT position + signal destination, or null if this satellite has no CT of its own
 * @returns {{wireSegments: Array<{x1:number,y1:number,x2:number,y2:number}>, ct: null|{x:number,y:number,label:string,destX:number,destY:number}}}
 */
export function computeSatelliteAttachment({ box, attachStyle, parentAnchor, ct }) {
  const wireSegments = attachStyle === 'below'
    ? [{ x1: parentAnchor.x, y1: parentAnchor.y, x2: parentAnchor.x, y2: box.y }]
    : (() => {
        const wireY = box.y + box.h;
        return [
          { x1: box.x, y1: wireY, x2: parentAnchor.x, y2: wireY },
          { x1: parentAnchor.x, y1: wireY, x2: parentAnchor.x, y2: parentAnchor.y },
        ];
      })();

  return {
    wireSegments,
    ct: ct ? { x: ct.x, y: ct.y, label: ct.label, destX: ct.dest.x, destY: ct.dest.y } : null,
  };
}
