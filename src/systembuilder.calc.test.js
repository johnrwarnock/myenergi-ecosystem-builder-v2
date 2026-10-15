import { describe, it, expect } from 'vitest';
import { buildDiagramConfig, calcResults } from './systembuilder.jsx';
import { DEFAULT_LIBBI2 } from './libbi2.js';

// Every expected value below is hand-derived from calcResults' own logic
// (see the PR/commit that added this file for the worked arithmetic), not
// copied from the function's own output — the point is to catch calcResults
// disagreeing with what the CT/harvi rules actually specify, not to freeze
// whatever it currently happens to return.

const zappiSel = { 2: 1 };   // product id 2 = zappi (ctsIncluded 3, ctsSupported 3)
const gloSel   = { 3: 1 };   // product id 3 = GLO   (ctsIncluded 1, ctsSupported 2)

const solarInv1ph = { brand: 'Fronius', phase: '1ph', hasCoupledBat: false, coupledBatId: '' };
const solarInv3ph = { brand: 'Fronius', phase: '3ph', hasCoupledBat: false, coupledBatId: '' };
const solarInv2ph = { brand: 'Fronius', phase: '2ph', hasCoupledBat: false, coupledBatId: '' };
const dcHybridInv1ph = { brand: 'Fronius', phase: '1ph', hasCoupledBat: true, coupledBatId: '3' }; // Sungrow SBR/SBH (DC Hybrid)

const acBattery = { id: '1', mode: '' }; // Tesla Powerwall 2, AC Coupled

describe('calcResults — CT and harvi counts', () => {
  it('libbi 2 joins the device row; DC/Hybrid flag its own solar, no CT added', () => {
    const dc = { phase: '1ph', inverters: [], batteries: [], selections: { 6: 1 }, libbi2: { ...DEFAULT_LIBBI2, coupling: 'dc' } };
    const d = buildDiagramConfig(dc, false, true, true, 6);
    expect(d.pr).toEqual(['libbi 2']);
    expect(d.libbiPv).toBe(true);
    expect(d.inv).toEqual([]);
    expect(calcResults(dc, true, true, 6).totalCTs).toBe(1); // grid CT only
  });

  it('AC-coupled libbi 2 has no solar of its own; existing inverter keeps its CT', () => {
    const cfg = { phase: '1ph', inverters: [solarInv1ph], batteries: [], selections: { 6: 1 }, libbi2: { ...DEFAULT_LIBBI2, coupling: 'ac' } };
    const d = buildDiagramConfig(cfg, false, true, true, 6);
    expect(d.libbiPv).toBe(false);
    expect(d.inv).toHaveLength(1);
    expect(d.ab).toEqual([]);
    expect(calcResults(cfg, true, true, 6).totalCTs).toBe(2); // grid + generation
  });

  it('Hybrid keeps the existing inverter and flags libbi 2 solar', () => {
    const cfg = { phase: '1ph', inverters: [solarInv1ph], batteries: [], selections: { 6: 1 }, libbi2: { ...DEFAULT_LIBBI2, coupling: 'hybrid' } };
    const d = buildDiagramConfig(cfg, false, true, true, 6);
    expect(d.libbiPv).toBe(true);
    expect(d.inv).toHaveLength(1);
  });

  it('1ph, zappi only, no solar/battery: 1 grid CT, no harvi, no extra CTs', () => {
    const cfg = { phase: '1ph', inverters: [], batteries: [], selections: zappiSel };
    const r = calcResults(cfg, true, true, 2);
    expect(r.totalCTs).toBe(1);
    expect(r.ctsSupported).toBe(3);
    expect(r.ctsIncluded).toBe(3);
    expect(r.additionalCTs).toBe(0);
    expect(r.harvisNeeded).toBe(0);
    expect(r.hasSolar).toBe(false);
    expect(r.hasAcBat).toBe(false);
  });

  it('1ph, zappi + 1ph solar: 2 CTs total, fits within zappi capacity', () => {
    const cfg = { phase: '1ph', inverters: [solarInv1ph], batteries: [], selections: zappiSel };
    const r = calcResults(cfg, true, true, 2);
    expect(r.totalCTs).toBe(2);
    expect(r.additionalCTs).toBe(0);
    expect(r.harvisNeeded).toBe(0);
    expect(r.hasSolar).toBe(true);
  });

  it('1ph, GLO + 1ph solar, exactly at GLO capacity: needs 1 extra CT clamp but NO harvi (regression guard for the GLO default-wireless bug)', () => {
    const cfg = { phase: '1ph', inverters: [solarInv1ph], batteries: [], selections: gloSel };
    const r = calcResults(cfg, true, true, 3);
    expect(r.totalCTs).toBe(2);
    expect(r.ctsSupported).toBe(2);
    expect(r.additionalCTs).toBe(1);
    expect(r.harvisNeeded).toBe(0);
  });

  it('1ph, GLO + solar + AC battery, over GLO capacity: forces a harvi', () => {
    const cfg = { phase: '1ph', inverters: [solarInv1ph], batteries: [acBattery], selections: gloSel };
    const r = calcResults(cfg, true, true, 3);
    expect(r.totalCTs).toBe(3);
    expect(r.ctsIncluded).toBe(1);
    expect(r.additionalCTs).toBe(2);
    expect(r.harvisNeeded).toBe(1);
    expect(r.hasAcBat).toBe(true);
    expect(r.hasSolar).toBe(true);
  });

  it('3ph, zappi + 3ph solar + AC battery: 7 CTs, 2 harvis (solar bank + battery bank)', () => {
    const cfg = { phase: '3ph', inverters: [solarInv3ph], batteries: [acBattery], selections: zappiSel };
    const r = calcResults(cfg, true, true, 2);
    expect(r.totalCTs).toBe(7);
    expect(r.gridCTs).toBe(3);
    expect(r.additionalCTs).toBe(4);
    expect(r.harvisNeeded).toBe(2);
  });

  it('2ph, zappi + 2ph solar: grid CT×2, solar treated as a 3-CT bank, needs 2 harvis', () => {
    const cfg = { phase: '2ph', inverters: [solarInv2ph], batteries: [], selections: zappiSel };
    const r = calcResults(cfg, true, true, 2);
    expect(r.totalCTs).toBe(5);
    expect(r.gridCTs).toBe(2);
    expect(r.additionalCTs).toBe(2);
    expect(r.harvisNeeded).toBe(2);
  });

  it('1ph, zappi + DC-hybrid inverter: battery counted as 1 CT via the inverter, no separate AC battery flag', () => {
    const cfg = { phase: '1ph', inverters: [dcHybridInv1ph], batteries: [], selections: zappiSel };
    const r = calcResults(cfg, true, true, 2);
    expect(r.totalCTs).toBe(2);
    expect(r.hasSolar).toBe(true);
    expect(r.hasAcBat).toBe(false);
    expect(r.harvisNeeded).toBe(0);
  });

  it('monitorSolar=false excludes the solar CT from totals but hasSolar stays true (equipment presence vs. monitoring choice are independent)', () => {
    const cfg = { phase: '1ph', inverters: [solarInv1ph], batteries: [], selections: zappiSel };
    const r = calcResults(cfg, false, true, 2);
    expect(r.totalCTs).toBe(1);
    expect(r.hasSolar).toBe(true);
  });

  it('monitorBattery=false excludes the battery CT from totals but hasAcBat stays true', () => {
    const cfg = { phase: '1ph', inverters: [], batteries: [acBattery], selections: zappiSel };
    const r = calcResults(cfg, true, false, 2);
    expect(r.totalCTs).toBe(1);
    expect(r.hasAcBat).toBe(true);
  });

  it('no phase selected returns null (wizard not far enough along)', () => {
    const cfg = { phase: null, inverters: [], batteries: [], selections: {} };
    expect(calcResults(cfg, true, true, 2)).toBeNull();
  });
});
