import { describe, it, expect } from 'vitest';
import { LIBBI2_INVERTERS, DEFAULT_LIBBI2, libbi2Summary, libbi2Warnings, libbi2ProtectionRows, effectiveCoupling } from './libbi2.js';
import { protectionRows, PRODUCTS } from './systembuilder.jsx';

const cfg = patch => ({ ...DEFAULT_LIBBI2, ...patch });

describe('libbi2Summary', () => {
  it('capacity is shown rounded to 5 kWh per module (5, 10, 15, 20…)', () => {
    expect([1, 2, 3, 4].map(m => libbi2Summary(cfg({ modules: m })).capacityKWh)).toEqual([5, 10, 15, 20]);
    expect(libbi2Summary(cfg({})).moduleKWh).toBe(5);
  });

  it('clamps module count to the inverter limits', () => {
    expect(libbi2Summary(cfg({ modules: 12 })).modules).toBe(8);
    expect(libbi2Summary(cfg({ modules: 0 })).modules).toBe(1);
  });

  it('one module limits a 5 kW inverter to 80 A × 48 V ≈ 3.8 kW discharge', () => {
    const s = libbi2Summary(cfg({ inverterId: 'HS5', modules: 1 }));
    expect(s.batteryLimited).toBe(true);
    expect(s.dischargeKW).toBe(3.8);
    expect(libbi2Summary(cfg({ inverterId: 'HS5', modules: 2 })).batteryLimited).toBe(false);
  });

  it('flags the expansion kit from 5 modules', () => {
    expect(libbi2Summary(cfg({ modules: 4 })).needsExpansionKit).toBe(false);
    expect(libbi2Summary(cfg({ modules: 5 })).needsExpansionKit).toBe(true);
  });

  it('every released inverter has the fields the UI and diagrams read', () => {
    for (const i of LIBBI2_INVERTERS.filter(x => x.available)) {
      for (const k of ['model', 'label', 'gridBreakerA', 'epsBreakerA', 'epsRatedA', 'maxDischargeW', 'minModules', 'maxModules', 'expansionKitFrom'])
        expect(i[k], `${i.id}.${k}`).toBeDefined();
    }
  });
});

describe('coupling', () => {
  it('coupling is what was nominated: DC, AC or Hybrid', () => {
    for (const c of ['dc', 'ac', 'hybrid']) expect(effectiveCoupling(cfg({ coupling: c }))).toBe(c);
  });
  it('Hybrid with an existing inverter is valid; DC with one suggests Hybrid', () => {
    expect(libbi2Warnings(cfg({ coupling: 'hybrid', modules: 2 }), 1)).toEqual([]);
    expect(libbi2Warnings(cfg({ coupling: 'dc', modules: 2 }), 1).join()).toMatch(/Choose Hybrid/);
    expect(libbi2Warnings(cfg({ coupling: 'hybrid', modules: 2 }), 0).join()).toMatch(/needs the existing solar inverter/);
  });
  it('AC with no existing solar warns that it can only grid-charge', () => {
    expect(libbi2Warnings(cfg({ coupling: 'ac', modules: 2 }), 0).join()).toMatch(/only charge from the grid/);
  });
});

describe('libbi 2 circuit protection', () => {
  const circuits = c => libbi2ProtectionRows(c).map(r => r.circuit);

  it('always has grid, controller and earth', () => {
    expect(circuits(cfg({ coupling: 'ac', eps: false }))).toEqual(['Grid (ON-GRID) port', 'Controller supply (L1, not from EPS)', 'Chassis protective earth']);
  });
  it('EPS adds a 32 A circuit; PV adds a DC isolator', () => {
    const rows = libbi2ProtectionRows(cfg({ coupling: 'dc', eps: true }));
    expect(rows.find(r => r.circuit.startsWith('EPS')).breaker).toMatch(/^32 A MCB/);
    expect(rows.find(r => r.circuit.startsWith('PV')).breaker).toMatch(/DC isolator ≥ 500 V/);
  });
  it('5 kW: grid 40 A, EPS 32 A, 300 mA RCD', () => {
    const rows = libbi2ProtectionRows(cfg({ inverterId: 'HS5', eps: true }));
    expect(rows[0].breaker).toMatch(/^40 A MCB/);
    expect(rows[0].rcd).toMatch(/^300 mA Type A,/);
    expect(rows[0].cable).toBe('6–10 mm² Cu');
    expect(rows.find(r => r.circuit.startsWith('EPS')).breaker).toMatch(/^32 A MCB/);
  });
  it('8/10/12 kW are selectable with unconfirmed figures shown as TBC', () => {
    for (const id of ['HS8', 'HS10', 'HS12']) {
      const inv = LIBBI2_INVERTERS.find(i => i.id === id);
      expect(inv.available && inv.provisional).toBe(true);
      const rows = libbi2ProtectionRows(cfg({ inverterId: id, eps: true, coupling: 'dc' }));
      expect(rows.find(r => r.circuit.startsWith('Grid')).breaker).toBe('TBC');
      expect(rows.find(r => r.circuit.startsWith('EPS')).breaker).toBe('TBC');
      expect(rows.find(r => r.circuit.startsWith('PV')).breaker).toBe('TBC');
    }
  });
  it('EV chargers on 40 A, eddi on 16 A, harvi needs no supply', () => {
    const sel = [2, 3, 4, 5].map(id => ({ ...PRODUCTS.find(p => p.id === id), qty: 1 }));
    const rows = protectionRows({ libbi2: DEFAULT_LIBBI2, existing: {} }, sel, 1);
    expect(rows.map(r => r.breaker)).toEqual(['40 A MCB', '40 A MCB', '16 A MCB', '16 A MCB', 'Not required (powered by its CT)']);
    expect(rows.slice(0, 4).every(r => r.rcd === 'Type A')).toBe(true);
    expect(rows[0].cable).toBe('6–10 mm² Cu');
    expect(rows[2].cable).toBe('2.5 mm² Cu min');
  });
  it('already-installed devices are tagged (existing)', () => {
    const libbi = { ...PRODUCTS.find(p => p.id === 6), qty: 1 };
    const rows = protectionRows({ libbi2: DEFAULT_LIBBI2, existing: { 6: true } }, [libbi], 0);
    expect(rows.every(r => r.product.endsWith('(existing)'))).toBe(true);
  });
});

import { batterySupportArticles, GENERAL_BATTERY_ARTICLE, HYBRID_ARTICLE } from './supportArticles.js';
import { BATTERIES } from './systembuilder.jsx';

describe('battery support articles', () => {
  it('every battery gets the general article, last', () => {
    for (const b of BATTERIES) expect(batterySupportArticles(b.id).at(-1)).toBe(GENERAL_BATTERY_ARTICLE);
  });
  it('Powerwall and Sigenergy have their brand articles first', () => {
    expect(batterySupportArticles(2)[0].title).toMatch(/Powerwall/);
    expect(batterySupportArticles('4')[0].title).toMatch(/Sigenergy/);
  });
  it('hybrid inverter article points at the Help Centre article 4716922623633', () => {
    expect(HYBRID_ARTICLE.url).toBe('https://support.myenergi.com/hc/en-gb/articles/4716922623633-Hybrid-PV-Battery-Set-up-Avoid-Draining');
  });
  it('all links are myenergi Help Centre article URLs', () => {
    for (const b of BATTERIES) for (const a of batterySupportArticles(b.id))
      expect(a.url).toMatch(/^https:\/\/support\.myenergi\.com\/hc\/en-gb\/articles\/\d+-/);
  });
});
