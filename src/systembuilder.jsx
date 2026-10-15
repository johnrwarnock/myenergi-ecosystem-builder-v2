import React, { useState, useMemo, useRef, useEffect } from "react";
import { Diagram } from "./App";
import zappiImgUrl from "./zappi.svg";
import eddiImgUrl from "./eddi.svg";
import eddiPlusImgUrl from "./eddi+.svg";
import gloImgUrl from "./GLO.svg";
import harviImgUrl from "./harvi.svg";
import libbi2ImgUrl from "./libbi2.svg";
import { Libbi2InstallDiagram } from "./diagram/Libbi2InstallDiagram.jsx";
import {
  LIBBI2_INVERTERS, LIBBI2_COUPLING, REGIONS, DEFAULT_LIBBI2, BACKUP_CIRCUIT_OPTIONS,
  libbi2Summary, libbi2Warnings, libbi2ProtectionRows, effectiveCoupling, COUPLING_LABELS, conductorColours, amps,
} from "./libbi2.js";
import { batterySupportArticles, GENERAL_BATTERY_ARTICLE, HYBRID_ARTICLE } from "./supportArticles.js";
import { Tip, InfoNote, SectionHead, PicCard, PhaseIcon, SolarOnlyIcon, SolarBatteryIcon, BackupHouse, StackGraphic, BreakerBadge, Zoomable, ViewSwitch, ToggleRow } from "./ui.jsx";

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
    tagline: "Smart EV charger",
    desc: "Charges your electric vehicle using surplus solar or off-peak power. Works with all EVs.",
    ctsIncluded: 3, ctsSupported: 3,
    protection: { breaker: "40 A MCB", rcd: "Type A", cable: "6–10 mm² Cu" }, // EV charger
  },
  {
    id: 3, name: "GLO", friendlyName: "GLO",
    tagline: "Simple smart EV charger",
    desc: "Simple but smart younger cousin to zappi. Single phase only, no screen, same smart functionality.",
    ctsIncluded: 1, ctsSupported: 2,
    protection: { breaker: "40 A MCB", rcd: "Type A", cable: "6–10 mm² Cu" }, // EV charger
  },
  {
    id: 4, name: "eddi", friendlyName: "eddi",
    tagline: "Hot water from solar",
    desc: "Diverts surplus solar to heat water or other appliances instead of exporting it to the grid.",
    ctsIncluded: 1, ctsSupported: 2, hasAppliances: true,
    protection: { breaker: "16 A MCB", rcd: "Type A", cable: "2.5 mm² Cu min" },
  },
  {
    id: 5, name: "eddi+", friendlyName: "eddi+",
    tagline: "Diverter with 3 CT inputs",
    desc: "Like eddi, with 3 CT inputs — ideal for 3-phase installations or complex setups.",
    ctsIncluded: 3, ctsSupported: 3, hasAppliances: true,
    protection: { breaker: "16 A MCB", rcd: "Type A", cable: "2.5 mm² Cu min" },
  },
  {
    id: 6, name: "libbi 2", friendlyName: "libbi 2",
    tagline: "Home battery + inverter",
    desc: "Hybrid inverter with 1–8 stackable 5 kWh battery modules. DC or AC coupled, with optional EPS backup.",
    // 1 CT ships in the inverter box; the libbi 2 controller has CT1–CT3 inputs (manual p.21, p.40)
    ctsIncluded: 1, ctsSupported: 3, maxQty: 1, // parallel libbi 2 not supported (manual p.13, p.15)
    protection: "libbi2", // computed per configuration — see libbi2ProtectionRows
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
export function buildDiagramConfig(cfg, wireless, monitorSolar, monitorBattery, controllerProductId, zappiSinglePhase = false, mainSwitchSplit = false) {
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

  // libbi 2 sits in the device row below the switchboard (controller +
  // stack); its own solar panels hang off it when DC or Hybrid. No CT of its
  // own — the controller reads it over RS485 (manual p.55).
  const libbiPv = (selections[6] || 0) > 0 && libbi2Summary(cfg.libbi2 || DEFAULT_LIBBI2).hasPv;

  const ORDER = [
    { id: 2, name: "zappi" },
    { id: 5, name: "eddi+" },
    { id: 4, name: "eddi" },
    { id: 3, name: "GLO" },
    { id: 6, name: "libbi 2" },
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

  // zappi is the only myenergi device wired across three phases
  const threePhaseDevices = phase === "3ph" && !zappiSinglePhase ? ["zappi"] : [];
  return { sp, inv, ab, wl: wlFinal, pr, appliancesList, mainSwitchSplit, ctrlCtsSupported, region: cfg.region || "aunz", threePhaseDevices, libbiPv };
}

const ICON_URLS = {
  "zappi multiphase (7 / 22kW)": zappiImgUrl,
  "GLO":   gloImgUrl,
  "eddi":  eddiImgUrl,
  "eddi+": eddiPlusImgUrl,
  "libbi 2": libbi2ImgUrl,
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
  const { totalCTs, additionalCTs } = result;
  const lines = [];
  const ph = cfg.phase;
  const clamps = n => `${n} CT clamp${n !== 1 ? "s" : ""}`;

  const l2 = (cfg.selections?.[6] || 0) > 0 ? libbi2Summary(cfg.libbi2) : null;
  if (l2) {
    const solar = l2.hasPv ? "solar panels connected to it" : "your existing solar";
    const list = cfg.backupCircuits.map(c => c.toLowerCase());
    const named = list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}` : list[0];
    const backup = cfg.libbi2.eps ? `, and keeps ${named || "selected circuits"} on in a power cut` : "";
    lines.push(`libbi 2 stores ${l2.capacityKWh} kWh from ${solar}${backup}.`);
  }

  if (totalCTs === 0) { lines.push("No CT clamps are needed."); return lines; }

  const where = [];
  ctConfig.forEach(row => {
    if (row.component.includes("Grid")) where.push(ph === "3ph" ? "3 on the incoming supply (one per phase)" : ph === "2ph" ? "2 on the incoming supply" : "1 on the incoming supply");
    else if (row.component.includes("Solar") || row.component.includes("DC Hybrid")) where.push(`${row.cts} on the solar`);
    else if (row.component.includes("Battery")) where.push(`${row.cts} on the battery`);
  });
  lines.push(`You need ${clamps(totalCTs)}: ${where.join(", ")}. They clip around cables to measure power.`);
  if (harviTotal > 0) lines.push(`${harviTotal} harvi send${harviTotal === 1 ? "s" : ""} the clamp readings wirelessly.`);
  lines.push(additionalCTs > 0 ? `Order ${clamps(additionalCTs)} extra. The rest come with your devices.` : "All CT clamps come with your devices.");
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

// ── Conductor colour key for the ecosystem wiring diagram ────────────────────
function ConductorKey({ region, phase }) {
  const cc = conductorColours(region);
  const n = phase === "3ph" ? 3 : phase === "2ph" ? 2 : 1;
  const sw = col => ({ display: "inline-block", width: 18, height: 4, background: col, border: col.toLowerCase() === "#ffffff" ? "1px solid #888" : "none", verticalAlign: "middle", marginRight: 5 });
  return (
    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 11, color: MUTED }}>
      {cc.L.slice(0, n).map((c, i) => <span key={i}><span style={sw(c)}/>{n > 1 ? `L${i + 1}` : "Line"} · {cc.names[i]}</span>)}
      <span><span style={sw("#d97706")}/>DC (PV / battery)</span>
      <span>Neutral ({cc.nName}) and earth are shown on the libbi 2 diagram.</span>
    </div>
  );
}

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
          <SecLabel>Inverter phase</SecLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <SelBtn active={inv.phase === "1ph"} onClick={() => onChange({ ...inv, phase: "1ph" })}>Single phase</SelBtn>
            <SelBtn active={inv.phase === "3ph"} onClick={() => onChange({ ...inv, phase: "3ph" })}>Three phase</SelBtn>
          </div>
        </div>
      )}

      {inv.brand && !isAcOnly && (
        <div style={{ marginTop: 4 }}>
          <SecLabel>What does it run? <Tip term="hybrid"/></SecLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <PicCard active={!inv.hasCoupledBat} onClick={() => inv.hasCoupledBat && handleHybridToggle()} title="Solar only"><SolarOnlyIcon/></PicCard>
            <PicCard active={inv.hasCoupledBat} onClick={() => !inv.hasCoupledBat && handleHybridToggle()} title="Solar + battery" sub={coupledBat && coupledBat.id !== 99 ? coupledBat.label : "Hybrid inverter"}><SolarBatteryIcon/></PicCard>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BatteryCard ──────────────────────────────────────────────────────────────
function BatteryCard({ bat, onChange, onRemove }) {
  const found = AC_BATTERIES.find(b => b.id === parseInt(bat.id));
  return (
    <div style={{ background: CARD, border: `1px solid ${bat.id ? G : BORDER}`, borderRadius: 8, padding: "14px 16px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: bat.id ? G_TXT : MUTED, fontWeight: 600 }}>{found?.label || "Battery"}</span>
        <button onClick={onRemove} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
      </div>
      <div>
        <SecLabel>Brand / model</SecLabel>
        <select value={bat.id} onChange={e => {
          const sel = AC_BATTERIES.find(b => b.id === parseInt(e.target.value));
          const defaultMode = sel?.type === "AC or DC" ? "AC Coupled" : "";
          onChange({ ...bat, id: e.target.value, mode: defaultMode });
        }} style={selStyle}>
          <option value="">Select battery…</option>
          {AC_BATTERIES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      </div>
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

// ── Coupling sketch — where the solar panels connect ─────────────────────────
// DC: panels wired straight into libbi 2. AC: libbi 2 only on the switchboard,
// with the panels on their own separate inverter. Both when DC + existing.
function CouplingSketch({ mode }) {
  const ac = "#ddd", dc = "#d97706", line = "#cfcfcf";
  const Panel = ({ x, y }) => (
    <g transform={`translate(${x},${y})`}>
      <path d="M8,0 H62 L54,30 H0 Z" fill="#1e2a3a" stroke="#8fb3d9" strokeWidth={1.4}/>
      {[1, 2, 3].map(i => <line key={i} x1={8 + i * 13.5} y1={0} x2={i * 13.5} y2={30} stroke="#8fb3d9" strokeWidth={0.9}/>)}
      <line x1={4} y1={15} x2={58} y2={15} stroke="#8fb3d9" strokeWidth={0.9}/>
    </g>
  );
  // Generic solar inverter pictogram: box split by a diagonal, DC (=) in, AC (~) out
  const Inverter = ({ x, y }) => (
    <g transform={`translate(${x},${y})`} fill="none" stroke={line} strokeWidth={1.6} strokeLinecap="round">
      <rect x={0} y={0} width={40} height={34} rx={3}/>
      <line x1={0} y1={34} x2={40} y2={0}/>
      <path d="M6 9 h9 M6 13 h9" strokeWidth={1.4}/>
      <path d="M24 26 q2.5 -4 5 0 t5 0" strokeWidth={1.4}/>
    </g>
  );
  const Board = ({ x, y }) => (
    <g>
      <rect x={x} y={y} width={84} height={28} rx={5} fill="#2a2a2a" stroke="#666" strokeWidth={1.5}/>
      <text x={x + 42} y={y + 18} textAnchor="middle" fill="#ccc" fontSize={10} fontWeight={700} fontFamily="Overpass,sans-serif">SWITCHBOARD</text>
    </g>
  );
  const W = ({ d, col }) => <path d={d} fill="none" stroke={col} strokeWidth={2.2}/>;
  const pvOnLibbi = mode !== "ac", inverter = mode !== "dc";
  const LY = 86; // libbi row centre
  return (
    <svg viewBox={inverter ? "0 0 400 124" : "0 50 400 74"} style={{ width: "100%", maxWidth: 400, display: "block", margin: "2px 0 4px" }}>
      <Board x={4} y={LY - 14}/>
      <W d={`M88,${LY} H186`} col={ac}/>
      <rect x={186} y={LY - 34} width={40} height={68} rx={6} fill="#ececec"/>
      <image href={libbi2ImgUrl} x={192} y={LY - 31} width={28} height={62} preserveAspectRatio="xMidYMid meet"/>
      {pvOnLibbi && <><W d={`M226,${LY} H296`} col={dc}/><Panel x={296} y={LY - 15}/></>}
      {inverter && <>
        <W d={`M46,${LY - 14} V22 H186`} col={ac}/>
        <Inverter x={186} y={5}/>
        <W d="M226,22 H296" col={dc}/>
        <Panel x={296} y={7}/>
      </>}
    </svg>
  );
}

// ── libbi 2 configuration panel ───────────────────────────────────────────────
function Libbi2Panel({ value, onChange, region, phase, thirdPartyCount, backupCircuits, onToggleCircuit }) {
  const s = libbi2Summary(value);
  const set = patch => onChange({ ...value, ...patch });
  const warnings = libbi2Warnings(value, thirdPartyCount);
  const eff = effectiveCoupling(value);
  const stepBtn = (disabled) => ({ background: disabled ? "#2a2a2a" : G, border: "none", color: disabled ? "#666" : "#000", borderRadius: 999, width: 34, height: 34, cursor: disabled ? "not-allowed" : "pointer", fontSize: 20, lineHeight: 1, fontFamily: "inherit", fontWeight: 700 });
  const atMin = s.modules <= s.inverter.minModules, atMax = s.modules >= s.inverter.maxModules;
  return (
    <div style={{ marginTop: 10, padding: "16px", background: "#262626", border: `1px solid ${BORDER}`, borderRadius: 10, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ fontSize: 15, color: "#fff", fontWeight: 800 }}>Set up libbi 2</div>

      <div>
        <SectionHead>Inverter size</SectionHead>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {LIBBI2_INVERTERS.filter(i => i.available).map(i => (
            <SelBtn key={i.id} active={s.inverter.id === i.id}
              onClick={() => set({ inverterId: i.id, modules: Math.min(Math.max(value.modules, i.minModules), i.maxModules) })}>{i.label}</SelBtn>
          ))}
        </div>
        <div style={{ fontSize: 12, color: s.inverter.provisional ? WARN : MUTED, marginTop: 6 }}>
          {s.inverter.provisional ? "Specifications to be confirmed" : `Up to ${s.inverter.maxPvInputW / 1000} kW of solar panels`}
        </div>
      </div>

      <div>
        <SectionHead>Battery size</SectionHead>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <StackGraphic modules={s.modules} max={s.inverter.maxModules} kWh={s.capacityKWh}/>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: G, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{s.capacityKWh} <span style={{ fontSize: 15, fontWeight: 700 }}>kWh</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" aria-label="Remove a module" style={stepBtn(atMin)} disabled={atMin} onClick={() => set({ modules: s.modules - 1 })}>−</button>
              <span style={{ fontSize: 14, color: "#ddd", minWidth: 74, textAlign: "center" }}>{s.modules} module{s.modules > 1 ? "s" : ""}</span>
              <button type="button" aria-label="Add a module" style={stepBtn(atMax)} disabled={atMax} onClick={() => set({ modules: s.modules + 1 })}>+</button>
            </div>
            {s.needsExpansionKit && <div style={{ fontSize: 12, color: MUTED }}>Includes expansion kit ({s.inverter.expansionKitFrom}+ modules)</div>}
          </div>
        </div>
      </div>

      <div>
        <SectionHead tipText="Connect solar to libbi 2 (DC coupled): new panels plug straight into libbi 2. Use existing solar (AC coupled): libbi 2 connects to the switchboard and stores surplus from solar that already has its own inverter. Hybrid: both, new panels on libbi 2 and the existing solar inverter kept.">Solar connection</SectionHead>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {LIBBI2_COUPLING.map(c => (
            <PicCard key={c.id} active={eff === c.id} onClick={() => set({ coupling: c.id })} title={c.label} sub={c.sub}>
              <CouplingSketch mode={c.id}/>
            </PicCard>
          ))}
        </div>
      </div>

      <div>
        <SectionHead tip="EPS">Backup power</SectionHead>
        <div style={{ display: "flex", gap: 8, marginBottom: value.eps ? 10 : 0 }}>
          <SelBtn active={value.eps} onClick={() => set({ eps: true })}>Yes</SelBtn>
          <SelBtn active={!value.eps} onClick={() => set({ eps: false })}>No</SelBtn>
        </div>
        {value.eps
          ? <BackupHouse options={BACKUP_CIRCUIT_OPTIONS} selected={backupCircuits} onToggle={onToggleCircuit}/>
          : <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>The home goes off in a power cut.</div>}
        {value.eps && <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>Backup supply up to {amps(s.inverter.epsRatedA)}.</div>}
      </div>

      {region === "aunz" && (
        <ToggleRow checked={!!value.csip} onChange={() => set({ csip: !value.csip })} label="CSIP-AUS controlled site" tip="csip"/>
      )}

      {(phase === "3ph" || warnings.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {phase === "3ph" && <InfoNote>libbi 2 is single phase. Supply its controller from L1.</InfoNote>}
          {warnings.map(w => <InfoNote key={w} tone="warn">{w}</InfoNote>)}
        </div>
      )}
    </div>
  );
}

// ── Circuit protection, as one card per product ──────────────────────────────
function ProtectionCards({ rows }) {
  const groups = [];
  rows.forEach(r => {
    const g = groups.find(x => x.product === r.product);
    g ? g.rows.push(r) : groups.push({ product: r.product, rows: [r] });
  });
  const dim = v => (v === "TBC" ? WARN : "#bbb");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
      {groups.map(g => (
        <div key={g.product} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{g.product}</div>
          {g.rows.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <BreakerBadge text={r.breaker} kind={/earth/i.test(r.circuit) ? "earth" : /isolator/i.test(r.breaker) ? "isolator" : "breaker"}/>
              <div style={{ minWidth: 0, fontSize: 12, lineHeight: 1.5 }}>
                <div style={{ fontSize: 13, color: "#eee", fontWeight: 700 }}>{r.circuit}</div>
                {r.breaker !== "—" && <div style={{ color: dim(r.breaker) }}>{r.breaker}</div>}
                {r.rcd !== "—" && <div style={{ color: dim(r.rcd) }}>RCD: {r.rcd}</div>}
                <div style={{ color: dim(r.cable) }}>Cable: {r.cable}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Circuit protection table ──────────────────────────────────────────────────
export function protectionRows(cfg, selProds, harviTotal) {
  const rows = [];
  selProds.forEach(p => {
    const tag = cfg.existing?.[p.id] ? " (existing)" : "";
    if (p.protection === "libbi2") rows.push(...libbi2ProtectionRows(cfg.libbi2 || DEFAULT_LIBBI2).map(r => ({ ...r, product: r.product + tag })));
    else for (let i = 0; i < p.qty; i++) {
      const pr = p.protection;
      rows.push({ product: (p.qty > 1 ? `${p.friendlyName} ${i + 1}` : p.friendlyName) + tag, circuit: "Dedicated supply",
        breaker: pr?.breaker || "TBC", rcd: pr?.rcd || "TBC", cable: pr?.cable || "TBC" });
    }
  });
  if (harviTotal > 0) rows.push({ product: "harvi", circuit: "—", breaker: "Not required (powered by its CT)", rcd: "—", cable: "CT cable: twisted pair, up to 100 m" });
  return rows;
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

// Operating modes per device type, as shown in the myenergi app.
// Sources: support.myenergi.com — "What are the zappi charging modes?",
// "Charging Modes With zappi GLO", "How eddi Handles Boosting"; libbi
// Normal/Stopped/Export as exposed by the myenergi API.
const DEVICE_MODES = {
  zappi: {
    label: "zappi", default: "ECO",
    modes: {
      ECO:    { bg: "#FFCC00", fg: "#000", desc: "Matches the charge to surplus solar and tops up from the grid when there isn't enough. Once the EV is plugged in, charging never drops below the 1.4 kW minimum (4.2 kW on three phase)." },
      "ECO+": { bg: "#40ff7a", fg: "#000", desc: "Charges only from surplus solar. It waits for enough surplus (about 1.4 kW single phase, 4.2 kW three phase) before starting, and pauses when it drops away." },
      FAST:   { bg: "#0086FF", fg: "#fff", desc: "Charges as fast as the EV will take, up to 32 A (about 7.4 kW single phase or 22 kW three phase), within any device or grid limits." },
      BOOST:  { bg: "#0086FF", fg: "#fff", desc: "A timed override set from ECO or ECO+, either manually, on a schedule or as a Smart Boost. zappi charges at full power while the boost is active." },
      STOP:   { bg: "#FF008C", fg: "#fff", desc: "zappi will not charge. Surplus solar goes to other devices or is exported." },
    },
  },
  glo: {
    label: "GLO", default: "SMART ON",
    modes: {
      "SMART ON":  { bg: "#40ff7a", fg: "#000", desc: "Smart charging on: GLO uses surplus solar, follows your charging schedule, and responds to dynamic tariffs and demand-response events. zappi GLO replaces Fast, Eco and Eco+ with this." },
      "SMART OFF": { bg: "#0086FF", fg: "#fff", desc: "Smart charging off: GLO charges as soon as the EV is plugged in, as fast as possible, until the vehicle stops asking for power." },
    },
  },
  eddi: {
    label: "eddi", default: "NORMAL",
    modes: {
      NORMAL: { bg: "#00E6C0", fg: "#000", desc: "Diverts surplus solar into the hot water heater (or other connected load) instead of exporting it, until the tank reaches temperature." },
      BOOST:  { bg: "#0086FF", fg: "#fff", desc: "Heats now using surplus solar, topped up from the grid. A manual boost ends at max temperature; a scheduled boost reheats within its time window if the tank cools." },
      STOP:   { bg: "#FF008C", fg: "#fff", desc: "eddi will not divert or boost. Surplus solar goes to other devices or is exported." },
    },
  },
  libbi: {
    label: "libbi 2", default: "NORMAL",
    modes: {
      NORMAL: { bg: "#FF9234", fg: "#000", desc: "Stores surplus solar and discharges to power the home when generation falls short. With 'Enable charging from the grid' ticked, it can also charge at the cheapest tariff times." },
      STOP:   { bg: "#FF008C", fg: "#fff", desc: "libbi 2 neither charges nor discharges. The home runs from solar and the grid only." },
      EXPORT: { bg: "#0086FF", fg: "#fff", desc: "Discharges stored energy to power the home and exports the rest to the grid, within the export limit." },
    },
  },
};

function AppPreview({ cfg, result, monitorSolar = true, monitorBattery = true, zappiSinglePhase = false }) {
  const [now, setNow] = useState(() => new Date());
  const [modes, setModes] = useState(() => Object.fromEntries(Object.entries(DEVICE_MODES).map(([k, v]) => [k, v.default])));
  const setMode = (dev, m) => setModes(ms => ({ ...ms, [dev]: m }));
  // Device priority: ordered groups of individual units ("zappi#1",
  // "zappi#2"…); units in the same group share surplus. New units are added
  // in myenergi's advised order: eddi first, then the EV chargers.
  const [priority, setPriority] = useState([]);
  const [dragKey, setDragKey] = useState(null);
  const anglesRef = useRef({});
  const [, setSpin] = useState(0);

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
  const libbiPv         = hasLibbi && libbi2Summary(cfg.libbi2).hasPv; // PV wired straight into libbi 2
  const hasSolarOnly    = monitorSolar && (soloInverters.length > 0 || libbiPv);
  const hasSolarNode    = hasGenBat || hasSolarOnly;
  // Third-party AC batteries are monitored by CT; libbi 2 always has its own spoke
  const showBatteryNode  = monitorBattery && (cfg.batteries || []).some(b => b.id);

  const nZappi = sels[2] || 0, nGlo = sels[3] || 0;
  const numEddis = (sels[4] || 0) + (sels[5] || 0);

  // Solar generation curve — peaks at 13:00, zero before 6 or after 20
  // Calculated from inverter existence, regardless of monitoring (monitoring only hides the node)
  const hasSolarInverters = solarInverters.length > 0 || libbiPv;
  const peakSolar = cfg.phase === '3ph' ? 10 : 6.6;
  const hr = now.getHours() + now.getMinutes() / 60;
  const rawSolar = (hr >= 6 && hr <= 20) ? peakSolar * Math.sin(Math.PI * (hr - 6) / 14) : 0;
  const effectiveSolar = hasSolarInverters ? Math.round(Math.max(0, rawSolar) * 10) / 10 : 0;

  const houseKw  = 0.4;
  const zappiMax = (cfg.phase === '3ph' && !zappiSinglePhase) ? 11 : 7.2;
  const zappiMin = (cfg.phase === '3ph' && !zappiSinglePhase) ? 4.2 : 1.4;
  const gloMax = 7.2, eddiMax = 3.6;
  const libbiKw = hasLibbi ? libbi2Summary(cfg.libbi2).dischargeKW : 0;
  const r1 = v => Math.round(v * 10) / 10;
  const zm = modes.zappi, gm = modes.glo, em = modes.eddi, lm = modes.libbi;

  // ── Power flow for the selected modes and priority order ───────
  // Full-power loads first. Then spare solar goes down the priority list
  // (support.myenergi.com "Setting Device Priorities"): priority 1 uses it
  // first, devices sharing a priority split it. An EV charger needs ~1.4 kW
  // to start, so when eddi sits above it eddi diverts until there's enough,
  // then the charger takes over and eddi gets what's left.
  let surplus = r1(effectiveSolar - houseKw);
  const present = { zappi: nZappi, glo: nGlo, eddi: numEddis, libbi: hasLibbi ? 1 : 0 };
  const typeOf = u => u.split('#')[0];
  const allUnits = ['eddi', 'zappi', 'glo', 'libbi'].flatMap(t => Array.from({ length: present[t] }, (_, i) => `${t}#${i + 1}`));
  const kept = priority.map(g => g.filter(u => allUnits.includes(u))).filter(g => g.length);
  const knownUnits = new Set(kept.flat());
  const pGroups = [...kept, ...allUnits.filter(u => !knownUnits.has(u)).map(u => [u])];

  const fixed = { zappi: zm === 'FAST' || zm === 'BOOST', glo: gm === 'SMART OFF', eddi: em === 'BOOST', libbi: false };
  const takes = { zappi: zm === 'ECO' || zm === 'ECO+', glo: gm === 'SMART ON', eddi: em === 'NORMAL', libbi: lm === 'NORMAL' };
  const evMin = { zappi: zappiMin, glo: 1.4 };
  const cap = { zappi: zappiMax, glo: gloMax, eddi: eddiMax, libbi: libbiKw };
  const isEv = u => typeOf(u) === 'zappi' || typeOf(u) === 'glo';
  const kwOf = {}, pausedOf = {};
  allUnits.forEach(u => { const t = typeOf(u); kwOf[u] = fixed[t] ? cap[t] : 0; surplus = r1(surplus - kwOf[u]); });

  // eddi hands over to lower-priority EV chargers once there's enough to start one
  const order = [];
  pGroups.forEach((g, gi) => {
    if (g.some(u => typeOf(u) === 'eddi') && takes.eddi) {
      const evsBelow = pGroups.slice(gi + 1).map(x => x.filter(u => isEv(u) && takes[typeOf(u)])).filter(x => x.length);
      const evs = evsBelow.flat();
      if (evs.length && surplus >= Math.min(...evs.map(u => evMin[typeOf(u)]))) { order.push(...evsBelow); order.push(g); return; }
    }
    order.push(g);
  });
  const seenU = new Set();
  const finalOrder = order.map(g => g.filter(u => !seenU.has(u) && seenU.add(u))).filter(g => g.length);

  let batCharge = 0;
  finalOrder.forEach(g => {
    const active = g.filter(u => takes[typeOf(u)] && !fixed[typeOf(u)]);
    if (!active.length) return;
    const shareEach = Math.max(0, surplus) / active.length;
    active.forEach(u => {
      const t = typeOf(u);
      let each = Math.min(r1(shareEach), cap[t]);
      if (isEv(u) && each < evMin[t]) {
        if (t === 'zappi' && zm === 'ECO') each = evMin.zappi;   // ECO tops up from the grid
        else { each = 0; pausedOf[u] = true; }
      }
      kwOf[u] = each;
      if (t === 'libbi') batCharge = each;
      surplus = r1(surplus - each);
    });
  });

  let batDischarge = 0;
  if (hasLibbi && lm === 'NORMAL' && surplus < 0 && batCharge === 0) {
    batDischarge = Math.min(-surplus, libbiKw, houseKw); surplus = r1(surplus + batDischarge);
  } else if (hasLibbi && lm === 'EXPORT') {
    batDischarge = libbiKw; surplus = r1(surplus + batDischarge);
  }
  const gridExport = Math.max(0, surplus);
  const gridKw = Math.max(0, -surplus);
  const totalLoad = r1(houseKw + allUnits.filter(u => typeOf(u) !== 'libbi').reduce((t, u) => t + kwOf[u], 0));

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

  // libbi 2 state of charge (illustrative): low overnight, fills through the day
  const socPts = [[0, 45], [6, 25], [9, 30], [15, 95], [18, 90], [24, 45]];
  const soc = (() => { for (let i = 1; i < socPts.length; i++) { const [h0, v0] = socPts[i - 1], [h1, v1] = socPts[i]; if (hr <= h1) return Math.round(v0 + (v1 - v0) * (hr - h0) / (h1 - h0)); } return 45; })();

  // Build nodes, clockwise from top centre: Home, Grid, Solar, Solar &
  // Battery (hybrid), AC coupled battery, then the myenergi devices from the
  // lowest priority up, so priority 1 sits just left of the home.
  const deviceNode = u => {
    const t = typeOf(u);
    if (t === 'libbi') return { key: u, type: 'libbi', color: '#FF9234', flow: batDischarge > 0 ? 'in' : 'out', kw: batDischarge || batCharge, soc, stopped: lm === 'STOP' };
    if (t === 'eddi') return { key: u, type: 'eddi', color: '#00E6C0', flow: 'out', kw: kwOf[u], stopped: em === 'STOP' };
    return { key: u, type: 'zappi', color: '#0086FF', flow: 'out', kw: kwOf[u], paused: !!pausedOf[u], stopped: t === 'zappi' && zm === 'STOP' };
  };
  const nodes = [{ key: 'home', type: 'home', color: '#F91CDF', flow: 'out', kw: houseKw }];
  nodes.push({ key: 'grid', type: 'grid', color: '#FF4400', flow: gridExporting ? 'out' : 'in', kw: gridExporting ? gridExport : gridKw });
  if (hasSolarOnly)    nodes.push({ key: 'solar', type: 'solar', color: '#55FF00', flow: 'in', kw: effectiveSolar });
  if (hasGenBat)       nodes.push({ key: 'genBattery', type: 'genBattery', color: '#55FF00', flow: 'in', kw: effectiveSolar });
  if (showBatteryNode) nodes.push({ key: 'battery', type: 'battery', color: '#FF9234', flow: 'out', kw: 0 });
  nodes.push(...pGroups.flat().map(deviceNode).reverse());

  // Spokes sweep to their new angles, like clock hands, when the order changes
  const targetAngle = Object.fromEntries(nodes.map((nd, i) => [nd.key, (i * 2 * Math.PI) / nodes.length]));
  const orderSig = nodes.map(n => n.key).join('|');
  useEffect(() => {
    const from = { ...anglesRef.current };
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const deltas = Object.fromEntries(Object.entries(targetAngle).map(([k, to]) => {
      const start = from[k] ?? to;
      let d = (to - start) % (2 * Math.PI);
      if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
      return [k, [start, d]];
    }));
    if (reduce || Object.values(deltas).every(([, d]) => Math.abs(d) < 1e-6)) {
      anglesRef.current = { ...targetAngle }; setSpin(t => t + 1); return;
    }
    const DUR = 650, t0 = performance.now();
    let raf;
    const step = now => {
      const t = Math.min(1, (now - t0) / DUR), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      anglesRef.current = Object.fromEntries(Object.entries(deltas).map(([k, [a, d]]) => [k, a + d * e]));
      setSpin(x => x + 1);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [orderSig]); // eslint-disable-line react-hooks/exhaustive-deps

  const HX = 187, HY = 352, R = 125;
  const placed = nodes.map(nd => {
    const rad = anglesRef.current[nd.key] ?? targetAngle[nd.key];
    return { ...nd, cx: HX + R * Math.sin(rad), cy: HY - R * Math.cos(rad) };
  });

  // kW label: directly above circle if node is above centre, below if at/below centre
  const kwPos = nd => nd.cy <= HY
    ? { x: nd.cx, y: nd.cy - 46, anchor: 'middle' }
    : { x: nd.cx, y: nd.cy + 56, anchor: 'middle' };

  return (
    <>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center', gap: 16, width: '100%' }}>
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
            <g key={nd.key}>
              <circle cx={nd.cx} cy={nd.cy} r="31" fill="#303030" stroke={nd.color} strokeWidth="2"/>
              {nd.type === 'libbi' ? (
                <g>
                  {/* libbi 2: battery whose white bars show state of charge */}
                  <rect x={nd.cx - 17} y={nd.cy - 10} width={31} height={20} rx={3} fill="none" stroke="white" strokeWidth={1.8}/>
                  <rect x={nd.cx + 14} y={nd.cy - 4} width={3.5} height={8} rx={1} fill="white"/>
                  {[0, 1, 2, 3].map(b => (
                    <rect key={b} x={nd.cx - 14 + b * 7} y={nd.cy - 7} width={5} height={14} rx={1}
                      fill="white" opacity={nd.soc > b * 25 ? 1 : 0.15}/>
                  ))}
                  <text x={nd.cx} y={nd.cy + 22} textAnchor="middle" fontSize="9" fontWeight="700" fill="white">{nd.soc}%</text>
                </g>
              ) : (
              <g transform={`translate(${dx},${dy})`}>
                <path d={icon.d} fill="white"
                  fillRule={icon.fillRule || "nonzero"}
                  clipRule={icon.fillRule || "nonzero"}/>
              </g>
              )}
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

    </div>

    {/* Priority + how each device works — one card per device type installed */}
    {(() => {
      const LABEL = { zappi: 'zappi', glo: 'GLO', eddi: 'eddi', libbi: 'libbi 2' };
      const WHAT = {
        zappi: 'Charges your EV, using spare solar first. The mode sets how much grid power it may use.',
        glo: 'Charges your EV. With smart charging on it follows spare solar, your schedule and cheaper tariffs.',
        eddi: 'Sends spare solar into your hot water (or heating) instead of exporting it.',
        libbi: `Stores spare solar in the battery and powers your home later${cfg.libbi2?.eps ? ', and keeps chosen circuits on in a power cut' : ''}.`,
      };
      const shown = pGroups;
      const keys = shown.flat();
      const unitLabel = u => `${LABEL[typeOf(u)]}${present[typeOf(u)] > 1 ? ` #${u.split('#')[1]}` : ''}`;
      const move = (key, to) => {
        const all = pGroups.map(g => g.filter(k => k !== key)).filter(g => g.length);
        all.splice(Math.max(0, Math.min(to, all.length)), 0, [key]);
        setPriority(all);
      };
      const share = (key, withKey) => setPriority(pGroups.map(g => g.filter(k => k !== key)).filter(g => g.length).map(g => g.includes(withKey) ? [...g, key] : g));
      const unshare = key => {
        const gi = pGroups.findIndex(g => g.includes(key));
        const out = pGroups.map(g => g.filter(k => k !== key)).filter(g => g.length);
        out.splice(Math.min(gi + 1, out.length), 0, [key]);
        setPriority(out);
      };
      const btn = { background: '#2a2a2a', border: '1px solid #3a3a3a', color: '#ccc', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0 };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: '1 1 260px', minWidth: 0, maxWidth: 520 }}>
          {keys.length > 1 && (
            <div>
              <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4, fontWeight: 700 }}>Who gets priority</div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Drag to reorder. Drop one device onto another to share equally.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {shown.map((g, gi) => (
                  <div key={g.join('+')}>
                    <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (dragKey) move(dragKey, gi); setDragKey(null); }}
                      style={{ height: dragKey ? 10 : 6, borderRadius: 4, background: dragKey ? 'rgba(64,255,122,0.25)' : 'transparent' }}/>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                      <div style={{ width: 26, flexShrink: 0, borderRadius: 8, background: '#40ff7a', color: '#000', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{gi + 1}</div>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, padding: g.length > 1 ? 4 : 0, border: g.length > 1 ? '1px dashed #40ff7a' : 'none', borderRadius: 10 }}>
                        {g.map(k => (
                          <div key={k} draggable onDragStart={() => setDragKey(k)} onDragEnd={() => setDragKey(null)}
                            onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); e.stopPropagation(); if (dragKey && dragKey !== k) share(dragKey, k); setDragKey(null); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', background: dragKey === k ? '#3d3d3d' : '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 8, cursor: 'grab' }}>
                            <span aria-hidden="true" style={{ color: '#777', fontSize: 14, letterSpacing: -2 }}>⋮⋮</span>
                            <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#eee' }}>{unitLabel(k)}</span>
                            {g.length > 1 && <button type="button" style={{ ...btn, width: 'auto', padding: '0 8px', fontSize: 11 }} onClick={() => unshare(k)}>Unshare</button>}
                            <button type="button" aria-label={`Move ${unitLabel(k)} up`} style={btn} disabled={gi === 0 && g.length === 1} onClick={() => move(k, gi === 0 ? 0 : gi - 1)}>▲</button>
                            <button type="button" aria-label={`Move ${unitLabel(k)} down`} style={btn} disabled={gi === shown.length - 1 && g.length === 1} onClick={() => move(k, gi + 1)}>▼</button>
                          </div>
                        ))}
                        {g.length > 1 && <div style={{ fontSize: 11, color: '#40ff7a', paddingLeft: 4 }}>Sharing spare solar equally</div>}
                      </div>
                    </div>
                  </div>
                ))}
                <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (dragKey) move(dragKey, shown.length); setDragKey(null); }}
                  style={{ height: dragKey ? 10 : 0, borderRadius: 4, background: dragKey ? 'rgba(64,255,122,0.25)' : 'transparent', marginTop: 4 }}/>
              </div>
            </div>
          )}

          {[['zappi', nZappi], ['glo', nGlo], ['eddi', numEddis], ['libbi', hasLibbi ? 1 : 0]].filter(([, n]) => n > 0).map(([dev]) => {
            const def = DEVICE_MODES[dev], cur = modes[dev];
            return (
              <div key={dev} style={{ background: '#222', border: '1px solid #333', borderRadius: 10, padding: '12px 12px 10px' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{def.label}</div>
                <div style={{ fontSize: 12, color: '#bbb', margin: '2px 0 8px', lineHeight: 1.45 }}>{WHAT[dev]}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.entries(def.modes).map(([m, { bg, fg }]) => (
                    <button key={m} type="button" onClick={() => setMode(dev, m)} aria-pressed={cur === m} style={{
                      background: cur === m ? bg : '#232323', color: cur === m ? fg : '#777',
                      border: `1px solid ${cur === m ? bg : '#3a3a3a'}`, borderRadius: 999, padding: '7px 13px',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.06em',
                    }}>{m}</button>
                  ))}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>{def.modes[cur].desc}</p>
              </div>
            );
          })}
        </div>
      );
    })()}
    </>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState({
    phase: null, inverters: [], batteries: [], selections: {},
    eddiAppliances: {}, backupCircuits: [],
    existing: {}, // { [productId]: true } — already installed: kept in the system design, left off the bill of materials
    libbi2: DEFAULT_LIBBI2, region: "aunz",
  });
  const [wireless, setWireless] = useState(false);
  const [zappiSinglePhase, setZappiSinglePhase] = useState(false);
  const [monitorSolar, setMonitorSolar] = useState(true);
  const [monitorBattery, setMonitorBattery] = useState(true);
  const [controllerProductId, setControllerProductId] = useState(2);
  const [mainSwitchSplit, setMainSwitchSplit] = useState(false);
  const [notes, setNotes] = useState("");

  // GLO defaults to the simple case — no solar monitoring, hard-wired CTs —
  // rather than inheriting the global monitorSolar/wireless defaults meant
  // for zappi. Only resets on the transition to GLO, so a manual override
  // afterward sticks until the controller changes again.
  useEffect(() => {
    if (controllerProductId === 3) { setMonitorSolar(false); setWireless(false); }
  }, [controllerProductId]);

  const setPhase = v => setCfg(c => ({ ...c, phase: v }));
  const setLibbi2 = v => { setCfg(c => ({ ...c, libbi2: v })); if (v.csip) setControllerProductId(6); };
  const toggleBackupCircuit = circuit => setCfg(c => ({ ...c, backupCircuits: c.backupCircuits.includes(circuit) ? c.backupCircuits.filter(x => x !== circuit) : [...c.backupCircuits, circuit] }));
  const setInverters = fn => setCfg(c => ({ ...c, inverters: fn(c.inverters) }));
  const setBatteries = fn => setCfg(c => {
    const next = fn(c.batteries);
    return { ...c, batteries: next };
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
        .tab-panel { display: block !important; margin-bottom: 18px; }
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

  const STEPS = ["Your Property", "myenergi Devices", "Your System"];
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
    const maxQty = PRODUCTS.find(p => p.id === id)?.maxQty;
    if (maxQty && (cfg.selections[id] || 0) >= maxQty) return;
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
      return { ...c, selections: { ...c.selections, [id]: newQty }, eddiAppliances: newAppl, existing: newQty === 0 ? { ...c.existing, [id]: false } : c.existing };
    });
    if (newQty === 0 && id === controllerProductId) {
      const remaining = PRODUCTS.find(p => p.id !== id && (cfg.selections[p.id]||0) > 0);
      setControllerProductId(remaining ? remaining.id : 2);
    }
  };

  const goToResults = () => setStep(2);
  const resetAll = () => {
    setStep(0);
    setCfg({ phase: null, inverters: [], batteries: [], selections: {}, eddiAppliances: {}, backupCircuits: [], existing: {}, libbi2: DEFAULT_LIBBI2, region: "aunz" });
    setWireless(false); setMonitorSolar(true); setMonitorBattery(true); setControllerProductId(2); setMainSwitchSplit(false); setNotes("");
  };

  const [view, setView] = useState("customer");
  const [tab, setTab] = useState("overview");
  const [openDesc, setOpenDesc] = useState(null);

  const stepHeader = (n, title, intro) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Step {n} of 3</div>
      <h2 style={{ margin: "4px 0 4px", color: "#fff", fontWeight: 800, fontStyle: "italic", fontSize: 24 }}>{title}</h2>
      {intro && <p style={{ margin: 0, fontSize: 13, color: MUTED }}>{intro}</p>}
    </div>
  );
  const stickyNav = children => (
    <div className="no-print" style={{ position: "sticky", bottom: 0, zIndex: 5, margin: "24px -24px 0", padding: "12px 24px calc(12px + env(safe-area-inset-bottom, 0px))", background: "rgba(0,0,0,0.92)", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      {children}
    </div>
  );

  return (
    <div id="sb-app" style={{
      background: DARK, minHeight: "100vh", fontFamily: "'Overpass', sans-serif",
      color: "#ddd", maxWidth: 680, margin: "0 auto",
      colorScheme: "dark",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Overpass:ital,wght@0,300;0,700;1,800&display=swap" rel="stylesheet"/>

      {/* Step bar */}
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
            {i < step ? `✓ ${s}` : `${i + 1}. ${s}`}
          </div>
        ))}
      </div>

      <div style={{ padding: "24px 24px 0" }}>

        {/* ── STEP 1 — Your Property ─────────────────────────────────────────── */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              {stepHeader(1, "Your Property", "Your power supply and any solar or batteries from other brands.")}
              <InfoNote>
                Add solar inverters and batteries from other brands here.<br/>
                Don't add myenergi devices on this page. You'll add those on the next page, including any you already have.
              </InfoNote>
            </div>

            <div>
              <SectionHead tip="phase">Power supply</SectionHead>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <PicCard active={cfg.phase === "1ph"} onClick={() => setPhase("1ph")} title="Single phase" sub="Most homes"><PhaseIcon n={1}/></PicCard>
                <PicCard active={cfg.phase === "3ph"} onClick={() => setPhase("3ph")} title="Three phase" sub="Larger homes and farms"><PhaseIcon n={3}/></PicCard>
              </div>
              <button type="button" onClick={() => setPhase("2ph")} style={{ marginTop: 8, background: "none", border: "none", padding: 0, color: cfg.phase === "2ph" ? G_TXT : MUTED, fontSize: 12, textDecoration: "underline", cursor: "pointer", fontFamily: "inherit" }}>
                {cfg.phase === "2ph" ? "✓ Two phase selected" : "Other: two phase"}
              </button>
              {cfg.phase === "2ph" && <div style={{ marginTop: 8 }}><InfoNote tone="warn">Two phase isn't a standard setup. Contact myenergi support before installing.</InfoNote></div>}
            </div>

            <div>
              <SectionHead>Region</SectionHead>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {REGIONS.map(r => <SelBtn key={r.id} active={cfg.region === r.id} onClick={() => setCfg(c => ({ ...c, region: r.id, libbi2: { ...c.libbi2, csip: r.id === "aunz" && c.libbi2.csip } }))}>{r.label}</SelBtn>)}
              </div>
            </div>

            <div>
              <SectionHead>Solar (other brands)</SectionHead>
              <div style={{ marginBottom: 8 }}>
                <Checkbox checked={cfg.noSolar || false}
                  onChange={() => setCfg(c => ({ ...c, noSolar: !c.noSolar, inverters: !c.noSolar ? [] : c.inverters }))}
                  label="No solar installed yet"/>
              </div>
              {!cfg.noSolar && <>
                {cfg.inverters.map((inv, i) => (
                  <InverterCard key={inv.uid} inv={inv} phase={cfg.phase}
                    onChange={updated => setInverters(prev => prev.map((x, j) => j === i ? updated : x))}
                    onRemove={() => setInverters(prev => prev.filter((_, j) => j !== i))}/>
                ))}
                {cfg.inverters.length < 3 && <AddBtn onClick={() => setInverters(prev => [...prev, newInv()])}>{cfg.inverters.length === 0 ? "Add solar inverter" : "Add another inverter"}</AddBtn>}
              </>}
            </div>

            <div>
              <SectionHead tipText="A battery with its own inverter that connects to the switchboard (AC coupled), such as Tesla Powerwall 2. Batteries that share the solar inverter are added on the solar card above.">Separate battery (other brands)</SectionHead>
              {cfg.batteries.map((bat, i) => (
                <BatteryCard key={bat.uid} bat={bat}
                  onChange={updated => setBatteries(prev => prev.map((x, j) => j === i ? updated : x))}
                  onRemove={() => setBatteries(prev => prev.filter((_, j) => j !== i))}/>
              ))}
              {cfg.batteries.length < 3 && (
                <AddBtn onClick={() => setBatteries(prev => [...prev, newBat()])}>
                  {cfg.batteries.length === 0 ? "Add battery" : "Add another battery"}
                </AddBtn>
              )}
            </div>

            {stickyNav(<>
              <NextBtn onClick={() => setStep(1)} disabled={!step0ok}>Next: myenergi devices →</NextBtn>
              {!step0ok && <span style={{ fontSize: 12, color: MUTED }}>Choose your power supply to continue</span>}
            </>)}
          </div>
        )}

        {/* ── STEP 2 — myenergi Devices ──────────────────────────────────────── */}
        {step === 1 && (() => {
          const totalDevices = Object.values(cfg.selections).reduce((s, q) => s + q, 0);
          const atLimit = totalDevices >= 5;
          return (
            <div>
              {stepHeader(2, "myenergi Devices", "Add every myenergi device on site, new or already installed.")}
              <div style={{ marginBottom: 12, fontSize: 12, color: atLimit ? WARN : MUTED }}>
                {totalDevices} of 5 devices{atLimit ? " (maximum reached)" : ""}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PRODUCTS.map(p => {
                  const qty = cfg.selections[p.id] || 0;
                  const imgUrl = ICON_URLS[p.name] || ICON_URLS[p.friendlyName];
                  const isActive = qty > 0;
                  const maxed = atLimit || (p.maxQty && qty >= p.maxQty);
                  return (
                    <div key={p.id}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "12px 14px", background: isActive ? "rgba(64,255,122,0.07)" : CARD,
                        border: `1px solid ${isActive ? G : BORDER}`, borderRadius: 10,
                      }}>
                        <div style={{ width: 56, height: 56, background: "#ececec", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", padding: 6, boxSizing: "border-box" }}>
                          {imgUrl && <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }}/>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 17, color: isActive ? G_TXT : "#fff", fontWeight: 800, lineHeight: 1.2 }}>
                            {p.friendlyName}
                            <button type="button" aria-label={`About ${p.friendlyName}`} aria-expanded={openDesc === p.id} onClick={() => setOpenDesc(o => o === p.id ? null : p.id)}
                              style={{ marginLeft: 6, width: 18, height: 18, borderRadius: 999, border: "1px solid #666", background: "transparent", color: "#aaa", fontSize: 11, fontWeight: 700, padding: 0, cursor: "pointer", fontFamily: "Georgia, serif", verticalAlign: "middle" }}>i</button>
                          </div>
                          <div style={{ fontSize: 13, color: isActive ? G_TXT : MUTED }}>{p.tagline}</div>
                          {isActive && (
                            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: cfg.existing[p.id] ? "#fff" : MUTED, cursor: "pointer" }}>
                              <input type="checkbox" checked={!!cfg.existing[p.id]} onChange={() => setCfg(c => ({ ...c, existing: { ...c.existing, [p.id]: !c.existing[p.id] } }))} style={{ accentColor: G }}/>
                              Already installed{qty > 1 ? " (all units)" : ""}
                            </label>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <button type="button" aria-label={`Remove ${p.friendlyName}`} onClick={() => decr(p.id)} disabled={qty === 0} style={{ background: "#2a2a2a", border: "none", color: qty ? "#ccc" : "#555", borderRadius: 999, width: 34, height: 34, cursor: qty ? "pointer" : "default", fontSize: 18, lineHeight: 1, fontFamily: "inherit" }}>−</button>
                          <span style={{ width: 18, textAlign: "center", fontSize: 16, color: isActive ? G_TXT : MUTED, fontWeight: 800 }}>{qty}</span>
                          <button type="button" aria-label={`Add ${p.friendlyName}`} onClick={() => incr(p.id)} disabled={maxed} style={{ background: maxed ? "#333" : G, border: "none", color: maxed ? "#666" : "#000", borderRadius: 999, width: 34, height: 34, cursor: maxed ? "not-allowed" : "pointer", fontSize: 18, lineHeight: 1, fontFamily: "inherit" }}>+</button>
                        </div>
                      </div>
                      {openDesc === p.id && <div style={{ margin: "6px 4px 0", fontSize: 12, color: "#bbb", lineHeight: 1.5 }}>{p.desc}</div>}

                      {p.id === 6 && qty > 0 && (
                        <Libbi2Panel value={cfg.libbi2} onChange={setLibbi2} region={cfg.region} phase={cfg.phase}
                          thirdPartyCount={cfg.noSolar ? 0 : cfg.inverters.filter(i => i.brand).length}
                          backupCircuits={cfg.backupCircuits} onToggleCircuit={toggleBackupCircuit}/>
                      )}

                      {p.hasAppliances && qty > 0 && (
                        <div style={{ marginTop: 2, paddingLeft: 4 }}>
                          {Array.from({ length: qty }).map((_, idx) => {
                            const prodKey = String(p.id);
                            const entry = (cfg.eddiAppliances[prodKey] || [])[idx] || { app1: "", app2: "" };
                            return (
                              <EddiApplianceSelector key={idx} unit={p.friendlyName} idx={idx}
                                onChange={{ data: entry, set: (key, val) => setEddiAppliance(prodKey, idx, key, val) }}/>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {stickyNav(<>
                <BackBtn onClick={() => setStep(0)}/>
                <NextBtn onClick={goToResults} disabled={!step1ok}>See my system →</NextBtn>
                {!step1ok && <span style={{ fontSize: 12, color: MUTED }}>Add at least one device</span>}
              </>)}
            </div>
          );
        })()}

        {/* ── STEP 3 — Your System ───────────────────────────────────────────── */}
        {step === 2 && result && (() => {
          const harviTotal = result.harvisNeeded + (effectiveWireless && cfg.phase === "1ph" ? 1 : 0) + (zappiSinglePhase && cfg.phase === "3ph" ? 1 : 0);
          const showZappiSinglePhase = cfg.phase === "3ph" && result.selProds.some(p => p.id === 2 && p.qty > 0);
          const hasNewLibbi = (cfg.selections[6] || 0) > 0;
          const hasBatteryForSplit = result.hasAcBat || hasNewLibbi || cfg.inverters.some(i => i.hasCoupledBat);
          const l2 = hasNewLibbi ? libbi2Summary(cfg.libbi2) : null;
          const thirdPartyInverters = cfg.noSolar ? [] : cfg.inverters.filter(i => i.brand);
          const protection = protectionRows(cfg, result.selProds, harviTotal);
          const diagramConfig = buildDiagramConfig(cfg, effectiveWireless, monitorSolar, monitorBattery, controllerProductId, zappiSinglePhase, mainSwitchSplit);
          const plainEnglish = generatePlainEnglish(result, ctConfig, effectiveWireless, cfg, harviTotal);
          const newProds = result.selProds.filter(p => !cfg.existing[p.id]);
          const existingProds = result.selProds.filter(p => cfg.existing[p.id]);
          const itemsToOrder = newProds.reduce((s, p) => s + p.qty, 0) + harviTotal + result.additionalCTs;
          const isInstaller = view === "installer";
          // Customer view is the app preview only; the installer view adds
          // the design, bill of materials and wiring detail.
          const TABS = isInstaller ? [
            { id: "overview", label: "Overview" },
            { id: "shopping", label: "Bill of Materials" },
            { id: "app", label: "App preview" },
            ...(hasNewLibbi ? [{ id: "install", label: "libbi 2 install" }] : []),
            { id: "protection", label: "Circuit protection" },
            { id: "ct", label: "CT routing" },
          ] : [{ id: "app", label: "App preview" }];
          const activeTab = TABS.some(t => t.id === tab) ? tab : TABS[0].id;
          const batteryIds = [
            ...cfg.inverters.filter(i => i.brand && i.hasCoupledBat && i.coupledBatId).map(i => i.coupledBatId),
            ...cfg.batteries.filter(b => b.id).map(b => b.id),
          ].map(id => parseInt(id));
          const seen = new Set();
          const hasThirdPartyHybrid = thirdPartyInverters.some(i => i.hasCoupledBat);
          const articles = [
            ...(hasThirdPartyHybrid ? [HYBRID_ARTICLE] : []),
            ...batteryIds.flatMap(id => batterySupportArticles(id)).filter(a => a !== GENERAL_BATTERY_ARTICLE),
            ...(batteryIds.length ? [GENERAL_BATTERY_ARTICLE] : []),
          ].filter(a => !seen.has(a.url) && seen.add(a.url));
          const stat = (value, label, col, tip) => (
            <div style={{ padding: "14px 8px", background: CARD, borderRadius: 10, border: `1px solid ${BORDER}`, textAlign: "center", minWidth: 0 }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: col, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
              <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 6 }}>{label}{tip && <Tip term={tip}/>}</div>
            </div>
          );
          const panelStyle = id => ({ display: activeTab === id ? "block" : "none" });
          const chip = (text, col = "#ccc") => <span style={{ background: "#262626", padding: "3px 9px", borderRadius: 999, color: col }}>{text}</span>;

          return (
            <div id="results-page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                {stepHeader(3, "Your System")}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 12 }}>
                  {chip(cfg.phase === "3ph" ? "Three phase" : cfg.phase === "2ph" ? "Two phase" : "Single phase")}
                  {thirdPartyInverters.map((inv, i) => {
                    const cb = inv.hasCoupledBat && inv.coupledBatId ? DC_BATTERIES.find(b => b.id === parseInt(inv.coupledBatId)) : null;
                    return <span key={`i${i}`}>{chip(`${inv.brand}${cb && cb.id !== 99 ? ` + ${cb.label}` : ""}`)}</span>;
                  })}
                  {cfg.batteries.filter(b => b.id).map((bat, i) => { const f = AC_BATTERIES.find(x => x.id === parseInt(bat.id)); return <span key={`b${i}`}>{chip(f?.label)}</span>; })}
                  {l2 && chip(`libbi 2 · ${l2.capacityKWh} kWh${cfg.libbi2.eps ? " · backup" : ""}`, G_TXT)}
                  {existingProds.map(p => <span key={`e${p.id}`}>{chip(`${p.friendlyName} (existing)`, "#999")}</span>)}
                </div>
              </div>

              {/* View switch */}
              <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <ViewSwitch view={view} onChange={setView}/>
                <span style={{ fontSize: 12, color: MUTED }}>{isInstaller ? "Design, materials and wiring detail" : "Installers: switch for the full design"}</span>
              </div>

              {!isInstaller && (
                <p style={{ margin: 0, fontSize: 14, color: "#ccc", lineHeight: 1.5 }}>
                  This is how your system will look in the myenergi app. Try each device's modes, and set which device uses spare solar first.
                </p>
              )}
              {!isInstaller && (thirdPartyInverters.length > 0 || l2?.hasPv || result.hasAcBat) && (
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "2px 16px" }}>
                  {(thirdPartyInverters.length > 0 || l2?.hasPv) && (
                    <ToggleRow checked={monitorSolar} onChange={() => setMonitorSolar(m => !m)} label="Show my solar in the app" tip="monitor"/>
                  )}
                  {result.hasAcBat && (
                    <ToggleRow checked={monitorBattery} onChange={() => setMonitorBattery(m => !m)} label="Show my other battery in the app" tip="monitor"/>
                  )}
                </div>
              )}

              {/* Summary (installer) */}
              {isInstaller && <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                {stat(itemsToOrder, "Items to order", "#fff")}
                {stat(result.totalCTs, "CT clamps", "#fff", "CT")}
                {stat(harviTotal, "harvi", harviTotal > 0 ? YELLOW : MUTED, "harvi")}
              </div>
              {result.is2ph && <InfoNote tone="warn">Two phase isn't a standard setup. Contact myenergi support before installing.</InfoNote>}
              {hasNewLibbi && cfg.libbi2.csip && controllerProductId !== 6 && <InfoNote tone="warn">On a CSIP-AUS site, libbi 2 must be the controller. Change it under Adjust design.</InfoNote>}

              <div style={{ padding: "14px 16px", background: CARD, borderRadius: 10, border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 6 }}>
                {plainEnglish.map((line, i) => (
                  <p key={i} style={{ margin: 0, fontSize: 13, color: "#ccc", lineHeight: 1.55 }}>{line}</p>
                ))}
              </div>
              </>}

              {/* Tabs (installer) */}
              {isInstaller && <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div role="tablist" style={{ display: "flex", gap: 4, overflowX: "auto", borderBottom: `1px solid ${BORDER}` }}>
                  {TABS.map(t => (
                    <button key={t.id} role="tab" type="button" aria-selected={activeTab === t.id} onClick={() => setTab(t.id)}
                      style={{ flexShrink: 0, background: "none", border: "none", borderBottom: `2px solid ${activeTab === t.id ? G : "transparent"}`, color: activeTab === t.id ? G_TXT : "#aaa", padding: "9px 12px", fontSize: 13, fontWeight: activeTab === t.id ? 700 : 400, cursor: "pointer", fontFamily: "inherit", marginBottom: -1 }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>}

              {/* Overview */}
              {isInstaller && <div className="tab-panel" data-active={activeTab === "overview"} style={panelStyle("overview")}>
                <SectionHead>Wiring diagram</SectionHead>
                <Zoomable label="wiring diagram"><Diagram config={diagramConfig}/></Zoomable>
                {isInstaller && <ConductorKey region={cfg.region} phase={cfg.phase}/>}
                {articles.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <SectionHead>Helpful articles</SectionHead>
                    {articles.map(a => (
                      <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: "block", fontSize: 13, color: BLUE, lineHeight: 1.7, textDecoration: "underline" }}>{a.title} ↗</a>
                    ))}
                  </div>
                )}
              </div>}

              {/* Bill of Materials */}
              {isInstaller && <div className="tab-panel" data-active={activeTab === "shopping"} style={panelStyle("shopping")}>
                <SectionHead>Bill of Materials</SectionHead>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {newProds.map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: CARD, borderRadius: 10 }}>
                      <Icon name={p.name}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{p.friendlyName}</div>
                        <div style={{ color: MUTED, fontSize: 12 }}>{p.id === 6 && l2 ? `${l2.inverter.label} inverter · ${l2.modules} × ${l2.moduleKWh} kWh modules` : p.tagline}</div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>×{p.qty}</div>
                    </div>
                  ))}
                  {harviTotal > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: CARD, borderRadius: 10 }}>
                      <Icon name="harvi"/>
                      <div style={{ flex: 1 }}><div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>harvi<Tip term="harvi"/></div><div style={{ color: MUTED, fontSize: 12 }}>Wireless CT sensor</div></div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: YELLOW }}>×{harviTotal}</div>
                    </div>
                  )}
                  {result.additionalCTs > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: CARD, borderRadius: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 6, background: "#262626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#ccc" }}>CT</div>
                      <div style={{ flex: 1 }}><div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Extra CT clamps<Tip term="CT"/></div><div style={{ color: MUTED, fontSize: 12 }}>Not included with your devices</div></div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: WARN }}>×{result.additionalCTs}</div>
                    </div>
                  )}
                  {newProds.length === 0 && harviTotal === 0 && result.additionalCTs === 0 && <div style={{ fontSize: 13, color: MUTED }}>Nothing new to order.</div>}
                </div>
                {existingProds.length > 0 && (
                  <div style={{ marginTop: 14, fontSize: 12, color: MUTED }}>Already installed: {existingProds.map(p => `${p.friendlyName}${p.qty > 1 ? ` ×${p.qty}` : ""}`).join(", ")}</div>
                )}
              </div>}

              {/* App preview */}
              <div className="tab-panel" data-active={activeTab === "app"} style={panelStyle("app")}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: 16, padding: "16px", background: "#111", borderRadius: 12, border: `1px solid ${BORDER}` }}>
                  <AppPreview cfg={cfg} result={result} monitorSolar={monitorSolar} monitorBattery={monitorBattery} zappiSinglePhase={zappiSinglePhase}/>
                </div>
                {!isInstaller && articles.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <SectionHead>Helpful articles</SectionHead>
                    {articles.map(a => (
                      <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: "block", fontSize: 13, color: BLUE, lineHeight: 1.7, textDecoration: "underline" }}>{a.title} ↗</a>
                    ))}
                  </div>
                )}
              </div>

              {/* libbi 2 installation (installer) */}
              {isInstaller && hasNewLibbi && (
                <div className="tab-panel" data-active={activeTab === "install"} style={panelStyle("install")}>
                  <SectionHead>libbi 2 installation diagram</SectionHead>
                  <Zoomable label="libbi 2 installation diagram">
                    <Libbi2InstallDiagram libbi2={cfg.libbi2} region={cfg.region} sitePhase={cfg.phase}
                      hasThirdPartyPv={thirdPartyInverters.length > 0} backupCircuits={cfg.libbi2.eps ? cfg.backupCircuits : []}/>
                  </Zoomable>
                  <div style={{ marginTop: 6, fontSize: 11, color: MUTED }}>Schematic only. The final design must comply with local wiring rules and the libbi 2 installation manual.</div>
                </div>
              )}

              {/* Circuit protection (installer) */}
              {isInstaller && (
                <div className="tab-panel" data-active={activeTab === "protection"} style={panelStyle("protection")}>
                  <SectionHead tipText="Minimum protection for each product's supply. Values marked TBC are still to be confirmed.">Minimum circuit protection</SectionHead>
                  <ProtectionCards rows={protection}/>
                </div>
              )}

              {/* CT routing (installer) */}
              {isInstaller && (
                <div className="tab-panel" data-active={activeTab === "ct"} style={panelStyle("ct")}>
                  <SectionHead tip="CT">CT routing</SectionHead>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr>
                        <th style={th}>Component</th><th style={{ ...th, textAlign: "center", width: 50 }}>CTs</th><th style={th}>Type</th><th style={th}>Input</th><th style={th}>Routing</th>
                      </tr></thead>
                      <tbody>
                        {ctConfig.map((row, i) => (
                          <React.Fragment key={i}>
                            <tr>
                              <td style={{ ...tdr(i), color: "#ccc" }}>{row.component}</td>
                              <td style={{ ...tdr(i), textAlign: "center", color: G_TXT, fontWeight: 700 }}>{row.cts}</td>
                              <td style={{ ...tdr(i), color: BLUE }}>{row.type}</td>
                              <td style={{ ...tdr(i), color: row.routing === "harvi" ? YELLOW : MUTED }}>{row.input}</td>
                              <td style={{ ...tdr(i), color: row.routing === "harvi" ? YELLOW : MUTED }}>
                                {row.routing === "harvi" && effectiveWireless && cfg.phase === "1ph" ? `→ harvi, paired with ${result.master?.friendlyName || "myenergi device"}` : row.routing === "harvi" ? "→ harvi" : "→ wired to myenergi device"}
                              </td>
                            </tr>
                            {row.note && <tr><td colSpan={5} style={{ padding: "6px 10px 10px", background: i % 2 === 0 ? CARD : "#1a1a1a" }}><InfoNote tone="warn">{row.note}</InfoNote></td></tr>}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: MUTED }}>{result.ctsIncluded} CT{result.ctsIncluded !== 1 ? "s" : ""} come with your devices. {result.additionalCTs > 0 ? `${result.additionalCTs} extra needed.` : "No extras needed."}</div>
                </div>
              )}

              {/* Adjust design (installer) */}
              {isInstaller && <details className="no-print" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "4px 16px 10px" }}>
                <summary style={{ cursor: "pointer", padding: "10px 0", fontSize: 14, fontWeight: 700, color: "#fff" }}>Adjust design</summary>
                {result.selProds.length > 1 && (
                  <div style={{ padding: "10px 0", borderBottom: "1px solid #2c2c2c" }}>
                    <div style={{ fontSize: 14, marginBottom: 8 }}>Controller<Tip term="controller"/></div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {result.selProds.map(p => (
                        <SelBtn key={p.id} active={controllerProductId === p.id} onClick={() => setControllerProductId(p.id)}>{p.friendlyName}</SelBtn>
                      ))}
                    </div>
                  </div>
                )}
                {result.hasSolar && <ToggleRow checked={monitorSolar} onChange={() => setMonitorSolar(m => !m)} label="Show solar in the app" tip="monitor"/>}
                {result.hasAcBat && <ToggleRow checked={monitorBattery} onChange={() => setMonitorBattery(m => !m)} label="Show battery in the app" tip="monitor"/>}
                {cfg.phase === "1ph" && (
                  <ToggleRow checked={effectiveWireless} disabled={ctrlForcesWireless} onChange={() => setWireless(w => !w)} label="Wireless CT clamps (harvi)" tip="harvi"
                    note={ctrlForcesWireless ? "Needed: the controller doesn't have enough CT inputs." : null}/>
                )}
                {showZappiSinglePhase && (
                  <ToggleRow checked={zappiSinglePhase} onChange={() => setZappiSinglePhase(z => !z)} label="zappi wired single phase"
                    tipText="Tick if zappi connects to one phase only on a three-phase supply. A harvi then reads all three phases."/>
                )}
                {hasBatteryForSplit && (
                  <ToggleRow checked={mainSwitchSplit} onChange={() => setMainSwitchSplit(s => !s)} label="Charge from grid without draining the battery" tip="split"/>
                )}
              </details>}

              {/* Notes (installer) */}
              {isInstaller && <div>
                <SectionHead>Notes</SectionHead>
                <textarea className="notes-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes for the installation…"
                  style={{ width: "100%", minHeight: 90, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, color: "#ddd", padding: "10px 12px", fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}/>
                <div className="notes-print" style={{ display: "none", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.5, border: "1px solid #ccc", borderRadius: 6, padding: "10px 12px", minHeight: 60 }}>{notes || "—"}</div>
              </div>}

              {stickyNav(<>
                <BackBtn onClick={() => setStep(1)}/>
                <button onClick={resetAll} style={{ background: "none", border: `1px solid ${BORDER}`, color: "#aaa", borderRadius: 999, padding: "11px 20px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Start over</button>
                <button onClick={exportPDF} style={{ background: G, color: "#000", border: "none", borderRadius: 999, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Export PDF</button>
              </>)}
            </div>
          );
        })()}
        <div style={{ height: 24 }}/>
      </div>
    </div>
  );
}
