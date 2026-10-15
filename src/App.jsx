import { useState } from "react";
import mainSbImgUrl from "./main switchboard.svg";
import gridImgUrl   from "./grid.svg";
import { computeSecondaryRow, computeViewBox, computeMainSwitchFork, computeSatelliteAttachment } from "./diagram/layout/index.js";
import { DEVICE_REGISTRY } from "./diagram/deviceRegistry.js";
import { Libbi2InstallDiagram } from "./diagram/Libbi2InstallDiagram.jsx";
import { conductorColours } from "./libbi2.js";
import { SolarPanel } from "./diagram/SolarPanel.jsx";

const G     = "#40ff7a";   // myenergi green (borders)
const G_TXT = "#1a6b35";   // dark green text (readable on white diagram bg)
const DARK  = "#ffffff";   // diagram background — white (inverted from page)
const YELLOW= "#cc006a";   // harvi / Accent 2 (darkened for white bg legibility)
const WHITE = "#111111";   // power lines — black on white
const MUTED = "#888";
const CT_COL= "#555";
const SIG   = "#999";
const BOX_BG= "#f0f0f0";   // infrastructure box fill — light grey
const phSp  = 7;

const CONFIGS = {
  "1ph · solar":        { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}],  ab:[],          wl:false, pr:["zappi"] },
  "1ph · DC hybrid":    { sp:"1ph", inv:[{ph:"1ph",dc:true, db:true, ms:true}],  ab:[],          wl:false, pr:["zappi"] },
  "1ph · AC battery":   { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}],  ab:[{mb:true}], wl:false, pr:["zappi"] },
  "1ph · wireless":     { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}],  ab:[],          wl:true,  pr:["zappi"] },
  "3ph · solar":        { sp:"3ph", inv:[{ph:"3ph",dc:false,db:false,ms:true}],  ab:[],          wl:false, pr:["zappi"] },
  "3ph · solar (GB/EU)": { sp:"3ph", inv:[{ph:"3ph",dc:false,db:false,ms:true}],  ab:[],          wl:false, pr:["zappi"], region:"gbeu" },
  "1ph · libbi 2 DC (GB/EU)": { sp:"1ph", inv:[], ab:[], wl:false, pr:["libbi 2","zappi"], region:"gbeu", libbiPv:true },
  "3ph · wireless":     { sp:"3ph", inv:[{ph:"3ph",dc:false,db:false,ms:true}],  ab:[],          wl:true,  pr:["zappi"] },
  "3ph · 1ph device":  { sp:"3ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}],  ab:[],          wl:true,  pr:["zappi"], threePhaseDevices:[] },
  "2×1ph no wireless":  { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true},{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi"] },
  "2×1ph wireless":     { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true},{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:true,  pr:["zappi"] },
  "3ph+1ph mix":        { sp:"3ph", inv:[{ph:"3ph",dc:true,db:true,ms:true},{ph:"1ph",dc:false,db:false,ms:true}],  ab:[], wl:false, pr:["zappi"] },
  "multi-dev ×3":       { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}],  ab:[],          wl:false, pr:["zappi","eddi","libbi 2"] },
  "full mix":           { sp:"3ph", inv:[{ph:"3ph",dc:true,db:true,ms:true},{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","eddi","libbi 2"] },
  "1ph · libbi 2 AC":        { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["libbi 2","zappi"] },
  "1ph · libbi 2 DC":        { sp:"1ph", inv:[], ab:[], wl:false, pr:["libbi 2","zappi"], libbiPv:true },
  "1ph · libbi 2 hybrid":    { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true,label:"Fronius"}], ab:[], wl:false, pr:["libbi 2","zappi"], libbiPv:true },
  "3ph · libbi 2 DC":        { sp:"3ph", inv:[], ab:[], wl:false, pr:["libbi 2"], libbiPv:true },
  "1ph · main switch split": { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[{mb:true}], wl:false, pr:["zappi"], mainSwitchSplit:true },
  "GLO solo":                { sp:"1ph", inv:[], ab:[], wl:false, pr:["GLO"] },
  "GLO + solar (hardwired)": { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["GLO"] },
  "GLO + battery (at cap)":  { sp:"1ph", inv:[], ab:[{mb:true}], wl:false, pr:["GLO"] },
  "GLO + solar + battery (forced wireless)": { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[{mb:true}], wl:true, pr:["GLO"] },
  "3ph GLO":                 { sp:"3ph", inv:[{ph:"3ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["GLO"], ctrlCtsSupported:2 },
  "eddi + appliances":       { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["eddi"], appliancesList:[{device:"eddi",app1:"hot-water",app2:"underfloor"}] },
  "eddi+ 3ph + battery":     { sp:"3ph", inv:[], ab:[{mb:true}], wl:false, pr:["eddi+"] },
  "3ph · main switch split (DC hybrid)": { sp:"3ph", inv:[{ph:"3ph",dc:true,db:true,ms:true}], ab:[], wl:false, pr:["zappi"], mainSwitchSplit:true },
  "3ph · main switch split + AC battery": { sp:"3ph", inv:[{ph:"3ph",dc:false,db:false,ms:true}], ab:[{mb:true}], wl:false, pr:["zappi"], mainSwitchSplit:true },
  "1ph · main switch split, battery only": { sp:"1ph", inv:[], ab:[{mb:true}], wl:false, pr:["zappi"], mainSwitchSplit:true },
  "1ph · main switch split + multi device": { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[{mb:true}], wl:false, pr:["zappi","eddi","libbi 2"], mainSwitchSplit:true },
  "2ph · main switch split + battery": { sp:"2ph", inv:[{ph:"2ph",dc:false,db:false,ms:true}], ab:[{mb:true}], wl:false, pr:["zappi"], mainSwitchSplit:true },
  "multi-dev ×5 (max)":      { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","eddi","eddi+","GLO","libbi 2"] },
  "GLO as secondary":        { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","GLO"] },
  "2× zappi":                { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","zappi"] },
  "3× zappi + eddi":         { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","zappi","zappi","eddi"] },
  "2× GLO":                  { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","GLO","GLO"] },
  "3ph · zappi + eddi + libbi 2": { sp:"3ph", inv:[{ph:"3ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["libbi 2","zappi","eddi"], libbiPv:true },
  "1ph · eddi gateway + zappi + libbi 2 split": { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["eddi","zappi","libbi 2"], mainSwitchSplit:true, appliancesList:[{device:"eddi",app1:"hot-water",app2:"underfloor"}] },
  "3ph · zappi + eddi + GLO":     { sp:"3ph", inv:[{ph:"3ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","eddi","GLO"] },
};

// libbi 2 installation schematics — same demo picker, rendered with
// Libbi2InstallDiagram so the visual overlap suite covers them too.
const INSTALL_CONFIGS = {
  "libbi 2 install · DC, no EPS":            { libbi2:{ inverterId:"HS5", modules:2, coupling:"dc", eps:false }, region:"aunz" },
  "libbi 2 install · DC, EPS, 8 modules":    { libbi2:{ inverterId:"HS5", modules:8, coupling:"dc", eps:true }, region:"aunz", backupCircuits:["Lights","Refrigeration","Communications","Security","Essential sockets","Other essential load"] },
  "libbi 2 install · AC + inverter, EPS":    { libbi2:{ inverterId:"HS3.6", modules:1, coupling:"ac", eps:true }, region:"aunz", hasThirdPartyPv:true, backupCircuits:["Lights"] },
  "libbi 2 install · DC + inverter, GB/EU":   { libbi2:{ inverterId:"HS5", modules:4, coupling:"dc", eps:true }, region:"gbeu", hasThirdPartyPv:true, backupCircuits:["Lights","Refrigeration"] },
  "libbi 2 install · 3ph, AC + inverter":    { libbi2:{ inverterId:"HS5", modules:3, coupling:"ac", eps:false }, region:"aunz", sitePhase:"3ph", hasThirdPartyPv:true },
  "libbi 2 install · 12 kW (TBC), DC, EPS":  { libbi2:{ inverterId:"HS12", modules:6, coupling:"dc", eps:true }, region:"aunz", backupCircuits:["Lights","Security"] },
  "libbi 2 install · 3ph GB/EU, DC, EPS":    { libbi2:{ inverterId:"HS5", modules:2, coupling:"dc", eps:true }, region:"gbeu", sitePhase:"3ph", backupCircuits:["Lights"] },
};

const DC_COL = "#d97706"; // PV / battery DC runs

// Power conductor. White (AU L2) gets a grey casing so it reads on the white page.
const Ln = ({ x1, y1, x2, y2, col, w }) => (
  <>
    {col.toLowerCase() === "#ffffff" && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#888" strokeWidth={w + 1.6}/>}
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={w}/>
  </>
);

const CT = ({ x, y, label }) => (
  <g>
    <rect x={x-5} y={y-8} width={10} height={16} rx={1.5} fill={CT_COL} stroke="#333" strokeWidth={0.8}/>
    {label && <text x={x} y={y+22} textAnchor="middle" fill={CT_COL} fontSize={7} fontWeight="700" fontFamily="Overpass,sans-serif">{label}</text>}
  </g>
);

const trunc = (s, n) => !s || s.length <= n ? (s || '') : s.slice(0, n - 1) + '\u2026';

const Blk = ({ x, y, w=80, h=36, label, sub, bc=WHITE, lc=WHITE, bg=BOX_BG, labelFs=8.5 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={4} fill={bg} stroke={bc} strokeWidth={1.5}/>
    <text x={x+w/2} y={y+h/2-(sub?6:0)} textAnchor="middle" dominantBaseline="middle" fill={lc} fontSize={labelFs} fontWeight="700" fontFamily="Overpass,sans-serif">{label}</text>
    {sub && <text x={x+w/2} y={y+h/2+8} textAnchor="middle" fill={lc} fontSize={7} fontFamily="Overpass,sans-serif">{sub}</text>}
  </g>
);

const BatIcon = ({ x, y, w=50, h=38, label="BATTERY", stroke="#666", dashed=false }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={3} fill={BOX_BG} stroke={stroke} strokeWidth={1.5} strokeDasharray={dashed ? "5 3" : undefined}/>
    <line x1={x} y1={y+h*0.35} x2={x+w} y2={y+h*0.35} stroke="#bbb" strokeWidth={0.8}/>
    <line x1={x} y1={y+h*0.68} x2={x+w} y2={y+h*0.68} stroke="#bbb" strokeWidth={0.8}/>
    <rect x={x+w*0.32} y={y+h*0.74} width={w*0.36} height={h*0.18} rx={2} fill="none" stroke="#aaa" strokeWidth={1}/>
    <text x={x+w/2} y={y+h+12} textAnchor="middle" fill={WHITE} fontSize={8} fontWeight="700" fontFamily="Overpass,sans-serif">{label}</text>
  </g>
);

const Curve = ({ x1, y1, x2, y2, color=SIG, dashed=false, sw=1.8 }) => {
  const cp1x=x1, cp1y=y1+(y2-y1)*0.6;
  const cp2x=x2, cp2y=y2-(y2-y1)*0.35;
  return <path d={`M${x1},${y1} C${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`}
    fill="none" stroke={color} strokeWidth={sw} strokeDasharray={dashed?"7 4":undefined}/>;
};

// WiFi symbol: rotate=0 → waves open UP; 90 → RIGHT; 180 → DOWN; 270 → LEFT
// "away from source" = rotate toward destination
const WiFi = ({ cx, cy, size=13, rotate=0, color=YELLOW }) => {
  const sweep = 1.1; // half-angle ~63°
  const radii = [size*0.3, size*0.56, size*0.82];
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate})`}>
      {radii.map((r, i) => {
        const sx = (-Math.sin(sweep)*r).toFixed(2);
        const sy = (-Math.cos(sweep)*r).toFixed(2);
        const ex = ( Math.sin(sweep)*r).toFixed(2);
        const ey = (-Math.cos(sweep)*r).toFixed(2);
        return <path key={i}
          d={`M${sx},${sy} A${r.toFixed(2)},${r.toFixed(2)} 0 0,1 ${ex},${ey}`}
          fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"/>;
      })}
      <circle cx={0} cy={(size*0.15).toFixed(2)} r={(size*0.14).toFixed(2)} fill={color}/>
    </g>
  );
};

// Appliance icon symbols for eddi connections
const ApplianceIcon = ({ x, y, type, label }) => {
  const w = 44, h = 32;
  const icons = {
    "hot-water": (
      <g>
        <ellipse cx={x+w/2} cy={y+6} rx={10} ry={5} fill={BOX_BG} stroke="#666" strokeWidth={1.2}/>
        <rect x={x+w/2-10} y={y+6} width={20} height={18} fill={BOX_BG} stroke="#666" strokeWidth={1.2}/>
        <ellipse cx={x+w/2} cy={y+24} rx={10} ry={5} fill="#ddd" stroke="#666" strokeWidth={1.2}/>
        <path d={`M${x+w/2-4},${y+13} q2,-4 4,0 q2,4 4,0`} stroke="#aaa" strokeWidth={1} fill="none"/>
      </g>
    ),
    "underfloor": (
      <g>
        <rect x={x+2} y={y+4} width={w-4} height={h-8} rx={2} fill={BOX_BG} stroke="#666" strokeWidth={1.2}/>
        {[0,1,2].map(i => <path key={i} d={`M${x+6},${y+10+i*6} q4,-3 8,0 q4,3 8,0 q4,-3 6,0`} stroke="#aaa" strokeWidth={1} fill="none"/>)}
      </g>
    ),
    "pool": (
      <g>
        <rect x={x+2} y={y+4} width={w-4} height={h-8} rx={8} fill={BOX_BG} stroke="#666" strokeWidth={1.2}/>
        <path d={`M${x+8},${y+14} q5,-4 10,0 q5,4 10,0 q5,-4 8,0`} stroke="#aaa" strokeWidth={1.2} fill="none"/>
        <path d={`M${x+8},${y+20} q5,-4 10,0 q5,4 10,0 q5,-4 8,0`} stroke="#aaa" strokeWidth={1.2} fill="none"/>
      </g>
    ),
    "radiator": (
      <g>
        <rect x={x+2} y={y+4} width={w-4} height={h-8} rx={2} fill={BOX_BG} stroke="#666" strokeWidth={1.2}/>
        {[0,1,2,3].map(i => <rect key={i} x={x+6+i*9} y={y+7} width={5} height={h-14} rx={1} fill="#ddd" stroke="#aaa" strokeWidth={0.8}/>)}
      </g>
    ),
  };
  return (
    <g>
      {icons[type] || <rect x={x+2} y={y+4} width={w-4} height={h-8} rx={3} fill={BOX_BG} stroke="#666" strokeWidth={1.2}/>}
      <text x={x+w/2} y={y+h+12} textAnchor="middle" fill={WHITE} fontSize={7} fontFamily="Overpass,sans-serif">{label}</text>
    </g>
  );
};

export function Diagram({ config }) {
  const { sp, inv, ab, wl, pr, appliancesList = [], mainSwitchSplit = false, ctrlCtsSupported = 3, region = "aunz", libbiPv = false } = config;
  // Devices wired across all three phases (zappi on a 3-phase supply, unless wired single phase)
  const threePhaseDevices = config.threePhaseDevices ?? (sp === "3ph" ? ["zappi"] : []);
  // Region conductor colours: single lines are drawn as L1, multi-phase runs as L1/L2/L3
  const cc = conductorColours(region), LC = cc.L[0];
  // libbi 2 appears twice: its controller is a trunk device (pr), and its
  // inverter + battery stack is flagged isLibbi on the solar row (DC coupled)
  // or as the AC battery (AC coupled). Third-party hybrids are never drawn as libbi.
  // libbi 2 artwork is 120×290 (inverter on three true-proportion modules)
  const libbiImgW=34, libbiImgH=82;
  const libbiDcW=50, libbiDcH=121; // DC-coupled stack — larger than the AC-coupled stack
  const is2ph = sp === "2ph";
  const is3ph = sp === "3ph";
  const isMultiPh = is2ph || is3ph;
  const nSitePh = is3ph ? 3 : is2ph ? 2 : 1;
  const siteOs  = is3ph ? [-phSp,0,phSp] : is2ph ? [-phSp/2, phSp/2] : [0];
  const siteXOs = is3ph ? [-5,0,5] : is2ph ? [-2.5, 2.5] : [0];
  const hasSolar   = inv.length > 0;
  const hasACBat   = ab.length > 0;
  const hasAnyBat  = hasACBat || inv.some(v => v.dc) || pr.includes("libbi 2");
  const showMainSwitch = mainSwitchSplit && hasAnyBat;
  const multiInv   = inv.length > 1;
  const iIs3 = v => v.ph==="3ph"||v.ph==="2ph";
  const iOs  = v => iIs3(v)?[-phSp,0,phSp]:[0];
  const iXOs = v => iIs3(v)?[-5,0,5]:[0];

  // ── Harvi logic ───────────────────────────────────────────
  // 1ph wireless: total CTs ≤ 3 → single harvi on LEFT of zappi
  const solarCTcount = inv.filter(v=>v.ms).reduce((s,v)=>s+(iIs3(v)?3:1), 0);
  const acBatCTcount = (hasACBat && ab[0]?.mb) ? 1 : 0;
  const totalWLCTs   = (wl ? nSitePh : 0) + (wl || isMultiPh ? solarCTcount : 0) + acBatCTcount;
  const use1phHarvi  = !isMultiPh && wl;        // 1ph wireless: always single harvi left of zappi
  const solarToHarvi = !isMultiPh ? use1phHarvi : (inv.some(v=>v.ms));  // multi-ph: solar always to harvi
  // 3ph: controller needs harvi for grid if it can't support 3 CTs natively (eddi/GLO support only 2)
  // ctrlCtsSupported comes from config (sourced from PRODUCTS.ctsSupported in
  // systembuilder.jsx) — not a second hardcoded copy here.
  const gridToHarvi  = wl || (is3ph && ctrlCtsSupported < 3);
  const showHarvi    = gridToHarvi || solarToHarvi;

  // ── Fixed layout constants ────────────────────────────────
  const VW=730, VX=-20, busY=175;
  const pylonX=55;
  const meterX=115, meterW=56, meterH=34;
  const boardX=260, boardW=96, boardH=50, boardCX=308;
  const invX=474, invW=76, invH=42, invCX=invX+invW/2; // 514
  const pvX=598, pvW=62, pvH=40;
  const solarTapX = boardX+boardW+52; // 408
  const solarCtPos = invX-28;          // 446 — solar CT X on bus
  const dcBatW=50, dcBatH=38;
  const baseGap=44;
  const harviW=66, harviH=34, harviHGap=10, harviVGap=10;
  const devW=boardW, devH=36, secStep=56;
  const devHOf = name => Math.round(devH * (DEVICE_REGISTRY[name]?.scale || 1));
  const devWOf = name => Math.round(devW * (DEVICE_REGISTRY[name]?.scale || 1));
  const devGap = secStep - devH; // 20px — consistent visual gap between stacked devices

  // ── Inverter center Ys (account for DC battery spacing below prev) ──
  const invCYs = [];
  inv.forEach((v,i) => {
    if (i===0) { invCYs.push(busY); return; }
    let bottom;
    if (inv[i-1].isLibbi) {
      bottom = invCYs[i-1] + libbiDcH/2; // libbi centred at cy, bottom extent = libbiDcH/2
    } else {
      bottom = invCYs[i-1]+invH/2;
      if (inv[i-1].dc && inv[i-1].db) bottom += 22+dcBatH+16;
    }
    invCYs.push(bottom + invH/2 + 22);
  });

  // Right-side bottom (below all inverters+DC bats)
  let rightBottom = busY+boardH/2;
  inv.forEach((v,i) => {
    let b;
    if (v.isLibbi) {
      b = invCYs[i] + libbiDcH/2;
    } else {
      b = invCYs[i]+invH/2;
      if (v.dc&&v.db) b += 22+dcBatH;
    }
    if (b>rightBottom) rightBottom=b;
  });

  // ── AC Battery ───────────────────────────────────────────
  const acBatW=50, acBatH=40;
  const acBatTopY = busY - invH/2 - acBatH - 68;
  const acBatBotY_eff = acBatTopY + acBatH;
  const acBatBotY = acBatBotY_eff;
  const acBatCX   = invCX;
  const acBatLineY= acBatBotY_eff;       // horizontal run at battery bottom
  // CT X = midpoint between boardX+boardW and solarCtPos
  const acBatCtX  = Math.round((boardX+boardW + solarCtPos) / 2); // 401

  // ── Device row ──────────────────────────────────────────
  // All myenergi devices sit in one row below the switchboard: the gateway
  // (the device the CTs report to) on the left, secondaries to its right,
  // with the WiFi link drawn between them. libbi 2 is one slot: its
  // controller with the inverter/battery stack beside it.
  const extraGap = (!isMultiPh && hasSolar && hasACBat) ? Math.round(baseGap*0.5) : 0;
  const minCtrlTopY = busY + boardH/2 + 122; // 322 — matches 3ph-solar gap
  const ctrlTopY = Math.max(rightBottom + baseGap + extraGap, minCtrlTopY);
  const rowY = ctrlTopY;
  const devList = pr;
  const ICON = { zappi: [52, 80], "eddi": [50, 60], "eddi+": [49, 64], GLO: [36, 70] };
  const lcW = 38, lcH = 48, stkW = 45, stkH = 110, lbGap = 10; // libbi 2 controller + stack
  const APP_W = 44, APP_GAP = 10;
  let eddiSeen = 0;
  const slots = devList.map((name, i) => {
    if (name === "libbi 2") return { name, w: lcW + lbGap + stkW, h: stkH, isCtrl: i === 0 };
    const [w, h] = ICON[name] || [50, 60];
    let apps = [];
    if (name === "eddi" || name === "eddi+") { const e = appliancesList[eddiSeen++] || {}; apps = [e.app1, e.app2].filter(Boolean); }
    const appsW = apps.length ? apps.length * APP_W + (apps.length - 1) * APP_GAP : 0;
    return { name, w, h, apps, slotW: Math.max(w, appsW), isCtrl: i === 0 };
  });
  const mainSwitchXPre = computeMainSwitchFork({ meterX, meterW, boardX, boardCX, busY, boardH, showMainSwitch }).mainSwitchX;
  const gwLeft = showMainSwitch ? Math.max(boardX - 50, mainSwitchXPre + 34) : boardX - 50;
  let cursor = gwLeft;
  const devPositions = slots.map((sl, i) => {
    const slotW = sl.slotW || sl.w;
    const cx = cursor + slotW / 2;
    cursor += slotW + (i === 0 ? 64 : 30);
    const d = { ...sl, cx, x: cx - sl.w / 2, y: rowY };
    if (sl.name === "libbi 2") {
      d.lcX = d.x; d.lcCX = d.x + lcW / 2;
      d.stkX = d.x + lcW + lbGap; d.stkCX = d.stkX + stkW / 2;
      d.feedX = d.stkCX;            // supply lands on the inverter
      d.landX = d.lcCX;             // CTs land on the controller
    } else { d.feedX = cx; d.landX = cx; }
    return d;
  });
  const gw = devPositions[0];
  const gwRight = gw ? gw.x + gw.w : gwLeft;
  const libbiPos = devPositions.find(d => d.name === "libbi 2");
  const ctrlCX = gw ? gw.landX : boardCX;
  const ctrlX = gw ? gw.x : boardCX;

  // harvis sit to the left of the gateway, nearest first: grid, solar, battery
  const harvis = [];
  if (gridToHarvi || use1phHarvi) harvis.push({ forGrid: true });
  if (!use1phHarvi && solarToHarvi && inv.some(v => v.ms)) {
    for (let i = 0; i < Math.ceil(solarCTcount / 3); i++) harvis.push({ forSolar: true, idx: i });
  }
  if (!use1phHarvi && isMultiPh && hasACBat && ab[0]?.mb) harvis.push({ isAcBat: true });
  harvis.forEach((h, i) => {
    h.x = gwLeft - 30 - harviW - i * (harviW + 30);
    h.cx = h.x + harviW / 2;
    h.topY = rowY + 4; h.bottomY = h.topY + harviH;
    h.label = harvis.length === 1 ? "harvi" : `harvi ${i + 1}`;
  });
  const leftHarvi = harvis.find(h => h.forGrid) || null;
  const rightHarvis = harvis.filter(h => !h.forGrid);
  const allHarvis = harvis;

  // ── CT landing zones (top of the gateway) ─────────────────
  const landXs = (cx, side) => {
    const base = side === "grid" ? -1 : 1;
    const xs = nSitePh===3 ? [4, 9, 14] : nSitePh===2 ? [4, 9] : [5];
    return xs.map(o => cx + base * o).sort((a, b) => a - b);
  };
  const gridLandXs  = landXs(ctrlCX, "grid");
  const solarLandXs = landXs(ctrlCX, "solar");
  const gridDestXs = gridToHarvi && leftHarvi ? [leftHarvi.cx] : gridLandXs;
  const gridDestY  = gridToHarvi && leftHarvi ? leftHarvi.topY : rowY;
  const solarHarvis = rightHarvis.filter(h => !h.isAcBat);
  const solarDestFor = (i) => {
    if (!solarToHarvi) return { xs:solarLandXs, y:rowY };
    if (use1phHarvi)   return { xs:[leftHarvi.cx], y:leftHarvi.topY };
    const h = solarHarvis[Math.min(i, solarHarvis.length-1)];
    return h ? { xs:[h.cx], y:h.topY } : { xs:solarLandXs, y:rowY };
  };

  // ── Helpers ───────────────────────────────────────────────
  const { gridCtX, mainSwitchX, topY, propertyCtX, propDashY, bypassY } =
    computeMainSwitchFork({ meterX, meterW, boardX, boardCX, busY, boardH, showMainSwitch });

  // Orthogonal run drawn as one active (L1) or as L1/L2/L3 side by side.
  // Each vertex moves in x only if it touches a vertical leg and in y only if
  // it touches a horizontal leg, so straight runs keep their end points and
  // corners stay square.
  const PhaseRun = ({ pts, n = 1, w = 2.5 }) => {
    const offs = n === 3 ? [-phSp, 0, phSp] : n === 2 ? [-phSp/2, phSp/2] : [0];
    const isV = (a, b) => a && b && a[0] === b[0];
    const isH = (a, b) => a && b && a[1] === b[1];
    return <>{offs.map((o, i) => {
      const d = pts.map((p, k) => {
        const prev = pts[k - 1], next = pts[k + 1];
        const dx = isV(prev, p) || isV(p, next) ? o : 0;
        const dy = isH(prev, p) || isH(p, next) ? o : 0;
        return `${p[0] + dx},${p[1] + dy}`;
      }).join(" ");
      const col = n > 1 ? cc.L[i] : LC;
      return (
        <g key={i}>
          {col.toLowerCase() === "#ffffff" && <polyline points={d} fill="none" stroke="#888" strokeWidth={w + 1.6}/>}
          <polyline points={d} fill="none" stroke={col} strokeWidth={w}/>
        </g>
      );
    })}</>;
  };
  const devPh = name => (is3ph && threePhaseDevices.includes(name) ? 3 : 1);

  // ── Device circuits: each leaves the board bottom in row order and jogs
  // across at its own level. Devices further out jog higher, so no two
  // circuits cross or overlap.
  const bypassYPre = computeMainSwitchFork({ meterX, meterW, boardX, boardCX, busY, boardH, showMainSwitch }).bypassY;
  const drops = (() => {
    const n = devPositions.length;
    if (!n) return [];
    const widths = devPositions.map(d => (devPh(d.name) > 1 ? 2 * phSp + 14 : 14));
    const total = widths.reduce((a, b) => a + b, 0);
    let x = boardCX - total / 2;
    const exits = widths.map(w => { const e = x + w / 2; x += w; return e; });
    const out = devPositions.map((d, i) => ({ d, exit: exits[i], left: d.feedX < exits[i] }));
    const lefts = out.filter(o => o.left).sort((a, b) => a.d.feedX - b.d.feedX);       // furthest left first
    const rights = out.filter(o => !o.left).sort((a, b) => b.d.feedX - a.d.feedX);     // furthest right first
    const boardBot = busY + boardH / 2;
    [lefts, rights].forEach(group => group.forEach((o, rank) => { o.jog = boardBot + 14 + rank * 15; }));
    // via the main switch: all run right from the switch, furthest highest
    [...out].sort((a, b) => b.d.feedX - a.d.feedX).forEach((o, rank) => { o.byp = bypassYPre + rank * 15; });
    return out;
  })();

  // Solar side of the board only carries as many actives as the widest inverter
  const solarPh = inv.some(v => iIs3(v)) ? nSitePh : 1;

  const SiteWire = ({x1,y1,x2,y2}) => <>{siteOs.map((o,i)=>(
    <Ln key={i} x1={x1} y1={y1+o} x2={x2} y2={y2+o} col={isMultiPh ? cc.L[i] : LC} w={isMultiPh?2.5:3}/>
  ))}</>;
  const InvWire = ({x1,y1,x2,y2,v}) => <>{iOs(v).map((o,i)=>(
    <Ln key={i} x1={x1} y1={y1+o} x2={x2} y2={y2+o} col={iIs3(v) ? cc.L[i] : LC} w={iIs3(v)?2.5:3}/>
  ))}</>;
  const SiteCTs = ({x,y,label}) => <>{siteOs.map((o,i)=>(
    <CT key={i} x={x+siteXOs[i]} y={y+o} label={i===0?label:""}/>
  ))}</>;
  const PhCTs = ({x,y,v,label}) => <>{iOs(v).map((o,i)=>(
    <CT key={i} x={x+iXOs(v)[i]} y={y+o} label={i===0?label:""}/>
  ))}</>;
  const SigSet = ({ctX,ctY,osArr,xsArr,dxs,dy}) => <>{osArr.map((o,i)=>{
    const dx=Array.isArray(dxs)?dxs[Math.min(i,dxs.length-1)]:dxs;
    return <Curve key={i} x1={ctX+xsArr[i]} y1={ctY+o+8} x2={dx} y2={dy} dashed={true} sw={1.3}/>;
  })}</>;

  const appH = 32;
  const devBottom = d => d.y + d.h + (d.apps?.length ? 18 + appH + 14 : 0) + (d.name === "libbi 2" ? (libbiPv ? 22 + pvH + 16 : 14) : 0);
  const bottomAll = Math.max(rightBottom, ...devPositions.map(devBottom));
  const VH = bottomAll + 40;
  const minX = Math.min(VX, ...harvis.map(h => h.x - 12), ...devPositions.map(d => d.cx - (d.slotW || d.w) / 2 - 12));
  const maxX = Math.max(VX + VW, ...devPositions.map(d => d.cx + (d.slotW || d.w) / 2 + 12));
  const VXeff = minX, VWeff = maxX - minX;

  return (
    <svg width="100%" viewBox={`${VXeff} 0 ${VWeff} ${VH}`} style={{background:DARK,borderRadius:8,display:"block"}}>

      {/* GRID */}
      <image href={gridImgUrl} x={pylonX-50} y={busY-90} width={100} height={90} preserveAspectRatio="xMidYMid meet"/>
      <text x={pylonX} y={busY+20} textAnchor="middle" fill={WHITE} fontSize={8} fontFamily="Overpass,sans-serif" fontWeight="700">GRID</text>

      {/* Pylon → Meter */}
      <SiteWire x1={pylonX+50} y1={busY} x2={meterX} y2={busY}/>
      <Blk x={meterX} y={busY-meterH/2} w={meterW} h={meterH} label="METER" bc={WHITE} lc={WHITE}/>

      {/* Meter → Grid CT → Main switch (or straight to board if no split) */}
      <SiteWire x1={meterX+meterW} y1={busY} x2={gridCtX-7} y2={busY}/>
      <SiteCTs x={gridCtX} y={busY} label={is3ph?"Grid CT×3":is2ph?"Grid CT×2":"Grid CT1"}/>
      <SigSet ctX={gridCtX} ctY={busY} osArr={siteOs} xsArr={siteXOs} dxs={gridDestXs} dy={gridDestY}/>
      <SiteWire x1={gridCtX+7} y1={busY} x2={showMainSwitch ? mainSwitchX-7 : boardX} y2={busY}/>

      {/* Main Switchboard */}
      <text x={boardCX} y={busY-boardH/2-10} textAnchor="middle" fill={WHITE} fontSize={8} fontWeight="700" fontFamily="Overpass,sans-serif">MAIN SWITCHBOARD</text>
      <image href={mainSbImgUrl} x={boardX} y={busY-boardH/2} width={boardW} height={boardH} preserveAspectRatio="none"/>


      {/* myenergi device circuits — one per device, each at its own jog level */}
      {drops.map(({ d, exit, jog, byp }, i) => {
        const n = devPh(d.name), w = n > 1 ? 2.2 : 2.5;
        const pts = showMainSwitch
          ? [[mainSwitchX, busY+7], [mainSwitchX, byp], [d.feedX, byp], [d.feedX, d.y]]
          : Math.abs(exit - d.feedX) < 0.5
            ? [[exit, busY + boardH/2], [exit, d.y]]
            : [[exit, busY + boardH/2], [exit, jog], [d.feedX, jog], [d.feedX, d.y]];
        return <PhaseRun key={i} pts={pts} n={n} w={w}/>;
      })}

      {/* Main switch — central fork: switchboard fed from the top, myenergi device fed from the bottom */}
      {showMainSwitch && (() => {
        const propTarget = hasSolar
          ? { x: invX, y: invCYs[0] }
          : hasACBat ? { x: acBatCX, y: acBatTopY + acBatH/2 }
          : { x: libbiPos ? libbiPos.lcCX : boardCX, y: libbiPos ? libbiPos.y : busY };
        return (
          <>
            {/* Switch body, centred on the incoming supply line */}
            <rect x={mainSwitchX-7} y={busY-7} width={14} height={14} rx={2} fill={BOX_BG} stroke={WHITE} strokeWidth={1.5}/>

            {/* Top branch → switchboard */}
            <PhaseRun pts={[[mainSwitchX, busY-7], [mainSwitchX, topY], [boardCX, topY], [boardCX, busY-boardH/2]]} n={nSitePh} w={isMultiPh ? 2.2 : 2.5}/>
            <text x={mainSwitchX} y={busY-12} textAnchor="middle" fill={WHITE} fontSize={7.5} fontWeight="700" fontFamily="Overpass,sans-serif">MAIN SWITCH</text>

            {/* Bottom branch → myenergi device */}
            {/* (drawn with the device circuits above) */}

            {/* Property-side CT — on the switchboard branch, belongs to the inverter/battery, monitors the property load only */}
            <CT x={propertyCtX} y={topY} label="Property CT"/>
            <line x1={propertyCtX} y1={topY-8} x2={propertyCtX} y2={propDashY} stroke={SIG} strokeWidth={1.3} strokeDasharray="7 4"/>
            <line x1={propertyCtX} y1={propDashY} x2={propTarget.x} y2={propDashY} stroke={SIG} strokeWidth={1.3} strokeDasharray="7 4"/>
            <line x1={propTarget.x} y1={propDashY} x2={propTarget.x} y2={propTarget.y} stroke={SIG} strokeWidth={1.3} strokeDasharray="7 4"/>
          </>
        );
      })()}

      {/* harvis — left of the gateway, each sending wirelessly to it */}
      {allHarvis.map((h, hi) => (
        <g key={hi}>
          <image href={DEVICE_REGISTRY.harvi.icon} x={h.x} y={h.topY} width={harviW} height={harviH} preserveAspectRatio="xMidYMid meet"/>
          <WiFi cx={h.x + harviW + 14} cy={h.topY + harviH / 2} rotate={90} color={WHITE} size={11}/>
        </g>
      ))}

      {/* myenergi devices — gateway on the left, secondaries to the right */}
      {devPositions.map((d, i) => (
        <g key={i}>
          {d.name === "libbi 2" ? (
            <>
              <image href={DEVICE_REGISTRY["libbi 2"].icon} x={d.lcX} y={d.y} width={lcW} height={lcH} preserveAspectRatio="xMidYMid meet"/>
              <line x1={d.lcX + lcW} y1={d.y + lcH / 2} x2={d.stkX} y2={d.y + lcH / 2} stroke={SIG} strokeWidth={1.3} strokeDasharray="4 3"/>
              <image href={DEVICE_REGISTRY["libbi 2"].stackIcon} x={d.stkX} y={d.y} width={stkW} height={stkH} preserveAspectRatio="xMidYMid meet"/>
              <text x={d.lcCX} y={d.y + lcH + 11} textAnchor="middle" fill={WHITE} fontSize={6.5} fontWeight="700" fontFamily="Overpass,sans-serif">CONTROLLER</text>
              <text x={d.stkCX} y={d.y + stkH + 11} textAnchor="middle" fill={WHITE} fontSize={8} fontWeight="700" fontFamily="Overpass,sans-serif">LIBBI 2</text>
              {libbiPv && (
                <>
                  <Ln x1={d.stkX + stkW} y1={d.y + stkH - 14} x2={d.stkX + stkW + 10} y2={d.y + stkH - 14} col={DC_COL} w={2.5}/>
                  <Ln x1={d.stkX + stkW + 10} y1={d.y + stkH - 14} x2={d.stkX + stkW + 10} y2={d.y + stkH + 22} col={DC_COL} w={2.5}/>
                  <SolarPanel x={d.stkCX - pvW / 2 + 6} y={d.y + stkH + 22} w={pvW} h={pvH}/>
                  <text x={d.stkCX + 6} y={d.y + stkH + 22 + pvH + 12} textAnchor="middle" fill={WHITE} fontSize={8} fontWeight="700" fontFamily="Overpass,sans-serif">PV ARRAY</text>
                </>
              )}
            </>
          ) : (
            <>
              <rect x={d.x} y={d.y} width={d.w} height={d.h} fill={DARK}/>
              <image href={DEVICE_REGISTRY[d.name]?.icon} x={d.x} y={d.y} width={d.w} height={d.h} preserveAspectRatio="xMidYMid meet"/>
            </>
          )}
        </g>
      ))}

      {/* WiFi link between the gateway and its secondaries */}
      {devPositions.length > 1 && (
        <WiFi cx={gwRight + 30} cy={rowY + 26} rotate={90} color={WHITE} size={12}/>
      )}

      {/* eddi appliances — below each eddi / eddi+ */}
      {devPositions.map((d, di) => {
        if (!d.apps?.length) return null;
        const APPLIANCE_LABELS = { "hot-water":"Hot Water", "underfloor":"Underfloor", "pool":"Pool/Spa", "radiator":"Radiator", "other":"Appliance" };
        const total = d.apps.length * APP_W + (d.apps.length - 1) * APP_GAP;
        const startX = d.cx - total / 2;
        const busYa = d.y + d.h + 9, iconY = d.y + d.h + 18;
        return (
          <g key={`app-${di}`}>
            <Ln x1={d.cx} y1={d.y + d.h} x2={d.cx} y2={busYa} col={LC} w={1.8}/>
            {d.apps.length > 1 && <Ln x1={startX + APP_W / 2} y1={busYa} x2={startX + total - APP_W / 2} y2={busYa} col={LC} w={1.8}/>}
            {d.apps.map((app, ai) => {
              const ax = startX + ai * (APP_W + APP_GAP);
              return (
                <g key={ai}>
                  <Ln x1={ax + APP_W / 2} y1={busYa} x2={ax + APP_W / 2} y2={iconY + 2} col={LC} w={1.8}/>
                  <ApplianceIcon x={ax} y={iconY} type={app} label={APPLIANCE_LABELS[app] || "Appliance"}/>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* AC Battery — rendered independently of solar so it appears even with no inverter */}
      {hasACBat && (() => {
        const box = { x: acBatCX-acBatW/2, y: acBatTopY, w: acBatW, h: acBatH };
        const ct = ab[0]?.mb ? (() => {
          const acBatHarvi = rightHarvis.find(h => h.isAcBat);
          const destX = use1phHarvi ? leftHarvi?.cx : acBatHarvi ? acBatHarvi.cx : solarLandXs[solarLandXs.length-1];
          const destY = use1phHarvi ? leftHarvi?.topY : acBatHarvi ? acBatHarvi.topY : rowY;
          return { x: acBatCtX, y: acBatLineY, label: "Bat CT", dest: { x: destX, y: destY } };
        })() : null;
        const { wireSegments, ct: ctGeo } = computeSatelliteAttachment({
          box, attachStyle: 'side', parentAnchor: { x: boardCX, y: busY-boardH/2 }, ct,
        });
        return (
          <>
            <BatIcon x={box.x} y={box.y} w={box.w} h={box.h} label={trunc(ab[0]?.label, 11) || "BATTERY"}/>
            {wireSegments.map((seg, i) => (
              <Ln key={i} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2} col={LC} w={2.5}/>
            ))}
            {ctGeo && (
              <>
                <CT x={ctGeo.x} y={ctGeo.y} label={ctGeo.label}/>
                <Curve x1={ctGeo.x+5} y1={ctGeo.y+8} x2={ctGeo.destX} y2={ctGeo.destY} dashed={true} sw={1.3}/>
              </>
            )}
          </>
        );
      })()}

      {/* Solar branch */}
      {hasSolar && (
        <>
          {/* Bus: board right → solarTapX */}
          <PhaseRun pts={[[boardX+boardW, busY], [solarTapX, busY]]} n={solarPh} w={solarPh > 1 ? 2.5 : 3}/>
          {multiInv && <PhaseRun pts={[[solarTapX, busY], [solarTapX, invCYs[inv.length-1]]]} n={solarPh} w={2.5}/>}

          {inv.map((v,i)=>{
            const cy=invCYs[i];
            const ctX=invX-28;
            const lbl=v.dc?(iIs3(v)?"Gen+Bat CT×3":"Gen+Bat CT3"):(iIs3(v)?"Solar CT×3":(multiInv?`Solar CT${i+1}`:"Solar CT2"));
            const sd=solarDestFor(i);
            const isDcLibbi = !!v.isLibbi;
            const invLeftX  = isDcLibbi ? invCX - libbiDcW/2 : invX;
            const invRightX = isDcLibbi ? invCX + libbiDcW/2 : invX+invW;
            return (
              <g key={i}>
                <InvWire x1={solarTapX} y1={cy} x2={ctX-6} y2={cy} v={v}/>
                {v.ms && (
                  <>
                    <PhCTs x={ctX} y={cy} v={v} label={lbl}/>
                    <SigSet ctX={ctX} ctY={cy} osArr={iOs(v)} xsArr={iXOs(v)} dxs={sd.xs} dy={sd.y}/>
                    <InvWire x1={ctX+6} y1={cy} x2={invLeftX} y2={cy} v={v}/>
                  </>
                )}
                {!v.ms && <InvWire x1={ctX-6} y1={cy} x2={invLeftX} y2={cy} v={v}/>}
                {isDcLibbi ? (
                  <>
                    <image href={DEVICE_REGISTRY["libbi 2"].stackIcon} x={invCX-libbiDcW/2} y={cy-libbiDcH/2} width={libbiDcW} height={libbiDcH} preserveAspectRatio="xMidYMid meet"/>
                    <text x={invCX} y={cy-libbiDcH/2-5} textAnchor="middle" fill={WHITE} fontSize={8} fontWeight="700" fontFamily="Overpass,sans-serif">LIBBI 2</text>
                  </>
                ) : (
                  <>
                    {(() => {
                      const invLabel = trunc(v.label, 16) || (v.dc ? "HYBRID INV" : "INVERTER");
                      const invLabelFs = invLabel.length > 11 ? 7 : 8.5;
                      const batSub = v.dc ? (trunc(v.batLabel, 17) || "+ BATTERY") : undefined;
                      return <Blk x={invX} y={cy-invH/2} w={invW} h={invH} label={invLabel} labelFs={invLabelFs} sub={batSub} bc="#777" lc={WHITE}/>;
                    })()}
                    {v.dc&&v.db && (() => {
                      const box = { x: invCX-dcBatW/2, y: cy+invH/2+22, w: dcBatW, h: dcBatH };
                      const { wireSegments } = computeSatelliteAttachment({
                        box, attachStyle: 'below', parentAnchor: { x: invCX, y: cy+invH/2 }, ct: null,
                      });
                      return (
                        <>
                          {wireSegments.map((seg, i) => (
                            <Ln key={i} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2} col={DC_COL} w={2.5}/>
                          ))}
                          <BatIcon x={box.x} y={box.y} w={box.w} h={box.h} label={trunc(v.batLabel, 11) || "BATTERY"}/>
                        </>
                      );
                    })()}
                  </>
                )}
                <Ln x1={invRightX} y1={cy} x2={pvX} y2={cy} col={DC_COL} w={2.5}/>
                <g>
                  <SolarPanel x={pvX} y={cy-pvH/2} w={pvW} h={pvH}/>
                  <text x={pvX+pvW/2} y={cy+pvH/2+13} textAnchor="middle" fill={WHITE} fontSize={8} fontWeight="700" fontFamily="Overpass,sans-serif">
                    {multiInv?`PV ARRAY ${i+1}`:"PV ARRAY"}
                  </text>
                </g>
              </g>
            );
          })}
        </>
      )}

    </svg>
  );
}

export default function App() {
  const [key, setKey] = useState("1ph · DC hybrid");
  return (
    <div style={{background:"#f0f0f0",minHeight:"100vh",fontFamily:"'Overpass',sans-serif",color:"#111",padding:20}}>
      <link href="https://fonts.googleapis.com/css2?family=Overpass:ital,wght@0,300;0,700;1,800&display=swap" rel="stylesheet"/>
      <div style={{marginBottom:14,display:"flex",gap:6,flexWrap:"wrap"}}>
        {[...Object.keys(CONFIGS), ...Object.keys(INSTALL_CONFIGS)].map(k=>(
          <button key={k} onClick={()=>setKey(k)} style={{background:k===key?G:"#1a1a1a",color:k===key?"#000":"#aaa",border:`1px solid ${k===key?G:"#333"}`,borderRadius:999,padding:"5px 12px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{k}</button>
        ))}
      </div>
      {INSTALL_CONFIGS[key] ? <Libbi2InstallDiagram {...INSTALL_CONFIGS[key]}/> : <Diagram config={CONFIGS[key]}/>}
    </div>
  );
}
