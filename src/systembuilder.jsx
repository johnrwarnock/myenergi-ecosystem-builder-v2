import React, { useState, useMemo, useRef, useEffect } from "react";
import { Diagram } from "./App";
import zappiImgUrl from "./zappi.svg";
import eddiImgUrl from "./eddi.svg";
import eddiPlusImgUrl from "./eddi+.svg";
import gloImgUrl from "./GLO.svg";
import harviImgUrl from "./harvi.svg";
import libbiImgUrl from "./libbi.svg";
import appScreenUrl from "./MainScreen.svg";

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

const INVERTER_BRANDS = [
  { name: "myenergi libbi",       acOnly: false, allInOne: true,  autoBatId: 14 },
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

const BATTERIES = [
  { id: 14, label: "myenergi libbi",             type: "AC or DC" },
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

const DC_BATTERIES = BATTERIES.filter(b => b.type === "DC Hybrid" || b.type === "AC or DC" || b.id === 99);
const AC_BATTERIES = BATTERIES.filter(b => b.type === "AC Coupled" || b.type === "AC or DC" || b.id === 99);

const PRODUCTS = [
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
function buildDiagramConfig(cfg, wireless, monitorSolar, monitorBattery, controllerProductId) {
  const { phase, inverters = [], batteries = [], selections = {}, eddiAppliances = {} } = cfg;

  const sp = phase || "1ph";
  const CTRL_CTS_MAP = { "zappi":3, "eddi+":3, "eddi":2, "GLO":2, "libbi":3 };
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

  const ctrlCaps = CTRL_CTS_MAP[pr[0]] || 3;
  const wlFinal = wl || ctrlCaps < 3;

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

  return { sp, inv, ab, wl: wlFinal, pr, appliancesList };
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

function resolveStandaloneBatType(bat) {
  const found = AC_BATTERIES.find(b => b.id === parseInt(bat.id));
  if (!found) return null;
  if (found.type === "AC or DC") return bat.mode || null;
  if (found.id === 99) return "AC Coupled";
  return found.type;
}

function calcResults(cfg, monitorSolar, monitorBattery, controllerProductId) {
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
function generatePlainEnglish(result, ctConfig, effectiveWireless, cfg, harviTotal) {
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

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState({
    phase: null, inverters: [], batteries: [], selections: {},
    eddiAppliances: {},   // { "4": [{app1:"",app2:""}, ...], "5": [...] }
  });
  const [wireless, setWireless] = useState(false);
  const [monitorSolar, setMonitorSolar] = useState(true);
  const [monitorBattery, setMonitorBattery] = useState(true);
  const [controllerProductId, setControllerProductId] = useState(2);

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
  const ctrlForcesWireless = cfg.phase === "1ph" && !!(ctrlProdData && ctrlProdData.ctsSupported < 3);
  const effectiveWireless = wireless || ctrlForcesWireless;

  const STEPS = ["Your Property", "myenergi Devices", "Your Requirements"];
  const step0ok = !!cfg.phase;
  const step1ok = Object.values(cfg.selections).some(q => q > 0);

  const ctConfig = useMemo(() => {
    if (!result) return [];
    const { validComps, ctsSupported } = result;
    const is3ph = cfg.phase === "3ph", is2ph = cfg.phase === "2ph", is1ph = cfg.phase === "1ph";
    const needsGridHarvi = is2ph || (is3ph && ctsSupported < 3) || (effectiveWireless && is1ph);
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
  }, [result, cfg, effectiveWireless, monitorSolar, monitorBattery]);

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

  const goToResults = () => { setMonitorSolar(true); setMonitorBattery(true); setStep(2); };
  const resetAll = () => {
    setStep(0);
    setCfg({ phase: null, inverters: [], batteries: [], selections: {}, eddiAppliances: {} });
    setWireless(false); setMonitorSolar(true); setMonitorBattery(true); setControllerProductId(2);
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
                            {imgUrl && <img src={imgUrl} alt={p.friendlyName} style={{ width: "100%", height: "100%", objectFit: "contain" }}/>}
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
          const harviTotal = result.harvisNeeded + (effectiveWireless && cfg.phase === "1ph" ? 1 : 0);
          const diagramConfig = buildDiagramConfig(cfg, effectiveWireless, monitorSolar, monitorBattery, controllerProductId);
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
              {(result.hasSolar || result.hasAcBat) && (
                <div style={{ marginBottom: 16, fontSize: 13 }}>
                  <SecLabel>Monitoring Options</SecLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.hasSolar && <Checkbox checked={monitorSolar} onChange={() => setMonitorSolar(m => !m)} label="Monitor solar generation" sub="Required to see self-consumption % and solar output on your myenergi device + app. Solar-aware charging is not impacted."/>}
                    {result.hasAcBat && <Checkbox checked={monitorBattery} onChange={() => setMonitorBattery(m => !m)} label="Monitor battery output" sub="Shows battery charge/discharge on your myenergi device + app. Solar-aware charging is not impacted."/>}
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

              {/* Stat boxes */}
              <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                {statBox("CTs Required", result.totalCTs, "#fff")}
                {statBox("CTs Included", result.ctsIncluded, "#fff")}
                {statBox("Additional CTs", result.additionalCTs, result.additionalCTs > 0 ? WARN : MUTED)}
                {statBox("harvis Required", harviTotal, harviTotal > 0 ? YELLOW : MUTED)}
              </div>

              {/* Plain-English translation */}
              <div style={{ marginBottom: 20, padding: "14px 16px", background: "rgba(64,255,122,0.06)", border: `1px solid rgba(64,255,122,0.25)`, borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: G_TXT, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>In Plain English</div>
                {plainEnglish.map((line, i) => (
                  <p key={i} style={{ margin: "0 0 6px", fontSize: 13, color: "#ccc", lineHeight: 1.55 }}>{line}</p>
                ))}
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

              {/* Wiring Diagram */}
              <div style={{ marginBottom: 24, marginLeft: -48, marginRight: -48 }}>
                <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, paddingLeft: 48 }}>Wiring Diagram</div>
                <div style={{ padding: "0 54px" }}>
                  <Diagram config={diagramConfig} />
                </div>
              </div>

              {/* myenergi App Preview */}
              <div style={{ marginBottom: 24 }}>
                <SecLabel>myenergi App Preview</SecLabel>
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                  {/* Header */}
                  <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#ddd" }}>myenergi App</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>How your system will appear in the app</div>
                    </div>
                    <div style={{ fontSize: 11, color: MUTED, background: CARD, padding: "3px 8px", borderRadius: 4 }}>Preview</div>
                  </div>
                  {/* App screenshot + overlay */}
                  <div style={{ position: "relative", display: "flex", justifyContent: "center", padding: "24px 16px", background: "#1a1a2e", minHeight: 240 }}>
                    <img src={appScreenUrl} alt="myenergi app" style={{ width: 188, borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}/>
                    {/* Overlay showing selected devices */}
                    <div style={{ position: "absolute", top: 16, right: 24, display: "flex", flexDirection: "column", gap: 6 }}>
                      {result.selProds.map((p, i) => (
                        <div key={i} style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", border: `1px solid ${G}`, borderRadius: 6, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: G }}/>
                          <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{p.friendlyName || p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Coming soon note */}
                  <div style={{ padding: "12px 16px", background: CARD, borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 11, color: MUTED }}>
                      🔧 <strong>Coming soon:</strong> A personalised app preview based on your exact configuration — showing your devices, energy flows, and dashboard layout.
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Notes</div>
                <textarea
                  placeholder="Add notes here…"
                  style={{ width: "100%", minHeight: 100, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, color: "#ddd", padding: "10px 12px", fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              {/* Actions */}
              <div className="no-print" style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
