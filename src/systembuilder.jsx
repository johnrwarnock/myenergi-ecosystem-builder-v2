import React, { useState, useMemo, useRef, useEffect } from "react";
import { Diagram } from "./App";
import zappiImgUrl from "./zappi.svg";
import eddiImgUrl from "./eddi.svg";
import eddiPlusImgUrl from "./eddi+.svg";
import gloImgUrl from "./GLO.svg";
import harviImgUrl from "./harvi.svg";
import libbiImgUrl from "./libbi.svg";

// ── Brand design tokens ───────────────────────────────────────────────────────
const G      = "#40ff7a";   // Accent 1 — myenergi green
const G_TXT  = "#40ff7a";   // green text (bright works on black)
const DARK   = "#000000";   // page / tool background — locked black
const CARD   = "#343434";   // text box / card background
const BORDER = "#4a4a4a";   // border colour
const MUTED  = "#777";      // subdued / hint text
const WARN   = "#ff008c";   // Accent 2 — warnings & errors
const YELLOW = "#ff008c";   // Accent 2 — harvi / wireless indicator
const BLUE   = "#56c1dd";   // info blue

export const INVERTER_BRANDS = [
  { name: "myenergi libbi",       acOnly: false, allInOne: true,  autoBatId: 14 },
  { name: "myenergi libbi 2",     acOnly: false, allInOne: true,  autoBatId: 18 },
  { name: "Tesla Powerwall 3",    acOnly: false, allInOne: true,  autoBatId: 2  },
  { name: "Sigenergy",            acOnly: false, allInOne: true,  autoBatId: 4  },
  { name: "Alpha ESS",            acOnly: false, allInOne: true,  autoBatId: 6  },
  { name: "Fronius",              acOnly: false, allInOne: false, autoBatId: 15 },
  { name: "Sungrow",              acOnly: false, allInOne: false, autoBatId: 3  },
  { name: "Goodwe",               acOnly: false, allInOne: false, autoBatId: 7  },
  { name: "SolarEdge",            acOnly: false, allInOne: false, autoBatId: 8  },
  { name: "Enphase",              acOnly: true,  allInOne: false, autoBatId: null },
  { name: "SMA",                  acOnly: false, allInOne: false, autoBatId: null },
  { name: "Growatt",              acOnly: false, allInOne: false, autoBatId: null },
  { name: "Solis",                acOnly: false, allInOne: false, autoBatId: null },
  { name: "iStore (Huawei OEM)",  acOnly: false, allInOne: false, autoBatId: 10 },
  { name: "FoxESS",               acOnly: false, allInOne: false, autoBatId: 11 },
  { name: "Other (standalone inverter)",      acOnly: false, allInOne: false, autoBatId: null },
  { name: "Other (hybrid + DC battery)",      acOnly: false, allInOne: false, autoHybrid: true, autoBatId: 99 },
  { name: "Other (all-in-one)",               acOnly: false, allInOne: true,  autoBatId: 99 },
];

export const BATTERIES = [
  { id: 14, label: "myenergi libbi",             type: "AC or DC" },
  { id: 18, label: "myenergi libbi 2",           type: "AC or DC" },
  { id: 4,  label: "Sigenergy SigenStor",        type: "DC Hybrid" },
  { id: 1,  label: "Tesla Powerwall 2",          type: "AC Coupled" },
  { id: 2,  label: "Tesla Powerwall 3",          type: "AC or DC" },
  { id: 3,  label: "Sungrow SBR / SBH",         type: "DC Hybrid" },
  { id: 11, label: "FoxESS ECS / HV series",    type: "DC Hybrid" },
  { id: 6,  label: "Alpha ESS Smile / Storion",  type: "AC or DC" },
  { id: 16, label: "Growatt ARK / APX",          type: "DC Hybrid" },
  { id: 17, label: "Goodwe Lynx Home U/F / ESA", type: "DC Hybrid" },
  { id: 5,  label: "BYD HVS / HVM",             type: "DC Hybrid" },
  { id: 8,  label: "SolarEdge Home Battery",    type: "DC Hybrid" },
  { id: 9,  label: "Enphase IQ Battery",        type: "AC Coupled" },
  { id: 10, label: "iStore Battery",            type: "DC Hybrid" },
  { id: 12, label: "Franklin Home Power",       type: "AC Coupled" },
  { id: 15, label: "Fronius Reserva",           type: "DC Hybrid" },
  { id: 99, label: "Other",                     type: null },
];

export const DC_BATTERIES = BATTERIES.filter(b => b.type === "DC Hybrid" || b.type === "AC or DC" || b.id === 99);
export const AC_BATTERIES = BATTERIES.filter(b => b.type === "AC Coupled" || b.type === "AC or DC" || b.id === 99);

export const PRODUCTS = [
  {
    id: 2, name: "zappi multiphase (7 / 22kW)", friendlyName: "zappi",
    tagline: "Smart EV Charger",
    desc: "Charges your electric vehicle using surplus solar or off-peak power. Works with all EVs.",
    ctsIncluded: 3, ctsSupported: 3,
  },
  {
    id: 3, name: "GLO", friendlyName: "GLO",
    tagline: "Single-Phase EV Charger",
    desc: "Simple but smart younger cousin to zappi. Single phase only, no screen, same smart functionality.",
    ctsIncluded: 1, ctsSupported: 2,
  },
  {
    id: 4, name: "eddi", friendlyName: "eddi",
    tagline: "Solar Diverter",
    desc: "Diverts surplus solar to heat water or other appliances instead of exporting it to the grid.",
    ctsIncluded: 1, ctsSupported: 2, hasAppliances: true,
  },
  {
    id: 5, name: "eddi+", friendlyName: "eddi+",
    tagline: "Solar Diverter Plus",
    desc: "Like eddi, with 3 CT inputs — ideal for 3-phase installations or complex setups.",
    ctsIncluded: 3, ctsSupported: 3, hasAppliances: true,
  },
  {
    id: 6, name: "libbi", friendlyName: "libbi",
    tagline: "Home Battery System",
    desc: "Stores surplus solar energy to power your home in the evening or during grid outages.",
    ctsIncluded: 1, ctsSupported: 3,
  },
  {
    id: 7, name: "libbi 2", friendlyName: "libbi2",
    tagline: "Home Battery System",
    desc: "Next-generation myenergi home battery with a dedicated controller and optional CSIP-AUS compliance support.",
    // CT capacity unconfirmed — placeholder matching libbi 1 until the
    // product team confirms libbi 2's actual figures.
    ctsIncluded: 1, ctsSupported: 3,
  },
];

const APPLIANCE_OPTIONS = [
  { value: "",           label: "Select appliance…" },
  { value: "hot-water",  label: "Electric hot water cylinder" },
  { value: "underfloor", label: "Underfloor heating" },
  { value: "pool",       label: "Pool / spa heater" },
  { value: "radiator",   label: "Radiator heater" },
  { value: "other",      label: "Other" },
];

// ── Translate SystemBuilder state → Diagram config ───────────────────────────
export function buildDiagramConfig(cfg, wireless, monitorSolar, monitorBattery, controllerProductId, zappiSinglePhase = false, mainSwitchSplit = false, csipRequired = false) {
  const { phase, inverters = [], batteries = [], selections = {}, eddiAppliances = {} } = cfg;

  const sp = phase || "1ph";
  const wl = wireless || phase === "2ph";

  const inv = inverters
    .filter(i => i.brand)
    .map(i => {
      const coupledBat = i.hasCoupledBat && i.coupledBatId
        ? DC_BATTERIES.find(b => b.id === parseInt(i.coupledBatId))
        : null;
      return {
        ph: i.phase || "1ph",
        dc: !!i.hasCoupledBat,
        db: !!(i.hasCoupledBat && i.coupledBatId),
        ms: monitorSolar,
        label:    i.brand !== "Other" ? i.brand : null,
        batLabel: coupledBat && parseInt(i.coupledBatId) !== 99 ? coupledBat.label : null,
      };
    });

  const ab = batteries
    .filter(b => {
      const found = AC_BATTERIES.find(x => x.id === parseInt(b.id));
      if (!found) return false;
      // Standalone batteries with "AC or DC" type default to AC Coupled (DC goes via inverter card)
      const t = found.type === "AC or DC" ? (b.mode || "AC Coupled") : (found.id === 99 ? "AC Coupled" : found.type);
      return t === "AC Coupled";
    })
    .map(b => {
      const found = AC_BATTERIES.find(x => x.id === parseInt(b.id));
      return {
        mb: monitorBattery,
        label: parseInt(b.id) !== 99 ? (found?.label || null) : null,
      };
    });

  const ORDER = [
    { id: 2, name: "zappi" },
    { id: 5, name: "eddi+" },
    { id: 4, name: "eddi" },
    { id: 3, name: "GLO" },
    { id: 6, name: "libbi" },
    { id: 7, name: "libbi2" },
  ];
  const pr = [];
  const ctrlEntry = ORDER.find(p => p.id === controllerProductId);
  if (ctrlEntry && (selections[controllerProductId] || 0) > 0) pr.push(ctrlEntry.name);
  ORDER.forEach(({ id, name }) => {
    const qty = selections[id] || 0;
    const skip = id === controllerProductId ? 1 : 0;
    for (let q = skip; q < qty; q++) pr.push(name);
  });
  if (pr.length === 0) pr.push("zappi");

  // Only force wireless when actually needed: the caller already folds in the
  // 1ph over-capacity case via effectiveWireless, and the diagram itself
  // separately re-derives the 3ph limited-controller case (gridToHarvi in
  // App.jsx) — this must not blanket-force wireless just because a controller
  // (e.g. GLO, eddi) natively supports fewer than 3 CTs.
  const wlFinal = wl || (zappiSinglePhase && phase === "3ph");

  // Flatten eddiAppliances into per-device array: [["hot-water","underfloor"],["pool",""]]
  // one entry per eddi or eddi+ in the pr list, in order
  const appliancesList = [];
  const eddiCounts = { eddi: 0, "eddi+": 0 };
  pr.forEach(name => {
    if (name === "eddi" || name === "eddi+") {
      const prodId = name === "eddi" ? "4" : "5";
      const idx = eddiCounts[name];
      const entry = (eddiAppliances[prodId] || [])[idx] || { app1: "", app2: "" };
      appliancesList.push({ device: name, app1: entry.app1, app2: entry.app2 });
      eddiCounts[name]++;
    }
  });

  // Single source of truth for CT capacity: PRODUCTS.ctsSupported, not a
  // second copy hardcoded in the diagram layer (App.jsx previously kept its
  // own name-keyed CTRL_CTS map, which could silently drift from this).
  const ctrlProduct = PRODUCTS.find(p => p.friendlyName === pr[0]);
  const ctrlCtsSupported = ctrlProduct?.ctsSupported ?? 3;

  return { sp, inv, ab, wl: wlFinal, pr, appliancesList, mainSwitchSplit, ctrlCtsSupported, csipRequired };
}

const ICON_URLS = {
  "zappi multiphase (7 / 22kW)": zappiImgUrl,
  "GLO":   gloImgUrl,
  "eddi":  eddiImgUrl,
  "eddi+": eddiPlusImgUrl,
  "libbi": libbiImgUrl,
  "harvi": harviImgUrl,
};

function Icon({ name }) {
  const box = { width: 48, height: 48, background: CARD, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", padding: 4, boxSizing: "border-box" };
  const url = ICON_URLS[name];
  if (url) return (
    <div style={box}>
      <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }}/>
    </div>
  );
  return <div style={{ ...box, fontSize: 9, color: MUTED, textAlign: "center", padding: 4 }}>{name}</div>;
}

const newInv = () => ({ uid: Math.random(), brand: "", phase: "", hasCoupledBat: false, coupledBatId: "", coupledBatMode: "" });
const newBat = () => ({ uid: Math.random(), id: "", mode: "" });

export function resolveStandaloneBatType(bat) {
  const found = AC_BATTERIES.find(b => b.id === parseInt(bat.id));
  if (!found) return null;
  if (found.type === "AC or DC") return bat.mode || null;
  if (found.id === 99) return "AC Coupled";
  return found.type;
}

export function calcResults(cfg, monitorSolar, monitorBattery, controllerProductId) {
  const { phase, inverters, batteries, selections } = cfg;
  if (!phase) return null;
  const is1ph = phase === "1ph", is2ph = phase === "2ph", is3ph = phase === "3ph";
  const multi = is2ph || is3ph;
  const comps = [];

  comps.push({ label: "Grid connection", cts: is3ph ? 3 : is2ph ? 2 : 1, isGrid: true });

  if (monitorSolar) {
    inverters.filter(inv => inv.brand).forEach(inv => {
      const iph = inv.phase || "1ph";
      const cts = iph === "1ph" ? 1 : (multi ? 3 : 1);
      if (inv.hasCoupledBat && inv.coupledBatId) {
        const bat = DC_BATTERIES.find(b => b.id === parseInt(inv.coupledBatId));
        comps.push({ label: `DC Hybrid: ${inv.brand}${bat ? " + " + bat.label : ""} (${iph})`, cts, isBattery: true });
      } else {
        comps.push({ label: `Solar inverter: ${inv.brand} (${iph})`, cts, isSolar: true });
      }
    });
  }

  if (monitorBattery) {
    batteries.filter(b => b.id).forEach(b => {
      const t = resolveStandaloneBatType(b);
      if (t === "AC Coupled") {
        const found = AC_BATTERIES.find(x => x.id === parseInt(b.id));
        comps.push({ label: `Battery (AC): ${found?.label || ""}`, cts: 1, isBattery: true });
      }
    });
  }

  // libbi 2's dedicated controller carries its own metering CT — required
  // hardware, not an optional monitoring choice, so it's counted regardless
  // of monitorSolar/monitorBattery (same treatment as the grid CT). The
  // CSIP-AUS controller is comms-only and never adds a CT.
  const libbi2Qty = selections?.[7] || 0;
  for (let i = 0; i < libbi2Qty; i++) {
    comps.push({ label: "libbi controller", cts: 1, isBattery: true });
  }

  const validComps = comps;
  const totalCTs = validComps.reduce((s, c) => s + c.cts, 0);
  const solarBatCTs = validComps.filter(c => !c.isGrid).reduce((s, c) => s + c.cts, 0);
  const gridCTs = validComps.filter(c => c.isGrid).reduce((s, c) => s + c.cts, 0);

  const selProds = Object.entries(selections || {}).map(([id, qty]) => ({ ...PRODUCTS.find(p => p.id === parseInt(id)), qty })).filter(p => p?.name && p.qty > 0);
  const ctrlProd = selProds.find(p => p.id === controllerProductId);
  const master = ctrlProd || selProds.reduce((best, p) => !best || p.ctsSupported > best.ctsSupported ? p : best, null);
  const ctsSupported = master?.ctsSupported || 0;
  const ctsIncluded = selProds.reduce((s, p) => s + p.ctsIncluded * p.qty, 0);
  const additionalCTs = Math.max(0, totalCTs - ctsIncluded);

  let harvisNeeded = 0;
  if (is1ph) {
    harvisNeeded = Math.ceil(Math.max(0, totalCTs - ctsSupported) / 3);
  } else if (is2ph) {
    const sCTs = validComps.filter(c => c.isSolar).reduce((s, c) => s + c.cts, 0);
    harvisNeeded = 1 + (sCTs > 0 ? Math.ceil(sCTs / 3) : 0);
  } else {
    const sCTs = validComps.filter(c => c.isSolar).reduce((s, c) => s + c.cts, 0);
    const acBatCTs = validComps.filter(c => c.isBattery && !c.label.startsWith("DC")).reduce((s, c) => s + c.cts, 0);
    const dcCTs = validComps.filter(c => c.isBattery && c.label.startsWith("DC")).reduce((s, c) => s + c.cts, 0);
    harvisNeeded = (sCTs > 0 ? Math.ceil(sCTs / 3) : 0)
                 + (acBatCTs > 0 ? Math.ceil(acBatCTs / 3) : 0)
                 + (dcCTs > 0 ? Math.ceil(dcCTs / 3) : 0);
    if (ctsSupported < gridCTs) harvisNeeded += Math.ceil((gridCTs - ctsSupported) / 3);
  }

  const hasSolar = inverters.some(i => i.brand);
  const hasAcBat = batteries.some(b => {
    const found = AC_BATTERIES.find(x => x.id === parseInt(b.id));
    return found && (found.type === "AC Coupled" || found.type === "AC or DC" || found.id === 99);
  });

  return { validComps, totalCTs, gridCTs, solarBatCTs, harvisNeeded, ctsSupported, ctsIncluded, additionalCTs, selProds, master, is2ph, hasSolar, hasAcBat };
}

// ── Plain-English CT summary ──────────────────────────────────────────────────
export function generatePlainEnglish(result, ctConfig, effectiveWireless, cfg, harviTotal) {
  if (!result) return [];
  const { totalCTs, ctsIncluded, additionalCTs, harvisNeeded } = result;
  const lines = [];
  const ph = cfg.phase;

  if (totalCTs === 0) {
    lines.push("No CT clamps (sensors) are needed for this setup.");
    return lines;
  }

  const clampWord = n => `${n} CT clamp${n !== 1 ? "s" : ""}`;
  lines.push(`You'll need ${clampWord(totalCTs)} in total — these are clip-on sensors that measure electricity flow without interrupting your wiring.`);

  ctConfig.forEach(row => {
    if (row.component.includes("Grid")) {
      if (ph === "3ph") lines.push(`• ${clampWord(3)} go around your three-phase supply cables — one per phase.`);
      else if (ph === "2ph") lines.push(`• ${clampWord(2)} go around your two-phase supply cables.`);
      else lines.push(`• 1 CT clamp goes around your incoming electricity supply cable.`);
    } else if (row.component.includes("Solar") || row.component.includes("DC Hybrid")) {
      lines.push(`• 1 CT clamp goes around your solar generation cable.`);
    } else if (row.component.includes("Battery")) {
      lines.push(`• 1 CT clamp goes around your battery connection cable.`);
    }
  });

  if (harviTotal > 0) {
    lines.push(`A harvi wireless transmitter is needed to relay CT readings to your myenergi device — this happens automatically once paired.`);
  }

  if (additionalCTs > 0) {
    lines.push(`⚠ ${clampWord(additionalCTs)} will need to be purchased separately — they're not included with your selected devices.`);
  } else {
    lines.push(`✓ All required CT clamps are included with your selected device${result.selProds.length > 1 ? "s" : ""} — no extras to buy.`);
  }

  return lines;
}

// ── Shared UI components ─────────────────────────────────────────────────────
const SelBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ padding: "9px 20px", borderRadius: 999, cursor: "pointer", fontSize: 14, border: `1px solid ${active ? G : BORDER}`, background: active ? G : CARD, color: active ? "#000" : "#aaa", fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap", fontWeight: active ? 700 : 400 }}>{children}</button>
);
const SecLabel = ({ children }) => (
  <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{children}</div>
);
const NextBtn = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled} style={{ background: disabled ? BORDER : G, color: disabled ? MUTED : "#000", border: "none", borderRadius: 999, padding: "12px 30px", fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{children}</button>
);
const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ background: "none", border: `1px solid ${BORDER}`, color: "#aaa", borderRadius: 999, padding: "12px 26px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
);
const AddBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: `1px dashed ${BORDER}`, color: G_TXT, borderRadius: 999, padding: "11px 20px", fontSize: 14, cursor: "pointer", fontFamily: "inherit", width: "100%", marginTop: 8, justifyContent: "center" }}>
    <span style={{ fontSize: 20, lineHeight: 1, fontWeight: 300 }}>+</span> {children}
  </button>
);
const Checkbox = ({ checked, onChange, label, sub, color }) => {
  const col = color || G;
  const txtCol = color || G_TXT;
  return (
    <div style={{ padding: "12px 16px", background: CARD, border: `1px solid ${checked ? col : BORDER}`, borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }} onClick={onChange}>
      <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${checked ? col : "#555"}`, background: checked ? col : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        {checked && <span style={{ color: "#000", fontSize: 13, fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </div>
      <div>
        <div style={{ fontSize: 14, color: checked ? txtCol : "#ccc" }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
};

const selStyle = { background: CARD, border: `1px solid ${BORDER}`, color: "#ddd", borderRadius: 6, padding: "9px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" };
const th = { textAlign: "left", padding: "7px 10px", background: "#2a2a2a", color: "#ddd", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${BORDER}` };
const tdr = i => ({ padding: "8px 10px", background: i % 2 === 0 ? CARD : "#1a1a1a", borderBottom: `1px solid ${BORDER}`, fontSize: 13 });
const statBox = (label, val, col) => (
  <div style={{ flex: 1, padding: "14px 10px", background: CARD, borderRadius: 8, border: `1px solid ${BORDER}`, textAlign: "center" }}>
    <div style={{ fontSize: 32, fontWeight: 800, color: col }}>{val}</div>
    <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{label}</div>
  </div>
);

// ── InverterCard ─────────────────────────────────────────────────────────────
function InverterCard({ inv, phase, onChange, onRemove }) {
  const needsPhase = phase === "3ph" || phase === "2ph";
  const brandMeta = INVERTER_BRANDS.find(b => b.name === inv.brand);
  const isAcOnly = brandMeta?.acOnly || false;
  const coupledBat = inv.hasCoupledBat && inv.coupledBatId ? DC_BATTERIES.find(b => b.id === parseInt(inv.coupledBatId)) : null;
  const needsBatMode = coupledBat?.type === "AC or DC";

  const handleBrandChange = (brand) => {
    const meta = INVERTER_BRANDS.find(b => b.name === brand);
    const autoTick = meta?.allInOne || meta?.autoHybrid || false;
    const autoBatId = autoTick && meta?.autoBatId ? String(meta.autoBatId) : "";
    onChange({ ...inv, brand, hasCoupledBat: autoTick, coupledBatId: autoBatId, coupledBatMode: "" });
  };

  const handleHybridToggle = () => {
    const toggling = !inv.hasCoupledBat;
    // Auto-select the most likely battery for this inverter brand — no manual selection needed
    const autoBatId = toggling ? String(brandMeta?.autoBatId || 99) : "";
    onChange({ ...inv, hasCoupledBat: toggling, coupledBatId: autoBatId, coupledBatMode: "" });
  };

  return (
    <div style={{ background: CARD, border: `1px solid ${inv.brand ? G : BORDER}`, borderRadius: 8, padding: "14px 16px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: inv.brand ? G_TXT : MUTED, fontWeight: 600 }}>
          {inv.brand ? (inv.hasCoupledBat && coupledBat ? `${inv.brand} + ${coupledBat.label}` : inv.brand) : "Solar inverter"}
        </span>
        <button onClick={onRemove} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <SecLabel>Inverter Brand</SecLabel>
        <select value={inv.brand} onChange={e => handleBrandChange(e.target.value)} style={selStyle}>
          <option value="">Select brand…</option>
          {INVERTER_BRANDS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
        </select>
      </div>

      {needsPhase && inv.brand && (
        <div style={{ marginBottom: 10 }}>
          <SecLabel>Inverter Phase</SecLabel>
          <div style={{ display: "flex", gap: 8 }}>
            <SelBtn active={inv.phase === "1ph"} onClick={() => onChange({ ...inv, phase: "1ph" })}>1ph</SelBtn>
            <SelBtn active={inv.phase === "3ph"} onClick={() => onChange({ ...inv, phase: "3ph" })}>3ph</SelBtn>
          </div>
        </div>
      )}

      {inv.brand && !isAcOnly && (
        <div style={{ marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 12px", background: inv.hasCoupledBat ? "rgba(64,255,122,0.08)" : CARD, borderRadius: 6, border: `1px solid ${inv.hasCoupledBat ? G : BORDER}` }}
            onClick={handleHybridToggle}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${inv.hasCoupledBat ? G : "#666"}`, background: inv.hasCoupledBat ? G : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {inv.hasCoupledBat && <span style={{ color: "#000", fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
            </div>
            <div>
              <div style={{ fontSize: 13, color: inv.hasCoupledBat ? G_TXT : "#ccc" }}>This is a hybrid inverter with a coupled DC battery</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>Solar and battery share one inverter — only one CT required</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ── BatteryCard ──────────────────────────────────────────────────────────────
function BatteryCard({ bat, onChange, onRemove }) {
  const found = AC_BATTERIES.find(b => b.id === parseInt(bat.id));
  const needsMode = found?.type === "AC or DC";
  return (
    <div style={{ background: CARD, border: `1px solid ${bat.id ? G : BORDER}`, borderRadius: 8, padding: "14px 16px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: bat.id ? G_TXT : MUTED, fontWeight: 600 }}>{found?.label || "Battery"}</span>
        <button onClick={onRemove} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
      </div>
      <div>
        <SecLabel>Brand / Model</SecLabel>
        <select value={bat.id} onChange={e => {
          const sel = AC_BATTERIES.find(b => b.id === parseInt(e.target.value));
          const defaultMode = sel?.type === "AC or DC" ? "AC Coupled" : "";
          onChange({ ...bat, id: e.target.value, mode: defaultMode });
        }} style={selStyle}>
          <option value="">Select battery…</option>
          {AC_BATTERIES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      </div>
      {needsMode && (
        <div style={{ marginTop: 10 }}>
          <SecLabel>Installation Mode</SecLabel>
          <div style={{ display: "flex", gap: 8 }}>
            <SelBtn active={bat.mode === "AC Coupled"} onClick={() => onChange({ ...bat, mode: "AC Coupled" })}>AC Coupled</SelBtn>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: MUTED }}>For DC coupled installation, add this battery via the inverter card on the Your Property step.</div>
        </div>
      )}
    </div>
  );
}

// ── EddiApplianceSelector ─────────────────────────────────────────────────────
function EddiApplianceSelector({ unit, idx, onChange }) {
  return (
    <div style={{ marginTop: 10, padding: "10px 14px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, borderLeft: `3px solid ${G}` }}>
      <div style={{ fontSize: 12, color: G_TXT, fontWeight: 700, marginBottom: 8 }}>
        {unit} — appliances (unit {idx + 1})
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {["app1", "app2"].map((key, ai) => (
          <div key={key}>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Appliance {ai + 1} (optional)</div>
            <select
              value={onChange.data[key]}
              onChange={e => onChange.set(key, e.target.value)}
              style={{ ...selStyle, fontSize: 13 }}>
              {APPLIANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── myenergi App Preview ──────────────────────────────────────────────────────

const ICON_ORIGINS = {
  home:       [186, 201],
  grid:       [318, 275],
  solar:      [318, 427],
  genBattery: [318, 427],
  battery:    [186, 502],
  eddi:       [ 57, 276],
  zappi:      [ 57, 427],
};

const ICON_PATHS = {
  home: { d: "M185.507 184.012C185.64 183.909 185.802 183.85 185.97 183.844C186.158 183.837 186.343 183.896 186.491 184.012L193.999 189.869V187.801H198.799V193.616L204.891 198.369C204.974 198.434 205.044 198.514 205.096 198.606C205.147 198.697 205.181 198.798 205.194 198.902C205.207 199.007 205.199 199.112 205.171 199.214C205.143 199.315 205.095 199.41 205.031 199.493C204.966 199.576 204.886 199.645 204.794 199.697C204.703 199.749 204.602 199.782 204.498 199.795C204.393 199.808 204.287 199.8 204.186 199.772C204.085 199.744 203.99 199.697 203.907 199.632L202.799 198.768V219.801C202.799 220.013 202.715 220.216 202.565 220.366C202.415 220.516 202.211 220.601 201.999 220.601H190.926C190.839 220.615 190.751 220.615 190.665 220.601H181.326C181.239 220.615 181.151 220.615 181.065 220.601H169.999C169.787 220.601 169.584 220.516 169.434 220.366C169.284 220.216 169.199 220.013 169.199 219.801V198.768L168.091 199.632C167.924 199.762 167.712 199.821 167.501 199.795C167.29 199.769 167.099 199.66 166.968 199.493C166.837 199.325 166.779 199.113 166.805 198.902C166.831 198.692 166.94 198.5 167.107 198.369L185.507 184.012ZM201.199 197.519L185.999 185.658L170.799 197.519V219.001H176.399H180.399H181.999H189.999H191.599H197.199H201.199V197.519ZM197.199 189.401H195.599V191.118L197.199 192.368V189.401Z", fillRule: "evenodd" },
  grid:   { d: "M317.971 257.6C317.746 257.61 317.537 257.71 317.39 257.881L312.83 263.2H304.524C304.477 263.194 304.434 263.188 304.387 263.188C304.349 263.191 304.309 263.194 304.271 263.2H302.799C302.512 263.197 302.243 263.347 302.096 263.597C301.952 263.847 301.952 264.153 302.096 264.403C302.243 264.653 302.512 264.803 302.799 264.8H303.599V266.4C303.596 266.688 303.746 266.956 303.996 267.103C304.246 267.247 304.552 267.247 304.802 267.103C305.052 266.956 305.202 266.688 305.199 266.4V264.8H305.755L312.399 269.228V273.6H304.524C304.477 273.594 304.434 273.588 304.387 273.588C304.349 273.591 304.309 273.594 304.271 273.6H302.799C302.512 273.597 302.243 273.747 302.096 273.997C301.952 274.247 301.952 274.553 302.096 274.803C302.243 275.053 302.512 275.203 302.799 275.2H303.599V276.8C303.596 277.088 303.746 277.356 303.996 277.503C304.246 277.647 304.552 277.647 304.802 277.503C305.052 277.356 305.202 277.088 305.199 276.8V275.2H305.755L312.399 279.628V284.541L306.152 293.128C305.946 293.413 305.949 293.797 306.159 294.078C306.371 294.36 306.737 294.472 307.068 294.353L317.999 290.45L328.93 294.353C329.262 294.472 329.627 294.36 329.84 294.078C330.049 293.797 330.052 293.413 329.846 293.128L323.599 284.541V279.628L330.24 275.2H330.799V276.8C330.796 277.088 330.946 277.356 331.196 277.503C331.446 277.647 331.752 277.647 332.002 277.503C332.252 277.356 332.402 277.088 332.399 276.8V275.2H333.199C333.487 275.203 333.755 275.053 333.902 274.803C334.046 274.553 334.046 274.247 333.902 273.997C333.755 273.747 333.487 273.597 333.199 273.6H331.724C331.677 273.594 331.634 273.588 331.587 273.588C331.549 273.591 331.509 273.594 331.471 273.6H323.599V269.228L330.24 264.8H330.799V266.4C330.796 266.688 330.946 266.956 331.196 267.103C331.446 267.247 331.752 267.247 332.002 267.103C332.252 266.956 332.402 266.688 332.399 266.4V264.8H333.199C333.487 264.803 333.755 264.653 333.902 264.403C334.046 264.153 334.046 263.847 333.902 263.597C333.755 263.347 333.487 263.197 333.199 263.2H331.724C331.677 263.194 331.634 263.188 331.587 263.188C331.549 263.191 331.509 263.194 331.471 263.2H323.168L318.609 257.881C318.449 257.694 318.215 257.591 317.971 257.6ZM317.999 259.631L321.062 263.2H314.937L317.999 259.631ZM308.64 264.8H312.399V267.303L308.64 264.8ZM315.024 264.8H320.974L317.999 268.022L315.024 264.8ZM323.599 264.8H327.359L323.599 267.303V264.8ZM313.999 266.047L316.912 269.2L313.999 272.353V266.047ZM321.999 266.047V272.353L319.087 269.2L321.999 266.047ZM317.999 270.378L320.971 273.6H315.027L317.999 270.378ZM308.64 275.2H312.399V277.703L308.64 275.2ZM315.027 275.2H320.971L317.999 278.422L315.027 275.2ZM323.599 275.2H327.359L323.599 277.703V275.2ZM313.999 276.447L316.912 279.6L313.999 282.753V276.447ZM321.999 276.447V282.753L319.087 279.6L321.999 276.447ZM317.999 280.778L321.69 284.778L317.999 288.469L314.309 284.778L317.999 280.778ZM313.296 286.028L316.54 289.272L308.971 291.975L313.296 286.028ZM322.702 286.028L327.027 291.975L319.459 289.272L322.702 286.028Z" },
  solar:  { d: "M317.901 406.999C317.597 407.043 317.344 407.256 317.251 407.549C317.251 407.549 316.96 408.39 316.551 409.274C316.344 409.715 316.104 410.162 315.876 410.499C315.647 410.837 315.394 411.028 315.401 411.024C315.413 411.018 315.107 411.074 314.701 410.999C314.294 410.924 313.794 410.765 313.326 410.599C312.385 410.271 311.551 409.899 311.551 409.899C311.254 409.765 310.904 409.821 310.666 410.049C310.429 410.274 310.354 410.621 310.476 410.924C310.476 410.924 310.838 411.749 311.151 412.699C311.307 413.174 311.444 413.674 311.526 414.099C311.597 414.471 311.61 414.731 311.601 414.824C311.529 414.887 311.394 414.993 311.226 415.099C310.888 415.315 310.419 415.565 309.951 415.799C309.01 416.268 308.076 416.649 308.076 416.649C307.763 416.771 307.56 417.074 307.566 417.409C307.572 417.743 307.785 418.037 308.101 418.149C308.101 418.149 308.997 418.499 309.901 418.949C309.935 418.965 309.966 418.984 310.001 418.999H304.701C303.676 418.999 302.769 419.684 302.501 420.674L298.076 437.024C297.988 437.349 298.001 437.574 298.001 437.574C298.001 437.59 298.001 437.609 298.001 437.624V439.124C298.001 440.378 299.022 441.399 300.276 441.399H314.001V442.199H312.401C311.085 442.199 310.001 443.284 310.001 444.599V446.199C310.001 446.64 310.36 446.999 310.801 446.999H325.201C325.641 446.999 326.001 446.64 326.001 446.199V444.599C326.001 443.284 324.916 442.199 323.601 442.199H322.001V441.399H335.726C336.751 441.399 337.476 440.774 337.751 440.199C338.013 439.649 338.004 439.168 338.001 439.124C338.001 439.121 338.001 439.074 338.001 439.074V437.774C338.001 437.762 338.001 437.737 338.001 437.724C338.001 437.69 338.004 437.637 338.001 437.599C337.997 437.521 337.988 437.428 337.976 437.324C337.957 437.162 337.932 436.971 337.851 436.749L337.801 436.599L333.501 420.674C333.232 419.684 332.326 418.999 331.301 418.999H326.026C326.044 418.99 326.057 418.984 326.076 418.974C327.004 418.512 327.901 418.149 327.901 418.149C328.213 418.028 328.416 417.724 328.41 417.39C328.404 417.056 328.191 416.762 327.876 416.649C327.876 416.649 327.051 416.328 326.176 415.899C325.738 415.687 325.276 415.443 324.951 415.224C324.719 415.068 324.554 414.899 324.501 414.849C324.488 414.821 324.485 414.812 324.501 414.824C324.413 414.549 324.526 413.512 324.826 412.624C325.132 411.721 325.501 410.974 325.501 410.974C325.669 410.659 325.61 410.271 325.357 410.021C325.101 409.774 324.71 409.724 324.401 409.899C324.401 409.899 323.632 410.334 322.751 410.674C322.31 410.846 321.847 410.981 321.476 411.049C321.104 411.118 320.838 411.056 320.876 411.074C320.841 411.056 320.579 410.806 320.326 410.449C320.072 410.093 319.813 409.643 319.576 409.199C319.101 408.312 318.726 407.474 318.726 407.474C318.585 407.153 318.251 406.959 317.901 406.999ZM318.076 409.774C318.122 409.862 318.104 409.859 318.151 409.949C318.407 410.431 318.71 410.956 319.026 411.399C319.341 411.843 319.632 412.237 320.126 412.499C320.688 412.799 321.244 412.721 321.776 412.624C322.288 412.531 322.794 412.359 323.276 412.174C322.935 413.181 322.569 414.349 323.001 415.449C323.226 416.024 323.647 416.262 324.076 416.549C324.504 416.837 324.997 417.115 325.476 417.349C325.566 417.393 325.563 417.384 325.651 417.424C325.507 417.493 325.501 417.474 325.351 417.549C324.857 417.793 324.376 418.053 323.951 418.324C323.738 418.459 323.522 418.599 323.351 418.749C323.263 418.824 323.176 418.903 323.101 418.999H322.526C322.704 418.496 322.801 417.965 322.801 417.399C322.801 414.759 320.641 412.599 318.001 412.599C315.36 412.599 313.201 414.759 313.201 417.399C313.201 417.956 313.276 418.499 313.451 418.999H312.776C312.707 418.912 312.647 418.818 312.576 418.749C312.404 418.584 312.21 418.44 312.001 418.299C311.582 418.018 311.088 417.765 310.601 417.524C310.451 417.449 310.447 417.468 310.301 417.399C310.482 417.312 310.485 417.321 310.676 417.224C311.172 416.974 311.679 416.718 312.101 416.449C312.31 416.315 312.482 416.171 312.651 416.024C312.819 415.878 313.013 415.759 313.126 415.374C313.282 414.834 313.204 414.334 313.101 413.799C312.997 413.265 312.847 412.715 312.676 412.199C312.651 412.118 312.654 412.128 312.626 412.049C312.716 412.084 312.707 412.09 312.801 412.124C313.319 412.306 313.86 412.478 314.401 412.574C314.941 412.671 315.46 412.74 316.026 412.499C316.582 412.262 316.897 411.849 317.201 411.399C317.504 410.949 317.772 410.44 318.001 409.949C318.044 409.859 318.035 409.865 318.076 409.774ZM318.001 414.199C319.776 414.199 321.201 415.624 321.201 417.399C321.201 417.906 321.082 418.378 320.876 418.799C320.841 418.862 320.816 418.931 320.801 418.999H315.201C315.182 418.937 315.157 418.881 315.126 418.824C314.91 418.393 314.801 417.915 314.801 417.399C314.801 415.624 316.226 414.199 318.001 414.199ZM304.701 420.599H331.301C331.607 420.599 331.869 420.796 331.951 421.099L336.301 437.174C336.307 437.209 336.316 437.243 336.326 437.274C336.319 437.278 336.363 437.421 336.376 437.524C336.385 437.593 336.397 437.649 336.401 437.699C336.401 437.724 336.401 437.74 336.401 437.749C336.401 437.759 336.401 437.765 336.401 437.774V439.124C336.401 439.134 336.401 439.14 336.401 439.149C336.401 439.149 336.382 439.331 336.301 439.499C336.219 439.668 336.232 439.799 335.726 439.799H314.951C314.844 439.778 314.732 439.778 314.626 439.799H300.276C299.901 439.799 299.601 439.509 299.601 439.124V437.624C299.613 437.546 299.638 437.396 299.626 437.449L304.051 421.099C304.132 420.796 304.394 420.599 304.701 420.599ZM306.626 423.799H311.101L310.526 428.599H305.501L306.626 423.799ZM312.726 423.799H317.201V428.599H312.151L312.726 423.799ZM318.801 423.799H323.276L323.851 428.599H318.801V423.799ZM324.901 423.799H329.376L330.501 428.599H325.476L324.901 423.799ZM305.126 430.199H310.351L309.676 435.799H303.801L305.126 430.199ZM311.976 430.199H317.201V435.799H311.301L311.976 430.199ZM318.801 430.199H324.026L324.701 435.799H318.801V430.199ZM325.651 430.199H330.876L332.201 435.799H326.326L325.651 430.199ZM315.601 441.399H320.401V442.999C320.401 443.44 320.76 443.799 321.201 443.799H323.601C324.054 443.799 324.401 444.146 324.401 444.599V445.399H311.601V444.599C311.601 444.146 311.947 443.799 312.401 443.799H314.801C315.241 443.799 315.601 443.44 315.601 442.999V441.399Z" },
  battery:{ d: "M172.4 491.6C170.2 491.6 168.4 493.4 168.4 495.6V508.4C168.4 510.6 170.2 512.4 172.4 512.4H198C200.2 512.4 202 510.6 202 508.4V506H203.6C204.041 506 204.4 505.64 204.4 505.2V498.8C204.4 498.359 204.041 498 203.6 498H202V495.6C202 493.4 200.2 491.6 198 491.6H172.4ZM172.4 493.2H198C199.335 493.2 200.4 494.265 200.4 495.6V498.8C200.4 499.24 200.76 499.6 201.2 499.6H202.8V504.4H201.2C200.76 504.4 200.4 504.759 200.4 505.2V508.4C200.4 509.734 199.335 510.8 198 510.8H172.4C171.066 510.8 170 509.734 170 508.4V495.6C170 494.265 171.066 493.2 172.4 493.2ZM186 498.8L177.2 502.8L184.4 502V505.2L193.2 501.2L186 502V498.8Z" },
  eddi:   { d: "M47.0004 259.199C46.5588 259.199 46.1746 259.461 45.9504 259.774L44.7035 261.44L44.7645 261.368C44.26 261.897 44.2004 262.487 44.2004 263.04V267.199V283.999V288.959C44.2004 289.511 44.3537 290.071 44.6926 290.545L44.6973 290.551L45.9504 292.224C46.1746 292.538 46.5588 292.799 47.0004 292.799C47.442 292.799 47.8262 292.538 48.0504 292.224L49.3035 290.551L49.3082 290.545C49.647 290.071 49.8004 289.486 49.8004 288.879V263.04C49.8004 262.487 49.6471 261.928 49.3082 261.454L49.3035 261.448L48.0504 259.774C47.8262 259.461 47.442 259.199 47.0004 259.199ZM44.2004 283.999C44.2004 282.683 43.1164 281.599 41.8004 281.599C40.4844 281.599 39.4004 282.683 39.4004 283.999C39.4004 285.315 40.4844 286.399 41.8004 286.399C43.1164 286.399 44.2004 285.315 44.2004 283.999ZM44.2004 267.199C44.2004 265.883 43.1164 264.799 41.8004 264.799C40.4844 264.799 39.4004 265.883 39.4004 267.199C39.4004 268.515 40.4844 269.599 41.8004 269.599C43.1164 269.599 44.2004 268.515 44.2004 267.199ZM55.0004 259.199C54.5588 259.199 54.1746 259.461 53.9504 259.774L52.7035 261.44L52.7645 261.368C52.26 261.897 52.2004 262.487 52.2004 263.04V264.799H50.6004V266.399H52.2004V267.999H50.6004V269.599H52.2004V281.599H50.6004V283.199H52.2004V284.799H50.6004V286.399H52.2004V288.959C52.2004 289.511 52.3537 290.071 52.6926 290.545L52.6973 290.551L53.9504 292.224C54.1746 292.538 54.5588 292.799 55.0004 292.799C55.442 292.799 55.8262 292.538 56.0504 292.224L57.3035 290.551L57.3082 290.545C57.647 290.071 57.8004 289.486 57.8004 288.879V263.04C57.8004 262.487 57.6471 261.928 57.3082 261.454L57.3035 261.448L56.0504 259.774C55.8262 259.461 55.442 259.199 55.0004 259.199ZM63.0004 259.199C62.5588 259.199 62.1746 259.461 61.9504 259.774L60.7035 261.44L60.7645 261.368C60.26 261.897 60.2004 262.487 60.2004 263.04V264.799H58.6004V266.399H60.2004V267.999H58.6004V269.599H60.2004V281.599H58.6004V283.199H60.2004V284.799H58.6004V286.399H60.2004V288.959C60.2004 289.511 60.3537 290.071 60.6926 290.545L60.6973 290.551L61.9504 292.224C62.1746 292.538 62.5588 292.799 63.0004 292.799C63.442 292.799 63.8262 292.538 64.0504 292.224L65.3035 290.551L65.3082 290.545C65.647 290.071 65.8004 289.486 65.8004 288.879V263.04C65.8004 262.487 65.6471 261.928 65.3082 261.454L65.3035 261.448L64.0504 259.774C63.8262 259.461 63.442 259.199 63.0004 259.199ZM71.0004 259.199C70.5588 259.199 70.1746 259.461 69.9504 259.774L68.7035 261.44L68.7645 261.368C68.26 261.897 68.2004 262.487 68.2004 263.04V264.799H66.6004V266.399H68.2004V267.999H66.6004V269.599H68.2004V281.599H66.6004V283.199H68.2004V284.799H66.6004V286.399H68.2004V288.959C68.2004 289.511 68.3537 290.071 68.6926 290.545L68.6973 290.551L69.9504 292.224C70.1746 292.538 70.5588 292.799 71.0004 292.799C71.442 292.799 71.8262 292.538 72.0504 292.224L73.3035 290.551L73.3082 290.545C73.647 290.071 73.8004 289.486 73.8004 288.879V263.04C73.8004 262.487 73.6471 261.928 73.3082 261.454L73.3035 261.448L72.0504 259.774C71.8262 259.461 71.442 259.199 71.0004 259.199Z" },
  zappi:  { d: "M68.0406 410.199C67.4273 410.199 66.8161 410.452 66.3547 410.913L63.875 413.393C63.6207 413.647 63.4 414.102 63.4 414.52V414.999H47.4C41.6836 414.999 37 419.683 37 425.399V434.199C37 435.516 38.0836 436.599 39.4 436.599H40.2V438.199C40.2 439.515 41.284 440.599 42.6 440.599H43.5719C44.0979 442.44 45.7957 443.799 47.8 443.799C49.8043 443.799 51.5021 442.44 52.0281 440.599H64.3719C64.8979 442.44 66.5957 443.799 68.6 443.799C70.6043 443.799 72.3021 442.44 72.8281 440.599H74.6C75.916 440.599 77 439.515 77 438.199V434.338C77 432.584 75.7216 431.075 73.9906 430.787L74.0266 430.793L67.8703 429.482L65.0078 425.474C64.2579 424.423 63.0437 423.799 61.7531 423.799H51.0359C50.0032 423.799 49.0313 424.298 48.4312 425.138L45.3312 429.48L43.2375 429.916H43.2359C41.2372 430.333 40.2 432.02 40.2 433.693V434.999H39.4C38.9564 434.999 38.6 434.643 38.6 434.199V425.399C38.6 420.556 42.5564 416.599 47.4 416.599H63.4V417.079C63.4 417.497 63.6207 417.951 63.875 418.205L66.3547 420.685C66.8161 421.147 67.4273 421.399 68.0406 421.399H71.4C71.8178 421.399 72.2437 421.246 72.5453 420.945C72.8469 420.643 73 420.217 73 419.799H77V418.199H73V413.399H77V411.799H73C73 411.381 72.8469 410.956 72.5453 410.654C72.2437 410.352 71.8178 410.199 71.4 410.199H68.0406ZM68.0406 411.799H71.4V419.799H68.0406C67.854 419.799 67.6645 419.732 67.4859 419.554L65.0063 417.074C65.0025 417.07 65.003 417.072 65 417.07V414.529C65.003 414.526 65.0025 414.528 65.0063 414.524L67.4859 412.045C67.6645 411.866 67.854 411.799 68.0406 411.799ZM51.0359 425.399H55.4V429.399H47.3531L49.7328 426.07C50.0335 425.649 50.5183 425.399 51.0359 425.399ZM57 425.399H61.7531C62.5281 425.399 63.2562 425.773 63.7063 426.404L65.8453 429.399H57V425.399ZM45.8797 430.999H67.3188L73.7109 432.362L73.7281 432.365C74.6979 432.526 75.4 433.355 75.4 434.338V438.199C75.4 438.651 75.052 438.999 74.6 438.999H72.9797C72.7758 436.765 70.8856 434.999 68.6 434.999C66.3144 434.999 64.4242 436.765 64.2203 438.999H52.1797C51.9758 436.765 50.0856 434.999 47.8 434.999C45.5144 434.999 43.6242 436.765 43.4203 438.999H42.6C42.148 438.999 41.8 438.651 41.8 438.199V433.693C41.8 432.58 42.2249 431.762 43.5625 431.482L45.8797 430.999ZM47.8 436.599C49.3559 436.599 50.6 437.843 50.6 439.399C50.6 440.955 49.3559 442.199 47.8 442.199C46.2441 442.199 45 440.955 45 439.399C45 437.843 46.2441 436.599 47.8 436.599ZM68.6 436.599C70.1559 436.599 71.4 437.843 71.4 439.399C71.4 440.955 70.1559 442.199 68.6 442.199C67.0441 442.199 65.8 440.955 65.8 439.399C65.8 437.843 67.0441 436.599 68.6 436.599Z" },
};

function AppPreview({ cfg, result, monitorSolar = true, monitorBattery = true, zappiSinglePhase = false }) {
  const [now, setNow] = useState(() => new Date());
  const [mode, setMode] = useState('ECO');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sels = cfg.selections || {};
  const hasLibbi = (sels[6] || 0) > 0;
  const solarInverters = !cfg.noSolar ? (cfg.inverters || []) : [];
  const hybridInverters = solarInverters.filter(i => i.hasCoupledBat);
  const soloInverters   = solarInverters.filter(i => !i.hasCoupledBat);
  const hasGenBat       = monitorSolar && hybridInverters.length > 0;
  const hasSolarOnly    = monitorSolar && soloInverters.length > 0;
  const hasSolarNode    = hasGenBat || hasSolarOnly;
  const hasStandaloneBat = hasLibbi || (cfg.batteries || []).length > 0;
  const showBatteryNode  = monitorBattery && hasStandaloneBat;

  const numZappis = (sels[2] || 0) + (sels[3] || 0);
  const numEddis  = (sels[4] || 0) + (sels[5] || 0);

  // Solar generation curve — peaks at 13:00, zero before 6 or after 20
  // Calculated from inverter existence, regardless of monitoring (monitoring only hides the node)
  const hasSolarInverters = solarInverters.length > 0;
  const peakSolar = cfg.phase === '3ph' ? 10 : 6.6;
  const hr = now.getHours() + now.getMinutes() / 60;
  const rawSolar = (hr >= 6 && hr <= 20) ? peakSolar * Math.sin(Math.PI * (hr - 6) / 14) : 0;
  const effectiveSolar = hasSolarInverters ? Math.round(Math.max(0, rawSolar) * 10) / 10 : 0;

  const houseKw  = 0.4;
  const zappiMax = (cfg.phase === '3ph' && !zappiSinglePhase) ? 11 : 7.2;

  // Power flow calculations per mode
  let zappiKwEach = 0, eddiKwEach = 0, gridKw = 0, gridExport = 0, zappiPaused = false;
  const r1 = v => Math.round(v * 10) / 10;

  if (mode === 'STOP') {
    // All myenergi devices stopped — surplus solar exports to grid
    const surplus = r1(effectiveSolar - houseKw);
    gridExport = Math.max(0, surplus);
    gridKw     = Math.max(0, r1(houseKw - effectiveSolar));
  } else if (mode === 'FAST' || mode === 'BOOST') {
    zappiKwEach = numZappis > 0 ? zappiMax : 0;
    eddiKwEach  = mode === 'BOOST' && numEddis > 0 ? 3.6 : 0;
    const totalLoad = houseKw + zappiKwEach * numZappis + eddiKwEach * numEddis;
    gridKw = Math.max(0, r1(totalLoad - effectiveSolar));
  } else {
    // ECO / ECO+: eddi gets surplus priority (up to 3.6 kW each), zappi gets remainder
    const available = r1(effectiveSolar - houseKw);
    eddiKwEach = numEddis > 0 && available > 0
      ? Math.min(r1(available / numEddis), 3.6) : 0;
    const afterEddi = r1(Math.max(0, available - eddiKwEach * numEddis));
    const availPerZappi = numZappis > 0 ? afterEddi / numZappis : 0;

    if (mode === 'ECO+') {
      zappiKwEach = numZappis > 0 ? Math.max(0, r1(availPerZappi)) : 0;
      zappiPaused = numZappis > 0 && zappiKwEach < 1.4;
      gridExport  = Math.max(0, r1(afterEddi - zappiKwEach * numZappis));
    } else {
      // ECO: minimum 1.4 kW per zappi, grid supplements shortfall
      if (numZappis === 0 || availPerZappi >= 1.4) {
        zappiKwEach = numZappis > 0 ? Math.max(0, r1(availPerZappi)) : 0;
        gridExport  = Math.max(0, r1(afterEddi - zappiKwEach * numZappis));
      } else {
        zappiKwEach = 1.4;
        gridKw = Math.max(0, r1(houseKw + zappiKwEach * numZappis + eddiKwEach * numEddis - effectiveSolar));
      }
    }
  }

  // Final energy balance — ensure grid covers any load not already met by solar
  const totalLoad = r1(houseKw + zappiKwEach * numZappis + eddiKwEach * numEddis);
  gridKw = Math.max(gridKw, Math.max(0, r1(totalLoad - effectiveSolar)));

  // Green percentage — 0% if no solar or solar unmonitored
  const greenPct = (!hasSolarInverters || !monitorSolar) ? 0
    : gridKw === 0 ? 100
    : totalLoad > 0 ? Math.round(Math.max(0, (totalLoad - gridKw) / totalLoad * 100)) : 0;

  const fmtKw = kw => {
    if (kw === 0) return '0 kW';
    const v = Math.round(kw * 10) / 10;
    return Number.isInteger(v) ? `${v} kW` : `${v.toFixed(1)} kW`;
  };

  // Arrow animation duration — slow (<1 kW) to fast (>5 kW)
  const arrowDur = kw => {
    if (kw <= 0) return 99;
    if (kw >= 5) return 1.0;
    if (kw < 1)  return 3.5;
    return r1(3.5 - ((kw - 1) / 4) * 2.5);
  };

  const gridExporting = gridExport > 0 && gridKw === 0;

  // Build nodes
  const nodes = [];
  nodes.push({ type: 'home',    color: '#F91CDF', flow: 'out', kw: houseKw });
  nodes.push({ type: 'grid',    color: '#FF4400', flow: gridExporting ? 'out' : 'in', kw: gridExporting ? gridExport : gridKw });
  if (hasGenBat)       nodes.push({ type: 'genBattery', color: '#55FF00', flow: 'in',  kw: effectiveSolar });
  if (hasSolarOnly)    nodes.push({ type: 'solar',      color: '#55FF00', flow: 'in',  kw: effectiveSolar });
  if (showBatteryNode) nodes.push({ type: 'battery',    color: '#FF9234', flow: 'out', kw: 0 });
  const stopped = mode === 'STOP';
  for (let i = 0; i < (sels[2] || 0); i++) nodes.push({ type: 'zappi', color: '#0086FF', flow: 'out', kw: zappiKwEach, paused: zappiPaused, stopped });
  for (let i = 0; i < (sels[3] || 0); i++) nodes.push({ type: 'zappi', color: '#0086FF', flow: 'out', kw: zappiKwEach, paused: zappiPaused, stopped });
  for (let i = 0; i < (sels[4] || 0); i++) nodes.push({ type: 'eddi',  color: '#00E6C0', flow: 'out', kw: eddiKwEach, stopped });
  for (let i = 0; i < (sels[5] || 0); i++) nodes.push({ type: 'eddi',  color: '#00E6C0', flow: 'out', kw: eddiKwEach, stopped });

  const HX = 187, HY = 352, R = 125;
  const placed = nodes.map((nd, i) => {
    const rad = (i * 2 * Math.PI) / nodes.length;
    return { ...nd, cx: HX + R * Math.sin(rad), cy: HY - R * Math.cos(rad) };
  });

  // kW label: directly above circle if node is above centre, below if at/below centre
  const kwPos = nd => nd.cy <= HY
    ? { x: nd.cx, y: nd.cy - 46, anchor: 'middle' }
    : { x: nd.cx, y: nd.cy + 56, anchor: 'middle' };

  const MODE_COLORS = {
    'ECO':   { bg: '#FFCC00', fg: '#000' },
    'ECO+':  { bg: '#40ff7a', fg: '#000' },
    'FAST':  { bg: '#0086FF', fg: '#fff' },
    'BOOST': { bg: '#0086FF', fg: '#fff' },
    'STOP':  { bg: '#FF008C', fg: '#fff' },
  };
  const MODE_DESC = {
    'ECO':   "Charges using surplus solar — tops up from the grid when there isn't enough generation. Charging starts as soon as the EV is plugged in.",
    'ECO+':  "Charges only when surplus solar is sufficient — pauses automatically when generation drops, and resumes when it recovers. Avoids any grid import.",
    'FAST':  "Charges at full speed using grid power, up to 7.4 kW (1ph) or 22 kW (3ph) — limited only by the EV's onboard charger or any configured device/grid limits.",
    'BOOST': "Forces maximum power immediately, overriding ECO/ECO+ — zappi charges the EV at full speed and eddi diverts power to the connected appliance at maximum rate. Boosts can be triggered manually or set to a schedule.",
    'STOP':  "Stops all myenergi devices — surplus solar exports to the grid rather than being used for charging or heating.",
  };

  return (
    <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg viewBox="0 0 375 667" style={{ width: 210, display: "block", borderRadius: 12 }}>
        {/* background */}
        <rect width="375" height="667" fill="#1a1a1a"/>

        {/* status bar */}
        <rect width="375" height="44" fill="#111"/>
        <text x="20" y="28" fontSize="13" fill="#fff">{time}</text>
        <text x="355" y="28" fontSize="13" fill="#fff" textAnchor="end">●●●</text>

        {/* header */}
        <text x="20" y="78" fontSize="18" fontWeight="700" fill="#fff">My family home</text>

        {/* animation motion paths */}
        <defs>
          {placed.map((nd, i) => {
            const [x1, y1] = nd.flow === 'in' ? [nd.cx, nd.cy] : [HX, HY];
            const [x2, y2] = nd.flow === 'in' ? [HX, HY]       : [nd.cx, nd.cy];
            return <path key={i} id={`ap-${i}`} d={`M${x1},${y1} L${x2},${y2}`}/>;
          })}
        </defs>

        {/* spokes */}
        {placed.map((nd, i) => (
          <line key={i} x1={HX} y1={HY} x2={nd.cx} y2={nd.cy}
            stroke="white" strokeOpacity="0.15" strokeWidth="3"/>
        ))}

        {/* animated flow arrows — speed scales with kW */}
        {placed.map((nd, i) => {
          const durNum = arrowDur(nd.kw);
          const dur = `${durNum}s`;
          const hide = nd.kw <= 0;
          return (
            <g key={i}>
              {[0, durNum / 2].map(delay => (
                <polygon key={delay} points="5,0 -4,-4 -4,4" fill={nd.color} opacity="0">
                  <animateMotion dur={dur} begin={`${delay}s`} repeatCount="indefinite" rotate="auto">
                    <mpath href={`#ap-${i}`}/>
                  </animateMotion>
                  <animate attributeName="opacity" dur={dur} begin={`${delay}s`}
                    repeatCount="indefinite"
                    values={hide ? "0;0;0;0" : "0;0.9;0.9;0"} keyTimes="0;0.05;0.9;1"/>
                </polygon>
              ))}
            </g>
          );
        })}

        {/* hub */}
        <circle cx={HX} cy={HY} r="41" fill="#2D2D2D" stroke="#2D2D2D" strokeWidth="2"/>
        <path d="M174 329.045C174.282 330.573 174.524 332.07 174.838 333.552C175.775 337.973 177.012 342.304 179.207 346.283C180.013 347.744 180.952 349.172 182.047 350.424C185.264 354.102 189.254 354.914 193.731 352.944C194.443 352.631 195.133 352.258 195.915 351.862L198.846 354.793C199.11 355.057 199.538 355.057 199.802 354.793C200.066 354.529 200.066 354.101 199.802 353.836L196.871 350.905C198.616 347.9 199.792 344.888 198.708 341.437C198.026 339.265 196.571 337.643 194.817 336.271C192.101 334.147 188.985 332.794 185.752 331.691C182.043 330.425 178.225 329.602 174.355 329.013C174.274 329.001 174.188 329.027 174 329.045ZM180.955 338.352C180.978 337.837 181.436 337.872 181.819 337.877C182.167 337.881 182.515 337.878 182.924 337.878C182.924 337.399 182.867 336.973 182.944 336.573C182.991 336.326 183.21 335.965 183.407 335.924C183.792 335.844 183.945 336.202 183.879 336.537C183.632 337.806 184.245 338.639 185.14 339.434C186.061 340.252 186.738 341.19 187.6 342.075C187.663 342.054 187.644 342.032 187.644 342.011C187.644 341.744 187.644 341.477 187.644 341.21C187.644 340.413 187.778 339.617 187.793 338.82C187.8 338.448 187.734 337.909 188.331 337.904C188.898 337.899 188.868 338.404 188.868 338.802C188.868 340.063 188.858 341.325 188.904 342.585C188.916 342.915 189.088 343.309 189.314 343.55C190.426 344.74 191.591 345.887 192.731 347.049C192.784 347.024 192.902 346.998 192.902 346.972C192.902 345.679 192.902 344.385 192.902 343.092C192.902 342.893 192.829 342.662 192.908 342.502C193.026 342.265 193.235 342.077 193.411 341.869C193.557 342.079 193.826 342.286 193.83 342.498C193.866 344.157 193.868 345.817 193.841 347.476C193.834 347.937 193.976 348.258 194.303 348.575C195.099 349.347 195.864 350.154 196.686 350.996L196.04 351.642C195.074 350.693 194.185 349.804 193.27 348.945C193.137 348.82 192.861 348.814 192.651 348.812C191.013 348.802 189.376 348.808 187.739 348.805C187.388 348.805 186.944 348.86 186.93 348.36C186.916 347.835 187.351 347.835 187.745 347.836C189.16 347.84 190.575 347.838 192.106 347.838C191.933 347.629 191.828 347.481 191.702 347.355C190.656 346.304 189.62 345.243 188.547 344.221C188.337 344.021 187.984 343.878 187.693 343.87C186.389 343.833 185.083 343.851 183.777 343.855C183.386 343.857 182.947 343.867 182.946 343.346C182.944 342.841 183.385 342.889 183.739 342.889C184.837 342.887 185.935 342.888 187.033 342.888C187.078 342.824 187.123 342.76 187.168 342.696C186.844 342.414 186.506 342.145 186.199 341.846C185.47 341.135 184.707 340.451 184.051 339.677C183.48 339.004 182.839 338.702 181.978 338.842C181.913 338.853 181.845 338.844 181.779 338.844C181.404 338.842 180.931 338.902 180.955 338.352Z" fill="#84FF00"/>
        <text x={HX} y={HY + 24} textAnchor="middle" fontSize="13" fontWeight="700" fill="#84FF00">{greenPct}%</text>

        {/* nodes — dynamic radial layout */}
        {placed.map((nd, i) => {
          const iconType = nd.type === 'genBattery' ? 'solar' : nd.type;
          const [ox, oy] = ICON_ORIGINS[iconType] || [187, 352];
          const dx = nd.cx - ox, dy = nd.cy - oy;
          const kp = kwPos(nd);
          const icon = ICON_PATHS[iconType];
          return (
            <g key={i}>
              <circle cx={nd.cx} cy={nd.cy} r="31" fill="#303030" stroke={nd.color} strokeWidth="2"/>
              <g transform={`translate(${dx},${dy})`}>
                <path d={icon.d} fill="white"
                  fillRule={icon.fillRule || "nonzero"}
                  clipRule={icon.fillRule || "nonzero"}/>
              </g>
              {nd.type === 'genBattery' && (
                <g>
                  <circle cx={nd.cx + 13} cy={nd.cy + 13} r="9" fill="#303030"/>
                  <rect x={nd.cx + 7} y={nd.cy + 10} width={12} height={6} rx={1} fill="none" stroke="white" strokeWidth={1.2}/>
                  <rect x={nd.cx + 19} y={nd.cy + 12} width={2} height={2} rx={0.5} fill="white"/>
                  <rect x={nd.cx + 8.5} y={nd.cy + 11.5} width={4} height={3} fill="white"/>
                </g>
              )}
              {nd.paused && !nd.stopped && (
                <g>
                  <circle cx={nd.cx + 22} cy={nd.cy - 22} r="9" fill="#222" stroke={nd.color} strokeWidth="1.5"/>
                  <rect x={nd.cx + 17} y={nd.cy - 26} width={4} height={8} rx={1} fill="white"/>
                  <rect x={nd.cx + 23} y={nd.cy - 26} width={4} height={8} rx={1} fill="white"/>
                </g>
              )}
              {nd.stopped && (
                <g>
                  <circle cx={nd.cx + 22} cy={nd.cy - 22} r="9" fill="#000000" stroke="white" strokeWidth="1"/>
                  <rect x={nd.cx + 17.5} y={nd.cy - 26.5} width={9} height={9} rx={1.5} fill="white"/>
                </g>
              )}
              {nd.type === 'home' && (
                <g transform={`rotate(90, ${nd.cx}, ${nd.cy})`} opacity="1">
                  {/* Colon dots — positioned left in pre-rotation = eyes above smile on screen */}
                  {/* cx+8 shifts whole smiley 25% down on screen; ±6.25 = 25% wider dot spacing */}
                  <circle cx={nd.cx} cy={nd.cy - 3.84} r={1.76} fill="white"/>
                  <circle cx={nd.cx} cy={nd.cy + 3.84} r={1.76} fill="white"/>
                  {/* ) smile — same pre-rotation y as dot midpoint = horizontally centred on screen */}
                  <text
                    x={nd.cx + 14} y={nd.cy}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize="13" fontWeight="700"
                    fill="white" fontFamily="Overpass, sans-serif"
                  >)</text>
                </g>
              )}
              <text x={kp.x} y={kp.y} textAnchor="middle" fontSize="22" fontWeight="700" fill={nd.color}>
                {fmtKw(nd.kw)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Mode buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Object.entries(MODE_COLORS).map(([m, { bg, fg }]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            background: mode === m ? bg : '#232323',
            color: mode === m ? fg : '#777',
            border: `1px solid ${mode === m ? bg : '#3a3a3a'}`,
            borderRadius: 999,
            padding: '8px 14px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.06em',
            minWidth: 56,
          }}>
            {m}
          </button>
        ))}
      </div>
    </div>

    {/* Mode description */}
    {MODE_DESC[mode] && (
      <p style={{ margin: '8px 0 0', fontSize: 12, color: '#aaa', lineHeight: 1.5, maxWidth: 520 }}>
        {MODE_DESC[mode]}
      </p>
    )}
    </>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState({
    phase: null, inverters: [], batteries: [], selections: {},
    eddiAppliances: {},   // { "4": [{app1:"",app2:""}, ...], "5": [...] }
  });
  const [wireless, setWireless] = useState(false);
  const [zappiSinglePhase, setZappiSinglePhase] = useState(false);
  const [monitorSolar, setMonitorSolar] = useState(true);
  const [monitorBattery, setMonitorBattery] = useState(true);
  const [controllerProductId, setControllerProductId] = useState(2);
  const [mainSwitchSplit, setMainSwitchSplit] = useState(false);
  const [csipRequired, setCsipRequired] = useState(false);
  const [notes, setNotes] = useState("");

  // GLO defaults to the simple case — no solar monitoring, hard-wired CTs —
  // rather than inheriting the global monitorSolar/wireless defaults meant
  // for zappi. Only resets on the transition to GLO, so a manual override
  // afterward sticks until the controller changes again.
  useEffect(() => {
    if (controllerProductId === 3) { setMonitorSolar(false); setWireless(false); }
  }, [controllerProductId]);

  const setPhase = v => setCfg(c => ({ ...c, phase: v }));
  const setInverters = fn => setCfg(c => ({ ...c, inverters: fn(c.inverters) }));
  const setBatteries = fn => setCfg(c => {
    const next = fn(c.batteries);
    const hasLibbi = next.some(b => parseInt(b.id) === 14);
    const hadLibbi = c.batteries.some(b => parseInt(b.id) === 14);
    let sel = { ...c.selections };
    if (hasLibbi && !hadLibbi && !sel[6]) sel[6] = 1;
    if (!hasLibbi && hadLibbi) sel[6] = 0;
    return { ...c, batteries: next, selections: sel };
  });

  const setEddiAppliance = (prodId, idx, key, val) => {
    setCfg(c => {
      const arr = [...(c.eddiAppliances[prodId] || [])];
      arr[idx] = { ...(arr[idx] || { app1: "", app2: "" }), [key]: val };
      return { ...c, eddiAppliances: { ...c.eddiAppliances, [prodId]: arr } };
    });
  };

  const resultsRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'sb-print-styles';
    style.textContent = `
      @page { size: A4 portrait; margin: 8mm; }
      @media print {
        #step-tabs { display: none !important; }
        .no-print  { display: none !important; }
        .notes-textarea { display: none !important; }
        .notes-print { display: block !important; }
        #results-page { zoom: 0.72; }
        html { height: 99%; }
        #sb-app {
          background: white !important;
          color: black !important;
          max-width: none !important;
          padding: 0 16px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.getElementById('sb-print-styles')?.remove();
  }, []);

  const exportPDF = () => {
    const prev = document.title;
    document.title = 'myenergi system design';
    window.print();
    document.title = prev;
  };

  const result = useMemo(() => calcResults(cfg, monitorSolar, monitorBattery, controllerProductId), [cfg, monitorSolar, monitorBattery, controllerProductId]);
  const ctrlProdData = PRODUCTS.find(p => p.id === controllerProductId);
  const ctrlForcesWireless = cfg.phase === "1ph" && !!(ctrlProdData && result && ctrlProdData.ctsSupported < result.totalCTs);
  const effectiveWireless = wireless || ctrlForcesWireless;

  const STEPS = ["Your Property", "myenergi Devices", "Your Requirements"];
  const step0ok = !!cfg.phase;
  const step1ok = Object.values(cfg.selections).some(q => q > 0);

  const ctConfig = useMemo(() => {
    if (!result) return [];
    const { validComps, ctsSupported } = result;
    const is3ph = cfg.phase === "3ph", is2ph = cfg.phase === "2ph", is1ph = cfg.phase === "1ph";
    const needsGridHarvi = is2ph || (is3ph && ctsSupported < 3) || (effectiveWireless && is1ph) || (is3ph && zappiSinglePhase);
    const rows = [];
    const acBatComps = validComps.filter(c => c.isBattery && !c.label.startsWith("DC"));
    const otherComps = validComps.filter(c => !c.isBattery || c.label.startsWith("DC"));

    otherComps.forEach(comp => {
      let input, routing, note = null;
      if (comp.isGrid) {
        if (needsGridHarvi) { input = is3ph ? "harvi — all 3 phases" : is2ph ? "harvi — both phases" : "harvi — CT1"; routing = "harvi"; }
        else if (is3ph) { input = "CT1, CT2, CT3 (one per phase)"; routing = "device"; }
        else { input = "CT1"; routing = "device"; }
      } else if (comp.isSolar) {
        if (effectiveWireless || is3ph || is2ph) { input = effectiveWireless && is1ph ? "harvi — CT2" : "harvi — pair wirelessly"; routing = "harvi"; }
        else { input = "CT2"; routing = "device"; }
      } else {
        if (effectiveWireless || is3ph || is2ph) { input = "harvi — pair wirelessly"; routing = "harvi"; }
        else { input = "CT3"; routing = "device"; }
      }
      rows.push({ component: comp.label, type: comp.isGrid ? "Grid" : comp.isSolar ? "Generation Only" : "Gen & Battery", input, routing, note, cts: comp.cts });
    });

    if (acBatComps.length > 0) {
      const totalAcCTs = acBatComps.reduce((s, c) => s + c.cts, 0);
      const label = acBatComps.length === 1 ? acBatComps[0].label : `AC Batteries (${acBatComps.length} units)`;
      let input, routing;
      if (effectiveWireless || is3ph || is2ph) { input = `harvi — pair wirelessly (${totalAcCTs} CT${totalAcCTs > 1 ? "s" : ""} share 1 harvi)`; routing = "harvi"; }
      else { input = "CT3"; routing = "device"; }
      rows.push({ component: label, type: "AC Battery", input, routing, note: acBatComps.length > 1 ? `${acBatComps.length} AC batteries share one harvi — connect each CT to available inputs on the same harvi unit.` : null, cts: totalAcCTs });
    }
    return rows;
  }, [result, cfg, effectiveWireless, zappiSinglePhase, monitorSolar, monitorBattery]);

  const incr = id => {
    const tot = Object.values(cfg.selections).reduce((s,q)=>s+q,0);
    if (tot >= 5) return;
    setCfg(c => {
      const newSel = { ...c.selections, [id]: (c.selections[id]||0)+1 };
      const newAppl = { ...c.eddiAppliances };
      // Track appliances for eddi (id=4) and eddi+ (id=5)
      if (id === 4 || id === 5) {
        const key = String(id);
        newAppl[key] = [...(newAppl[key]||[]), { app1: "", app2: "" }];
      }
      return { ...c, selections: newSel, eddiAppliances: newAppl };
    });
    if (!(cfg.selections[controllerProductId] > 0)) setControllerProductId(id);
  };

  const decr = id => {
    const newQty = Math.max(0, (cfg.selections[id]||0)-1);
    setCfg(c => {
      const newAppl = { ...c.eddiAppliances };
      if ((id === 4 || id === 5) && newQty < (c.eddiAppliances[String(id)]||[]).length) {
        newAppl[String(id)] = (newAppl[String(id)]||[]).slice(0, -1);
      }
      return { ...c, selections: { ...c.selections, [id]: newQty }, eddiAppliances: newAppl };
    });
    if (newQty === 0 && id === controllerProductId) {
      const remaining = PRODUCTS.find(p => p.id !== id && (cfg.selections[p.id]||0) > 0);
      setControllerProductId(remaining ? remaining.id : 2);
    }
  };

  const goToResults = () => setStep(2);
  const resetAll = () => {
    setStep(0);
    setCfg({ phase: null, inverters: [], batteries: [], selections: {}, eddiAppliances: {} });
    setWireless(false); setMonitorSolar(true); setMonitorBattery(true); setControllerProductId(2); setMainSwitchSplit(false); setCsipRequired(false); setNotes("");
  };

  return (
    <div id="sb-app" style={{
      background: DARK, minHeight: "100vh", fontFamily: "'Overpass', sans-serif",
      color: "#ddd", maxWidth: 660, margin: "0 auto",
      colorScheme: "dark",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Overpass:ital,wght@0,300;0,700;1,800&display=swap" rel="stylesheet"/>

      {/* Tab bar */}
      <div id="step-tabs" style={{ display: "flex", background: DARK, borderBottom: `2px solid ${BORDER}` }}>
        {STEPS.map((s, i) => (
          <div key={i} onClick={() => i < step && setStep(i)} style={{
            flex: 1, padding: "10px 4px", textAlign: "center", fontSize: 11,
            color: i === step ? G_TXT : i < step ? "#888" : "#bbb",
            borderBottom: i === step ? `2px solid ${G}` : "2px solid transparent",
            cursor: i < step ? "pointer" : "default",
            textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: i === step ? 700 : 400,
            marginBottom: -2,
          }}>
            {i < step ? `✓ ${s}` : s}
          </div>
        ))}
      </div>

      <div style={{ padding: 24 }}>

        {/* ── STEP 0 — Your Property ─────────────────────────────────────────── */}
        {step === 0 && (
          <div>
            <h2 style={{ margin: "0 0 4px", color: "#fff", fontWeight: 800, fontStyle: "italic", fontSize: 22 }}>Your Property</h2>
            <p style={{ margin: "0 0 22px", fontSize: 13, color: MUTED }}>Tell us about your electricity supply and any solar panels already installed.</p>

            <div style={{ marginBottom: 24 }}>
              <SecLabel>Supply Phase</SecLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["1ph","2ph","3ph"].map(p => <SelBtn key={p} active={cfg.phase === p} onClick={() => setPhase(p)}>{p}</SelBtn>)}
              </div>
              {cfg.phase === "2ph" && <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(0,119,170,0.06)", border: `1px solid ${BLUE}`, borderRadius: 6, fontSize: 12, color: BLUE }}>ⓘ 2-phase installation is not a standard configuration, which can lead to unexpected device behaviour. We recommend contacting myenergi support before proceeding.</div>}
            </div>

            <div style={{ marginBottom: 24 }}>
              <SecLabel>Solar Inverters</SecLabel>
              <div style={{ marginBottom: 8 }}>
                <Checkbox
                  checked={cfg.noSolar || false}
                  onChange={() => setCfg(c => ({ ...c, noSolar: !c.noSolar, inverters: !c.noSolar ? [] : c.inverters }))}
                  label="No solar installed on this property"
                  sub="Skip inverter configuration"
                />
              </div>
              {!cfg.noSolar && <>
                {cfg.inverters.map((inv, i) => (
                  <InverterCard key={inv.uid} inv={inv} phase={cfg.phase}
                    onChange={updated => setInverters(prev => prev.map((x, j) => j === i ? updated : x))}
                    onRemove={() => setInverters(prev => prev.filter((_, j) => j !== i))}/>
                ))}
                {cfg.inverters.length === 0 && <AddBtn onClick={() => setInverters(prev => [...prev, newInv()])}>Add solar inverter</AddBtn>}
                {cfg.inverters.length > 0 && cfg.inverters.length < 3 && <AddBtn onClick={() => setInverters(prev => [...prev, newInv()])}>Add another inverter</AddBtn>}
              </>}
            </div>

            {/* Standalone Battery — AC coupled only */}
            <div style={{ marginBottom: 24 }}>
              <SecLabel>Standalone Battery (AC Coupled)</SecLabel>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: MUTED }}>For batteries that connect directly to your switchboard. If your battery came bundled with your inverter, add it via the inverter card above.</p>
              {cfg.batteries.map((bat, i) => (
                <BatteryCard key={bat.uid} bat={bat}
                  onChange={updated => setBatteries(prev => prev.map((x, j) => j === i ? updated : x))}
                  onRemove={() => setBatteries(prev => prev.filter((_, j) => j !== i))}/>
              ))}
              {cfg.batteries.length < 3 && (
                <AddBtn onClick={() => setBatteries(prev => [...prev, newBat()])}>
                  {cfg.batteries.length === 0 ? "Add standalone battery" : "Add another battery"}
                </AddBtn>
              )}
            </div>

            <NextBtn onClick={() => setStep(1)} disabled={!step0ok}>Next →</NextBtn>
          </div>
        )}

        {/* ── STEP 1 — myenergi Devices ──────────────────────────────────────── */}
        {step === 1 && (() => {
          const totalDevices = Object.values(cfg.selections).reduce((s, q) => s + q, 0);
          const atLimit = totalDevices >= 5;
          return (
            <div>
              <h2 style={{ margin: "0 0 4px", color: "#fff", fontWeight: 800, fontStyle: "italic", fontSize: 22 }}>myenergi Devices</h2>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: MUTED }}>Select the myenergi devices being installed. One device acts as the controller — the others run as secondary.</p>
              <div style={{ marginBottom: 14, fontSize: 13, color: atLimit ? WARN : MUTED }}>
                Devices selected: <span style={{ fontWeight: 700, color: atLimit ? WARN : G_TXT }}>{totalDevices} / 5</span>
                {atLimit && <span style={{ marginLeft: 8 }}>— Maximum reached</span>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {PRODUCTS.map(p => {
                  const qty = cfg.selections[p.id] || 0;
                  const imgUrl = ICON_URLS[p.name] || ICON_URLS[p.friendlyName];
                  const isActive = qty > 0;
                  return (
                    <div key={p.id}>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px", background: isActive ? "rgba(64,255,122,0.07)" : CARD,
                        border: `1px solid ${isActive ? G : BORDER}`, borderRadius: 10,
                      }}>
                        {/* Left: thumbnail + info */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                          {/* Thumbnail */}
                          <div style={{ width: 52, height: 52, background: CARD, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", padding: 6, boxSizing: "border-box" }}>
                            {imgUrl
                              ? <img src={imgUrl} alt={p.friendlyName} style={{ width: "100%", height: "100%", objectFit: "contain" }}/>
                              : <span style={{ fontSize: 9, color: MUTED, textAlign: "center" }}>{p.friendlyName}</span>}
                          </div>
                          {/* Text */}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 16, color: isActive ? G_TXT : "#ddd", fontWeight: 700 }}>{p.friendlyName}</span>
                              <span style={{ fontSize: 12, color: isActive ? G_TXT : MUTED, fontWeight: 600 }}>— {p.tagline}</span>
                            </div>
                            <div style={{ fontSize: 12, color: MUTED, marginTop: 3, lineHeight: 1.4 }}>{p.desc}</div>
                            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                              {p.ctsIncluded} CT{p.ctsIncluded !== 1 ? "s" : ""} included · supports {p.ctsSupported} CT{p.ctsSupported !== 1 ? "s" : ""}
                            </div>
                            {isActive && (
                              <div onClick={() => setControllerProductId(p.id)} style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, cursor: "pointer" }}>
                                <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${controllerProductId === p.id ? G : "#bbb"}`, background: controllerProductId === p.id ? G : "transparent", flexShrink: 0 }}/>
                                <span style={{ fontSize: 11, color: controllerProductId === p.id ? G_TXT : MUTED }}>
                                  {controllerProductId === p.id ? "Controller (receives CTs)" : "Set as controller"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Right: qty controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 12 }}>
                          <button onClick={() => decr(p.id)} style={{ background: "#2a2a2a", border: "none", color: "#ccc", borderRadius: 999, width: 30, height: 30, cursor: "pointer", fontSize: 18, lineHeight: 1, fontFamily: "inherit" }}>−</button>
                          <span style={{ width: 22, textAlign: "center", fontSize: 15, color: isActive ? G_TXT : MUTED, fontWeight: 700 }}>{qty}</span>
                          <button onClick={() => incr(p.id)} style={{ background: atLimit ? "#333" : G, border: "none", color: atLimit ? "#666" : "#000", borderRadius: 999, width: 30, height: 30, cursor: atLimit ? "not-allowed" : "pointer", fontSize: 18, lineHeight: 1, fontFamily: "inherit" }}>+</button>
                        </div>
                      </div>

                      {/* Eddi appliance selector — shown per unit when qty > 0 */}
                      {p.hasAppliances && qty > 0 && (
                        <div style={{ marginTop: 2, paddingLeft: 4 }}>
                          {Array.from({ length: qty }).map((_, idx) => {
                            const prodKey = String(p.id);
                            const entry = (cfg.eddiAppliances[prodKey] || [])[idx] || { app1: "", app2: "" };
                            return (
                              <EddiApplianceSelector
                                key={idx}
                                unit={p.friendlyName}
                                idx={idx}
                                onChange={{
                                  data: entry,
                                  set: (key, val) => setEddiAppliance(prodKey, idx, key, val),
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <BackBtn onClick={() => setStep(0)}/>
                <NextBtn onClick={goToResults} disabled={!step1ok}>View Results →</NextBtn>
              </div>
            </div>
          );
        })()}

        {/* ── STEP 2 — Your Requirements ─────────────────────────────────────── */}
        {step === 2 && result && (() => {
          const harviTotal = result.harvisNeeded + (effectiveWireless && cfg.phase === "1ph" ? 1 : 0) + (zappiSinglePhase && cfg.phase === "3ph" ? 1 : 0);
          const showZappiSinglePhase = cfg.phase === "3ph" && result.selProds.some(p => p.id === 2 && p.qty > 0);
          const hasBatteryForSplit = result.hasAcBat || cfg.inverters.some(i => i.hasCoupledBat);
          const hasLibbi2 = (cfg.selections[7] || 0) > 0;
          const diagramConfig = buildDiagramConfig(cfg, effectiveWireless, monitorSolar, monitorBattery, controllerProductId, zappiSinglePhase, mainSwitchSplit, hasLibbi2 && csipRequired);
          const plainEnglish = generatePlainEnglish(result, ctConfig, effectiveWireless, cfg, harviTotal);
          return (
            <div id="results-page">
              <h2 style={{ margin: "0 0 16px", color: "#fff", fontWeight: 800, fontStyle: "italic", fontSize: 22 }}>Your Requirements</h2>
              {result.is2ph && <div style={{ marginBottom: 16, padding: "12px 14px", background: "rgba(0,119,170,0.06)", border: `1px solid ${BLUE}`, borderRadius: 6, fontSize: 12, color: BLUE }}>ⓘ 2-phase installation is not a standard configuration. We recommend contacting myenergi support before proceeding.</div>}

              {/* Summary chips */}
              <div style={{ marginBottom: 20, padding: "10px 14px", background: CARD, borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ background: CARD, padding: "2px 8px", borderRadius: 4, color: "#ccc" }}>{cfg.phase}</span>
                {cfg.inverters.filter(i=>i.brand).map((inv,i)=>{
                  const cb = inv.hasCoupledBat && inv.coupledBatId ? DC_BATTERIES.find(b=>b.id===parseInt(inv.coupledBatId)) : null;
                  return <span key={i} style={{ background: CARD, padding: "2px 8px", borderRadius: 4, color: "#ccc" }}>{inv.brand}{cb ? ` + ${cb.label}` : ""}{inv.phase ? ` (${inv.phase})` : ""}</span>;
                })}
                {cfg.batteries.filter(b=>b.id).map((bat,i)=>{ const f=AC_BATTERIES.find(x=>x.id===parseInt(bat.id)); return <span key={i} style={{ background: CARD, padding: "2px 8px", borderRadius: 4, color: "#ccc" }}>{f?.label} (AC)</span>; })}
              </div>

              {/* Monitoring options */}
              {result.hasAcBat && (
                <div style={{ marginBottom: 16, fontSize: 13 }}>
                  <SecLabel>Monitoring Options</SecLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Checkbox checked={monitorBattery} onChange={() => setMonitorBattery(m => !m)} label="Monitor battery output" sub="Shows battery charge/discharge on your myenergi device + app. Solar-aware charging is not impacted."/>
                  </div>
                </div>
              )}

              {/* Controller device */}
              {result.selProds.length > 1 && (
                <div style={{ marginBottom: 16 }}>
                  <SecLabel>Controller Device</SecLabel>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                    {result.selProds.map(p => (
                      <div key={p.id} onClick={() => setControllerProductId(p.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: controllerProductId === p.id ? G : CARD, border: `1px solid ${controllerProductId === p.id ? G : BORDER}`, borderRadius: 20, cursor: "pointer" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${controllerProductId === p.id ? "#000" : "#bbb"}`, background: controllerProductId === p.id ? "#000" : "transparent", flexShrink: 0 }}/>
                        <span style={{ fontSize: 11, color: controllerProductId === p.id ? "#000" : "#aaa", fontWeight: controllerProductId === p.id ? 700 : 400 }}>{p.friendlyName || p.name}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: MUTED }}>The controller receives CT inputs. Other devices run as secondary.</div>
                </div>
              )}

              {/* myenergi App Preview */}
              <div style={{ marginBottom: 24 }}>
                <SecLabel>myenergi App Preview</SecLabel>
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#ddd" }}>myenergi App</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>How your system will appear in the app</div>
                    </div>
                    <div style={{ fontSize: 11, color: MUTED, background: CARD, padding: "3px 8px", borderRadius: 4 }}>Preview</div>
                  </div>
                  <div style={{ padding: "20px 16px 16px", background: "#111", display: "flex", justifyContent: "center" }}>
                    <AppPreview cfg={cfg} result={result} monitorSolar={monitorSolar} monitorBattery={monitorBattery} zappiSinglePhase={zappiSinglePhase}/>
                  </div>
                </div>
              </div>

              {/* Monitor solar generation */}
              {result.hasSolar && (
                <div style={{ marginBottom: 20 }}>
                  <Checkbox checked={monitorSolar} onChange={() => setMonitorSolar(m => !m)} label="Monitor solar generation" sub="Required to see self-consumption % and solar output on your myenergi device + app. Solar-aware charging is not impacted."/>
                </div>
              )}

              {/* zappi single-phase on 3-phase supply */}
              {showZappiSinglePhase && (
                <div style={{ marginBottom: 20 }}>
                  <Checkbox
                    checked={zappiSinglePhase}
                    onChange={() => setZappiSinglePhase(z => !z)}
                    label="zappi wired single phase on a 3-phase supply"
                    sub="Tick if the zappi will be connected to one phase only, despite the property having a 3-phase supply"
                    color={YELLOW}
                  />
                  {zappiSinglePhase && (
                    <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(160,104,0,0.06)", border: `1px solid rgba(160,104,0,0.3)`, borderRadius: 6, fontSize: 12, color: YELLOW, lineHeight: 1.55 }}>
                      ⚠ When a 3-phase capable device is wired to a single phase, it can only see power on that one phase. A harvi is required to monitor all three phases wirelessly and net the total import/export across all phases — ensuring accurate solar-aware charging and correct energy readings in the app.
                    </div>
                  )}
                </div>
              )}

              {/* Wiring Diagram */}
              <div style={{ marginBottom: 24, marginLeft: -48, marginRight: -48 }}>
                <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, paddingLeft: 48 }}>Wiring Diagram</div>
                <div style={{ padding: "0 54px" }}>
                  <Diagram config={diagramConfig} />
                </div>
              </div>

              {/* Wireless CT */}
              {cfg.phase === "1ph" && !ctrlForcesWireless && (
                <div style={{ marginBottom: 20 }}>
                  <Checkbox checked={wireless} onChange={() => setWireless(w => !w)} label="Use wireless CT connection (harvi)" sub="Tick if CTs will connect via harvi instead of directly to the myenergi device" color={YELLOW}/>
                </div>
              )}
              {cfg.phase === "1ph" && ctrlForcesWireless && (
                <div style={{ marginBottom: 20, padding: "10px 14px", background: "rgba(160,104,0,0.06)", border: `1px solid rgba(160,104,0,0.3)`, borderRadius: 6, fontSize: 12, color: YELLOW }}>
                  ⚠ Wireless CT connection (harvi) is required — the selected controller device only supports 2 CT inputs.
                </div>
              )}

              {/* myenergi device split from battery-fed supply */}
              {hasBatteryForSplit && (
                <div style={{ marginBottom: 20 }}>
                  <Checkbox
                    checked={mainSwitchSplit}
                    onChange={() => setMainSwitchSplit(s => !s)}
                    label="Allow the myenergi device to charge from grid without drawing from the battery"
                    sub="Useful if you're on a cheap overnight grid tariff and want to charge without the home battery discharging to cover it."
                    color={YELLOW}
                  />
                  {mainSwitchSplit && (
                    <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(160,104,0,0.06)", border: `1px solid rgba(160,104,0,0.3)`, borderRadius: 6, fontSize: 12, color: YELLOW, lineHeight: 1.55 }}>
                      <p style={{ margin: "0 0 8px" }}>⚠ Achieved by wiring the myenergi device on its own circuit, separate from the battery-fed property supply, so the battery's own system never sees it as a load to cover. In GB, this split is commonly made with a Henley block at the meter tails. In AU/NZ, Henley blocks aren't used for this — the load side of the main switch is split instead. Confirm the correct method and equipment for your region with local wiring rules. The myenergi grid CT stays positioned before the split so it still reads total site import/export for zero-export control; a separate CT on the property side (fitted by the inverter/battery installer) monitors only the property's own load.</p>
                      <p style={{ margin: 0 }}>Alternatively, the same outcome can be reached without rewiring — by scheduling the battery and the myenergi device to charge from grid at the same time. Check with your battery installer or manufacturer on how to configure this.</p>
                    </div>
                  )}
                </div>
              )}

              {/* CSIP-AUS controller — libbi 2 only, off by default (region/compliance dependent) */}
              {hasLibbi2 && (
                <div style={{ marginBottom: 20 }}>
                  <Checkbox
                    checked={csipRequired}
                    onChange={() => setCsipRequired(c => !c)}
                    label="Include a CSIP-AUS controller"
                    sub="Tick if this site needs CSIP-AUS compliant dynamic export control. Comms-only — doesn't add a CT to the bill of materials."
                    color={YELLOW}
                  />
                </div>
              )}

              {/* Stat boxes */}
              <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                {statBox("CTs Required", result.totalCTs, "#fff")}
                {statBox("CTs Included", result.ctsIncluded, "#fff")}
                {statBox("Additional CTs", result.additionalCTs, result.additionalCTs > 0 ? WARN : MUTED)}
                {statBox("harvis Required", harviTotal, harviTotal > 0 ? YELLOW : MUTED)}
              </div>

              {/* CT Requirements table */}
              <div style={{ marginBottom: 20 }}>
                <SecLabel>CT Requirements</SecLabel>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>
                      <th style={th}>Component</th>
                      <th style={{ ...th, textAlign: "center", width: 50 }}>CTs</th>
                      <th style={th}>CT Type</th>
                      <th style={th}>Input</th>
                      <th style={th}>Routing</th>
                    </tr></thead>
                    <tbody>
                      {ctConfig.map((row, i) => (
                        <React.Fragment key={i}>
                          <tr>
                            <td style={{ ...tdr(i), color: "#ccc", fontSize: 13 }}>{row.component}</td>
                            <td style={{ ...tdr(i), textAlign: "center", color: G_TXT, fontWeight: 700 }}>{row.cts}</td>
                            <td style={{ ...tdr(i), color: BLUE }}>{row.type}</td>
                            <td style={{ ...tdr(i), color: row.routing === "harvi" ? YELLOW : MUTED }}>{row.input}</td>
                            <td style={{ ...tdr(i), color: row.routing === "harvi" ? YELLOW : MUTED }}>
                              {row.routing === "harvi" && effectiveWireless && cfg.phase === "1ph" ? `→ wire to harvi, pair with ${result.master?.name || "myenergi device"}` : row.routing === "harvi" ? "→ harvi" : "→ wire to myenergi device"}
                            </td>
                          </tr>
                          {row.note && <tr><td colSpan={5} style={{ padding: "6px 10px 10px", background: i % 2 === 0 ? CARD : "#1a1a1a", borderBottom: `1px solid ${BORDER}` }}><div style={{ padding: "7px 10px", background: "rgba(160,104,0,0.06)", border: "1px solid rgba(160,104,0,0.25)", borderRadius: 5, fontSize: 11, color: YELLOW }}>⚠ {row.note}</div></td></tr>}
                        </React.Fragment>
                      ))}
                      <tr>
                        <td style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, borderTop: `2px solid ${BORDER}`, fontSize: 13 }}>Total</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: G_TXT, fontWeight: 700, borderTop: `2px solid ${BORDER}`, fontSize: 13 }}>{result.totalCTs}</td>
                        <td colSpan={3} style={{ borderTop: `2px solid ${BORDER}` }}/>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Plain-English translation */}
              <div style={{ marginBottom: 20, padding: "14px 16px", background: "rgba(64,255,122,0.06)", border: `1px solid rgba(64,255,122,0.25)`, borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: G_TXT, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>In Plain English</div>
                {plainEnglish.map((line, i) => (
                  <p key={i} style={{ margin: "0 0 6px", fontSize: 13, color: "#ccc", lineHeight: 1.55 }}>{line}</p>
                ))}
              </div>

              {/* Bill of Materials */}
              <div style={{ marginBottom: 24 }}>
                <SecLabel>Bill of Materials</SecLabel>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>
                    <th style={th}>Item</th>
                    <th style={{ ...th, textAlign: "center", width: 60 }}>Qty</th>
                  </tr></thead>
                  <tbody>
                    {result.selProds.map((p, i) => (
                      <tr key={i}>
                        <td style={tdr(i)}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon name={p.name}/><div><div style={{ color: "#ddd", fontSize: 14 }}>{p.friendlyName || p.name}</div><div style={{ color: MUTED, fontSize: 12 }}>{p.tagline || ""}</div></div></div></td>
                        <td style={{ ...tdr(i), textAlign: "center", color: "#fff", fontWeight: 700 }}>{p.qty}</td>
                      </tr>
                    ))}
                    {harviTotal > 0 && (() => { const i = result.selProds.length; return (
                      <tr><td style={tdr(i)}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon name="harvi"/><div><div style={{ color: "#ddd", fontSize: 14 }}>harvi</div><div style={{ color: MUTED, fontSize: 12 }}>Wireless CT Transmitter</div></div></div></td><td style={{ ...tdr(i), textAlign: "center", color: YELLOW, fontWeight: 700 }}>{harviTotal}</td></tr>
                    ); })()}
                    {result.additionalCTs > 0 && (() => { const i = result.selProds.length + (harviTotal > 0 ? 1 : 0); return (
                      <tr><td style={{ ...tdr(i), color: "#333" }}>Additional CT clamps</td><td style={{ ...tdr(i), textAlign: "center", color: WARN, fontWeight: 700 }}>{result.additionalCTs}</td></tr>
                    ); })()}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Notes</div>
                <textarea
                  className="notes-textarea"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes here…"
                  style={{ width: "100%", minHeight: 100, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, color: "#ddd", padding: "10px 12px", fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
                />
                <div className="notes-print" style={{ display: "none", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.5, border: "1px solid #ccc", borderRadius: 6, padding: "10px 12px", minHeight: 60 }}>
                  {notes || "—"}
                </div>
              </div>

              {/* Actions */}
              <div className="no-print" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <BackBtn onClick={() => setStep(1)}/>
                <button onClick={resetAll} style={{ background: "none", border: `1px solid ${BORDER}`, color: "#aaa", borderRadius: 999, padding: "11px 24px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Start over</button>
                <button onClick={exportPDF} style={{ background: G, color: "#000", border: "none", borderRadius: 999, padding: "11px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Export PDF</button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
