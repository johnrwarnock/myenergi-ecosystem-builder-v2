import { describe, it, expect } from 'vitest';
import { computeSatelliteAttachment } from './satellite.js';

describe('computeSatelliteAttachment', () => {
  it("'below' attach (DC-hybrid sub-battery): straight vertical drop from parent into the box, no CT", () => {
    const result = computeSatelliteAttachment({
      box: { x: 489, y: 218, w: 50, h: 38 },
      attachStyle: 'below',
      parentAnchor: { x: 514, y: 196 },
      ct: null,
    });
    expect(result).toEqual({
      wireSegments: [{ x1: 514, y1: 196, x2: 514, y2: 218 }],
      ct: null,
    });
  });

  it("'side' attach (AC battery → switchboard): horizontal from box bottom-edge then vertical into the parent, with a CT", () => {
    const result = computeSatelliteAttachment({
      box: { x: 489, y: 46, w: 50, h: 40 },
      attachStyle: 'side',
      parentAnchor: { x: 308, y: 150 },
      ct: { x: 401, y: 86, label: 'Bat CT', dest: { x: 600, y: 300 } },
    });
    expect(result).toEqual({
      wireSegments: [
        { x1: 489, y1: 86, x2: 308, y2: 86 },
        { x1: 308, y1: 86, x2: 308, y2: 150 },
      ],
      ct: { x: 401, y: 86, label: 'Bat CT', destX: 600, destY: 300 },
    });
  });
});
