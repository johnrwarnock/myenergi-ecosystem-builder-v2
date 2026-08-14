import { test, expect } from '@playwright/test';

/**
 * Visual/overlap regression suite for the wiring diagram.
 *
 * Scope, deliberately: this checks (1) no two <text> labels' bounding boxes
 * intersect, and (2) no label is clipped outside the SVG's own viewBox.
 * Both are geometric, well-defined, and directly target the bug class found
 * during manual review (e.g. "MAIN SWITCH" overlapping "MAIN SWITCHBOARD",
 * and secondary devices clipped off the edge of a fixed-width canvas).
 *
 * Deliberately NOT checked: solid lines/wires passing behind a label. That's
 * an established, intentional pattern in this diagram (e.g. the AC battery's
 * connecting line already crosses behind the "MAIN SWITCHBOARD" label) —
 * checking it would need a large allowlist and mostly produce noise rather
 * than catching real bugs.
 *
 * Runs against every entry in App.jsx's CONFIGS demo picker, via the
 * tests/diagram-preview.html fixture (mounts App.jsx's default export in
 * isolation — not the real wizard, which lives in systembuilder.jsx).
 */

test('every diagram config renders with no overlapping or clipped labels', async ({ page }) => {
  await page.goto('tests/diagram-preview.html');

  const buttons = page.locator('button');
  const count = await buttons.count();
  expect(count, 'expected the CONFIGS demo picker to render at least one button').toBeGreaterThan(0);

  const labels = [];
  for (let i = 0; i < count; i++) labels.push((await buttons.nth(i).textContent()).trim());

  const allIssues = [];

  for (const label of labels) {
    await page.locator('button', { hasText: label }).first().click();
    await page.waitForTimeout(100);

    const issues = await page.evaluate((configLabel) => {
      const svg = document.querySelector('svg');
      if (!svg) return [`${configLabel}: no <svg> found`];
      const vb = svg.viewBox.baseVal;
      const found = [];

      // NOTE: SVGRect's x/y/width/height are prototype getters, not own
      // properties — `{...t.getBBox()}` silently spreads to {} and would
      // make every box look zero-sized. Read fields explicitly instead.
      const boxes = Array.from(svg.querySelectorAll('text'))
        .map(t => {
          const b = t.getBBox();
          return { text: t.textContent.trim(), x: b.x, y: b.y, width: b.width, height: b.height };
        })
        .filter(b => b.text.length > 0 && b.width > 0 && b.height > 0);

      const TOL = 1; // px tolerance for anti-aliasing/rounding

      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i], b = boxes[j];
          const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
          const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
          if (overlapX > TOL && overlapY > TOL) {
            found.push(`${configLabel}: label overlap "${a.text}" × "${b.text}" (${overlapX.toFixed(1)}×${overlapY.toFixed(1)}px)`);
          }
        }
      }

      boxes.forEach(b => {
        if (b.x < vb.x - TOL || b.y < vb.y - TOL ||
            b.x + b.width > vb.x + vb.width + TOL || b.y + b.height > vb.y + vb.height + TOL) {
          found.push(`${configLabel}: label "${b.text}" clipped outside viewBox`);
        }
      });

      return found;
    }, label);

    allIssues.push(...issues);
  }

  expect(allIssues, allIssues.join('\n')).toEqual([]);
});
