// ── libbi 2 product data ─────────────────────────────────────────────────────
// Single source of truth for libbi 2 hardware, install options and circuit
// protection. Figures are taken from PM-00043 Rev A (libbi 2 Installation,
// Operation and Maintenance Manual, Aug 2026) — page refs in comments.
//
// Future provisions: a new inverter size or battery module is a new row in
// LIBBI2_INVERTERS / LIBBI2_MODULES. Nothing else in the app hardcodes a
// model, rating or module limit — the wizard, diagrams and protection table
// all read from here. Rows with `available: false` are kept out of the
// wizard until released.

/** Hybrid inverters (manual p.71–72). */
export const LIBBI2_INVERTERS = [
  {
    id: "HS3.6", model: "LIBBI-HS3.6D1-A", label: "3.6 kW",
    ratedOutputW: 3680, maxChargeW: 3600, maxDischargeW: 3900,
    maxBatteryCurrentA: 80, gridMaxInputA: 32, epsRatedA: 16,
    maxPvInputW: 7200, mpptCount: 2, pvMaxV: 500, pvIscA: 25,
    gridBreakerA: 63, epsBreakerA: 32,         // p.32 recommended MCBs
    minModules: 1, maxModules: 8, expansionKitFrom: 5, // p.20, p.73
    available: true,
  },
  {
    id: "HS5", model: "LIBBI-HS5D1-A", label: "5 kW",
    ratedOutputW: 5000, maxChargeW: 5000, maxDischargeW: 5400,
    maxBatteryCurrentA: 120, gridMaxInputA: 40, epsRatedA: 21.7,
    maxPvInputW: 10000, mpptCount: 2, pvMaxV: 500, pvIscA: 25,
    gridBreakerA: 40, epsBreakerA: 32,         // confirmed by product (overrides manual's 63 A)
    minModules: 1, maxModules: 8, expansionKitFrom: 5,
    available: true,
  },
  // Larger sizes — selectable for system design, but specifications are not
  // yet published. Every null below shows as "TBC" in the wizard, diagrams
  // and protection table. Replace with confirmed figures when available.
  ...[8, 10, 12].map(kw => ({
    id: `HS${kw}`, model: null, label: `${kw} kW`, provisional: true,
    ratedOutputW: kw * 1000, maxChargeW: kw * 1000, maxDischargeW: kw * 1000,
    maxBatteryCurrentA: null, gridMaxInputA: null, epsRatedA: null,
    maxPvInputW: null, mpptCount: null, pvMaxV: null, pvIscA: null,
    gridBreakerA: null, epsBreakerA: null,
    minModules: 1, maxModules: 8, expansionKitFrom: 5, // assumed same stack as 3.6/5 kW — TBC
    available: true,
  })),
];

/** "40 A" style, or "TBC" while a figure is unconfirmed. */
export const amps = a => (a == null ? "TBC" : `${a} A`);

/** Battery modules (manual p.73). */
export const LIBBI2_MODULES = [
  { id: "BM5", model: "LIBBI-BM5D1-A", kWh: 5.12, nominalV: 48, maxCurrentA: 80, weightKg: 51, available: true },
];

// Three install choices (manual DC coupled, AC coupled diagram 1 and AC
// coupled diagram 2 respectively).
export const LIBBI2_COUPLING = [
  { id: "dc",     label: "Connect solar to libbi 2", sub: "DC coupled", help: "New solar strings connect straight to the libbi 2 PV1/PV2 inputs." },
  { id: "ac",     label: "Use existing solar",       sub: "AC coupled", help: "No solar on libbi 2. It connects to the switchboard and stores surplus from the existing solar inverter, or charges from the grid." },
  { id: "hybrid", label: "Hybrid",                   sub: "New solar + existing solar", help: "New solar strings on libbi 2, and the existing solar inverter stays connected to the switchboard." },
];

/** The coupling as nominated: "dc" | "ac" | "hybrid". */
export const effectiveCoupling = c => (["dc", "ac", "hybrid"].includes(c.coupling) ? c.coupling : "dc");

export const COUPLING_LABELS = { dc: "DC coupled", ac: "AC coupled", hybrid: "Hybrid" };

/** Listed in wizard order. Region drives earthing arrangement and grid-code list (manual p.18–19, p.76). */
export const REGIONS = [
  {
    id: "gbeu", label: "GB / Ireland / Europe",
    gridCodes: ["U.K.", "Germany", "Italy CEI0-21", "Spain", "Belgium", "Hungary"],
    // Harmonised (IEC 60446 / BS 7671) colours: lines brown / black / grey, neutral blue
    conductors: { L: ["#8b4a1c", "#111111", "#8c8c8c"], N: "#2f6fd6", names: ["Brown", "Black", "Grey"], nName: "Blue" },
    earthingNotes: [
      "No N–PE link in the distribution board. EPS neutral is kept separate from the grid neutral.",
      "Connect the EPS protective earth securely, or EPS may fail during an outage.",
      "Normal loads use a double-pole isolator. DRM port can connect an RRCR.",
    ],
  },
  {
    id: "aunz", label: "Australia / New Zealand",
    gridCodes: ["AUS A", "AUS B", "AUS C", "New Zealand"],
    // AS/NZS 3000 conductor colours: actives red / white / blue, neutral black
    conductors: { L: ["#d4202a", "#ffffff", "#1f5bd6"], N: "#111111", names: ["Red", "White", "Blue"], nName: "Black" },
    earthingNotes: [
      "MEN system: N and PE are linked at the main switchboard (AS/NZS 3000).",
      "EPS neutral returns to the main neutral bar. Leave the EPS connector PE pin unwired where N and PE are linked (manual Fig 3-11).",
      "DRM port can connect a DRED (AS/NZS 4777.2).",
    ],
  },
];

export const DEFAULT_LIBBI2 = { inverterId: "HS5", moduleId: "BM5", modules: 2, coupling: "dc", eps: false, csip: false };

export const BACKUP_CIRCUIT_OPTIONS = ["Lights", "Refrigeration", "Communications", "Security", "Essential sockets", "Other essential load"];

export const findInverter = id => LIBBI2_INVERTERS.find(i => i.id === id) || LIBBI2_INVERTERS.find(i => i.available);
export const findModule   = id => LIBBI2_MODULES.find(m => m.id === id) || LIBBI2_MODULES[0];

const round1 = v => Math.round(v * 10) / 10;

/** Derived figures for a libbi 2 configuration. */
export function libbi2Summary(c = DEFAULT_LIBBI2) {
  const inverter = findInverter(c.inverterId);
  const module = findModule(c.moduleId);
  const modules = Math.min(Math.max(c.modules || inverter.minModules, inverter.minModules), inverter.maxModules);
  // Modules run in parallel on the 48 V bus, so their current limits add.
  const batteryLimitW = modules * module.maxCurrentA * module.nominalV;
  const dischargeW = Math.min(inverter.maxDischargeW, batteryLimitW);
  return {
    inverter, module, modules,
    // Shown rounded to whole kWh per module (5.12 → 5), so 5, 10, 15, 20 kWh…
    moduleKWh: Math.round(module.kWh),
    capacityKWh: modules * Math.round(module.kWh),
    dischargeKW: round1(dischargeW / 1000),
    batteryLimited: batteryLimitW < inverter.maxDischargeW,
    needsExpansionKit: modules >= inverter.expansionKitFrom,
    hasPv: c.coupling !== "ac",
  };
}

/** Checks the nominated coupling against the solar entered on the property step. */
export function libbi2Warnings(c, thirdPartyInverterCount) {
  const w = [];
  if (c.coupling === "ac" && thirdPartyInverterCount === 0)
    w.push("No existing solar inverter is entered on the Your Property step, so libbi 2 can only charge from the grid. Add the existing inverter there if there is one.");
  if (c.coupling === "hybrid" && thirdPartyInverterCount === 0)
    w.push("Hybrid needs the existing solar inverter. Add it on the Your Property step.");
  if (c.coupling === "dc" && thirdPartyInverterCount > 0)
    w.push("An existing solar inverter is entered on the Your Property step. Choose Hybrid to keep it connected.");
  const s = libbi2Summary(c);
  if (s.batteryLimited)
    w.push(`With ${s.modules} module${s.modules > 1 ? "s" : ""}, discharge is limited by the battery to about ${s.dischargeKW} kW (inverter max ${s.inverter.maxDischargeW / 1000} kW).`);
  return w;
}

/** Minimum circuit protection rows for libbi 2 (manual p.6, p.9, p.30–33, p.40). */
export function libbi2ProtectionRows(c) {
  const { inverter, hasPv } = libbi2Summary(c);
  const rows = [
    { product: "libbi 2", circuit: "Grid (ON-GRID) port", breaker: inverter.gridBreakerA == null ? "TBC" : `${inverter.gridBreakerA} A MCB, 230 V, 6 kA`, rcd: "300 mA Type A, bi-directional", cable: inverter.provisional ? "TBC" : "6–10 mm² Cu" },
  ];
  if (c.eps) rows.push({ product: "libbi 2", circuit: "EPS port → backup loads", breaker: inverter.epsBreakerA == null ? "TBC" : `${inverter.epsBreakerA} A MCB, 230 V, 6 kA`, rcd: "300 mA Type A, bi-directional", cable: inverter.provisional ? "TBC" : "4–6 mm² Cu (6 mm² recommended)" });
  rows.push({ product: "libbi 2 controller", circuit: "Controller supply (L1, not from EPS)", breaker: "3 A MCB recommended (6 A max)", rcd: "Type A", cable: "1.5 mm² min, 300 V rated" });
  if (hasPv) rows.push({ product: "libbi 2", circuit: "PV strings → PV1 / PV2", breaker: inverter.pvMaxV == null ? "TBC" : `DC isolator ≥ ${inverter.pvMaxV} V DC, ≥ ${inverter.pvIscA} A per string`, rcd: "—", cable: "4 mm² PV cable (2.5–4 mm²)" });
  rows.push({ product: "libbi 2", circuit: "Chassis protective earth", breaker: "—", rcd: "—", cable: "6 mm² Cu min, ring terminal to main earth bar" });
  return rows;
}

export const EARTH_GREEN = "#2e9e4f", EARTH_YELLOW = "#e8c300";

/** Conductor colours for a region: { L: [L1, L2, L3], N, names, nName }. */
export const conductorColours = regionId => (REGIONS.find(r => r.id === regionId) || REGIONS.find(r => r.id === "aunz")).conductors;
