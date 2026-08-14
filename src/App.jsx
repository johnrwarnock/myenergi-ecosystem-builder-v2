import { useState } from "react";
import zappiImgUrl  from "./zappi.svg";
import mainSbImgUrl from "./main switchboard.svg";
import gridImgUrl   from "./grid.svg";
import harviImgUrl  from "./harvi.svg";
import libbiImgUrl  from "./libbi.svg";
import eddiImgUrl   from "./eddi.svg";
import eddiPlusImgUrl from "./eddi+.svg";
import gloImgUrl    from "./GLO.svg";

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

const DEVICE_IMGS = {
  harvi: harviImgUrl,
  libbi: libbiImgUrl,
  eddi:  eddiImgUrl,
  "eddi+": eddiPlusImgUrl,
  GLO:   gloImgUrl,
};
// Scale multipliers relative to base devW/devH
const DEVICE_SCALES = { zappi:2, eddi:1.5, "eddi+":1.5, libbi:2.25, GLO:2 };

const CONFIGS = {
  "1ph · solar":        { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}],  ab:[],          wl:false, pr:["zappi"] },
  "1ph · DC hybrid":    { sp:"1ph", inv:[{ph:"1ph",dc:true, db:true, ms:true}],  ab:[],          wl:false, pr:["zappi"] },
  "1ph · AC battery":   { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}],  ab:[{mb:true}], wl:false, pr:["zappi"] },
  "1ph · wireless":     { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}],  ab:[],          wl:true,  pr:["zappi"] },
  "3ph · solar":        { sp:"3ph", inv:[{ph:"3ph",dc:false,db:false,ms:true}],  ab:[],          wl:false, pr:["zappi"] },
  "3ph · wireless":     { sp:"3ph", inv:[{ph:"3ph",dc:false,db:false,ms:true}],  ab:[],          wl:true,  pr:["zappi"] },
  "3ph · 1ph device":  { sp:"3ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}],  ab:[],          wl:true,  pr:["zappi"] },
  "2×1ph no wireless":  { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true},{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi"] },
  "2×1ph wireless":     { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true},{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:true,  pr:["zappi"] },
  "3ph+1ph mix":        { sp:"3ph", inv:[{ph:"3ph",dc:true,db:true,ms:true},{ph:"1ph",dc:false,db:false,ms:true}],  ab:[], wl:false, pr:["zappi"] },
  "multi-dev ×3":       { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}],  ab:[],          wl:false, pr:["zappi","eddi","libbi"] },
  "full mix":           { sp:"3ph", inv:[{ph:"3ph",dc:true,db:true,ms:true},{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","eddi","libbi"] },
  "1ph · libbi AC":  { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[{mb:false}], wl:false, pr:["zappi","libbi"] },
  "1ph · libbi DC":  { sp:"1ph", inv:[{ph:"1ph",dc:true, db:true, ms:true}], ab:[],           wl:false, pr:["zappi","libbi"] },
  "1ph · main switch split": { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[{mb:true}], wl:false, pr:["zappi"], mainSwitchSplit:true },
  "GLO solo":                { sp:"1ph", inv:[], ab:[], wl:false, pr:["GLO"] },
  "GLO + solar (hardwired)": { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["GLO"] },
  "GLO + battery (at cap)":  { sp:"1ph", inv:[], ab:[{mb:true}], wl:false, pr:["GLO"] },
  "GLO + solar + battery (forced wireless)": { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[{mb:true}], wl:true, pr:["GLO"] },
  "3ph GLO":                 { sp:"3ph", inv:[{ph:"3ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["GLO"] },
  "eddi + appliances":       { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["eddi"], appliancesList:[{device:"eddi",app1:"hot-water",app2:"underfloor"}] },
  "eddi+ 3ph + battery":     { sp:"3ph", inv:[], ab:[{mb:true}], wl:false, pr:["eddi+"] },
  "3ph · main switch split (DC hybrid)": { sp:"3ph", inv:[{ph:"3ph",dc:true,db:true,ms:true}], ab:[], wl:false, pr:["zappi"], mainSwitchSplit:true },
  "3ph · main switch split + AC battery": { sp:"3ph", inv:[{ph:"3ph",dc:false,db:false,ms:true}], ab:[{mb:true}], wl:false, pr:["zappi"], mainSwitchSplit:true },
  "1ph · main switch split, battery only": { sp:"1ph", inv:[], ab:[{mb:true}], wl:false, pr:["zappi"], mainSwitchSplit:true },
  "1ph · main switch split + multi device": { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[{mb:true}], wl:false, pr:["zappi","eddi","libbi"], mainSwitchSplit:true },
  "2ph · main switch split + battery": { sp:"2ph", inv:[{ph:"2ph",dc:false,db:false,ms:true}], ab:[{mb:true}], wl:false, pr:["zappi"], mainSwitchSplit:true },
  "multi-dev ×5 (max)":      { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","eddi","eddi+","GLO","libbi"] },
  "GLO as secondary":        { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","GLO"] },
  "2× zappi":                { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","zappi"] },
  "3× zappi + eddi":         { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","zappi","zappi","eddi"] },
  "2× GLO":                  { sp:"1ph", inv:[{ph:"1ph",dc:false,db:false,ms:true}], ab:[], wl:false, pr:["zappi","GLO","GLO"] },
};

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

const BatIcon = ({ x, y, w=50, h=38, label="BATTERY" }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={3} fill={BOX_BG} stroke="#666" strokeWidth={1.5}/>
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

// ── Layout primitives ─────────────────────────────────────────────────────
// Pure functions, no JSX — each takes plain numbers/arrays and returns plain
// numbers/objects. Extracted verbatim from Diagram() with no behavior change
// (see the commit that introduced this split for the before/after diff).

/**
 * Board-exit points (where each circuit visually leaves the switchboard) stay
 * evenly spaced within the board width. Actual device centres are spaced by
 * each device's real rendered width plus a fixed margin, so wide icons
 * (libbi, GLO) never overlap a neighbour — a short jog (drawn by the caller)
 * connects the two. Alternating secondaries stagger onto a lower row so
 * repeated devices (e.g. two zappis) each keep a clearly separate line.
 */
function computeSecondaryRow({ ctrlCX, boardW, devW, secRowY, secDevList, devWOf }) {
  const SEC_MARGIN = 20;
  const STAGGER_Y = 44;
  const secLineStep = Math.floor(boardW / (secDevList.length + 1));
  const secWidths = secDevList.map(devWOf);
  const totalSecW = secWidths.reduce((s, w) => s + w, 0) + SEC_MARGIN * (secDevList.length - 1);
  let cursorX = ctrlCX - totalSecW / 2;
  return secDevList.map((name, i) => {
    const boardExitCx = ctrlCX + Math.round((i - (secDevList.length - 1) / 2) * secLineStep);
    const w = secWidths[i];
    const cx = cursorX + w / 2;
    cursorX += w + SEC_MARGIN;
    // The zappi image is rendered specially (x - devW/2, width devW*2 — see the
    // device-rendering block in Diagram()), so its stored x must match that
    // convention rather than the generic cx - fullWidth/2 used by every other
    // device, or its icon renders off-centre from its own wire.
    const x = name === "zappi" ? cx - devW / 2 : cx - w / 2;
    const y = secRowY + (i % 2 === 1 ? STAGGER_Y : 0);
    return { name, isCtrl: false, x, cx, y, boardExitCx };
  });
}

/**
 * Horizontal extent can exceed the base viewBox once several wide secondaries
 * are laid out with real, non-overlapping spacing — grow the viewBox to fit
 * rather than clip, the same way VH already grows to fit content height.
 */
function computeViewBox({ devPositions, devW, devWOf, VX, VW, VH }) {
  const devLeftEdge  = d => d.name === "zappi" ? (d.x - devW / 2) : (d.cx - devWOf(d.name) / 2);
  const devRightEdge = d => d.name === "zappi" ? (d.x - devW / 2 + devW * 2) : (d.cx + devWOf(d.name) / 2);
  const VXeff = Math.min(VX, ...devPositions.map(devLeftEdge)) - 10;
  const VWeff = Math.max(VX + VW, ...devPositions.map(devRightEdge)) + 10 - VXeff;
  return { VXeff, VWeff, VH };
}

/**
 * When split at the main switch: grid CT stays upstream (sees total site
 * flow), then the main switch is the central fork — switchboard fed from its
 * top, myenergi device fed from its bottom. Property CT sits on the
 * switchboard branch, above the board, and reports back to the
 * inverter/battery. When not split, grid CT sits at its default position and
 * the fork-specific coordinates are unused (still computed for simplicity —
 * the caller only renders them when showMainSwitch is true).
 */
function computeMainSwitchFork({ meterX, meterW, boardX, boardCX, busY, boardH, showMainSwitch }) {
  const busSegStart = meterX + meterW;
  const busSegSpan = boardX - busSegStart;
  const gridCtX = Math.round(busSegStart + busSegSpan * (showMainSwitch ? 0.3 : 0.75));
  const mainSwitchX = showMainSwitch ? Math.round(busSegStart + busSegSpan * 0.65) : 0;
  const topY = busY - 80;
  const propertyCtX = showMainSwitch ? Math.round(mainSwitchX + (boardCX - mainSwitchX) * 0.55) : 0;
  const propDashY = topY - 18;
  const bypassY = busY + boardH / 2 + 24;
  return { gridCtX, mainSwitchX, topY, propertyCtX, propDashY, bypassY };
}

export function Diagram({ config }) {
  const { sp, inv, ab, wl, pr, appliancesList = [], mainSwitchSplit = false } = config;
  const hasLibbi      = pr.includes("libbi");
  const libbiIsBat_dc = hasLibbi && inv.some(v=>v.dc&&v.db);
  const libbiIsBat_ac = hasLibbi && ab.length > 0;
  const libbiImgW=44, libbiImgH=80;
  const libbiDcW=55, libbiDcH=100; // DC hybrid replacement — 25% larger than AC battery libbi
  const is2ph = sp === "2ph";
  const is3ph = sp === "3ph";
  const isMultiPh = is2ph || is3ph;
  const nSitePh = is3ph ? 3 : is2ph ? 2 : 1;
  const siteOs  = is3ph ? [-phSp,0,phSp] : is2ph ? [-phSp/2, phSp/2] : [0];
  const siteXOs = is3ph ? [-5,0,5] : is2ph ? [-2.5, 2.5] : [0];
  const hasSolar   = inv.length > 0;
  const hasACBat   = ab.length > 0;
  const hasAnyBat  = hasACBat || inv.some(v => v.dc);
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
  const CTRL_CTS = { "zappi":3, "eddi+":3, "eddi":2, "GLO":2, "libbi":3 };
  const ctrlCtsSupported = CTRL_CTS[pr[0]] ?? 3;
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
  const devHOf = name => Math.round(devH * (DEVICE_SCALES[name] || 1));
  const devWOf = name => Math.round(devW * (DEVICE_SCALES[name] || 1));
  const devGap = secStep - devH; // 20px — consistent visual gap between stacked devices

  // ── Inverter center Ys (account for DC battery spacing below prev) ──
  const invCYs = [];
  inv.forEach((v,i) => {
    if (i===0) { invCYs.push(busY); return; }
    let bottom;
    if (libbiIsBat_dc && inv[i-1].dc && inv[i-1].db) {
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
    if (libbiIsBat_dc && v.dc && v.db) {
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

  // ── Controller top Y ─────────────────────────────────────
  const extraGap = (!isMultiPh && hasSolar && hasACBat) ? Math.round(baseGap*0.5) : 0;
  const minCtrlTopY = busY + boardH/2 + 122; // 322 — matches 3ph-solar gap
  let ctrlTopY = Math.max(rightBottom + baseGap + extraGap, minCtrlTopY);
  const devList = libbiIsBat_dc || libbiIsBat_ac ? pr.filter(n=>n!=="libbi") : pr;
  const ctrlX = boardCX-devW/2;
  const ctrlCX = boardCX;

  let leftHarvi=null, rightHarvis=[];

  if (use1phHarvi) {
    // Single harvi left of zappi — finalised below once ctrlTopY is known
    leftHarvi = { side:"left", forGrid:true, label:"harvi" };
  } else {
    if (gridToHarvi) {
      leftHarvi = { side:"left", x:ctrlCX-harviW-22, cx:ctrlCX-harviW-22+harviW/2, forGrid:true };
    }
    if (solarToHarvi && inv.some(v=>v.ms)) {
      const nSH = Math.ceil(solarCTcount/3);
      for (let i=0;i<nSH;i++) {
        const hx = ctrlCX+22 + i*(harviW+harviHGap);
        rightHarvis.push({ side:"right", x:hx, cx:hx+harviW/2, forGrid:false, idx:i, isAcBat:false });
      }
    }
    // AC battery needs its own dedicated harvi in multi-phase (cannot share with solar)
    if (isMultiPh && hasACBat && ab[0]?.mb) {
      const offset = rightHarvis.length;
      const hx = ctrlCX+22 + offset*(harviW+harviHGap);
      rightHarvis.push({ side:"right", x:hx, cx:hx+harviW/2, forGrid:false, isAcBat:true });
    }
    // Align all harvi bottom edges to controller top, then relabel
    const allHarvisToAlign = [...(leftHarvi?[leftHarvi]:[]), ...rightHarvis];
    allHarvisToAlign.forEach(h => { h.topY = ctrlTopY - harviH; h.bottomY = ctrlTopY; });
    if (allHarvisToAlign.length === 1) { allHarvisToAlign[0].label = "harvi"; }
    else { allHarvisToAlign.forEach((h, i) => { h.label = `harvi ${i+1}`; }); }
  }

  const allHarvis = [...(leftHarvi&&!use1phHarvi?[leftHarvi]:[]), ...rightHarvis];

  // Finalise 1ph harvi position (left of zappi, centred vertically between board and controller)
  if (use1phHarvi) {
    const harviTopY = Math.round((busY + boardH/2 + ctrlTopY) / 2 - harviH/2);
    leftHarvi.x = ctrlX - harviW - 16;
    leftHarvi.topY = harviTopY;
    leftHarvi.cx = ctrlX - harviW - 16 + harviW/2;
    leftHarvi.bottomY = harviTopY + harviH;
  }

  // ── CT landing zones ──────────────────────────────────────
  const gridLandXs  = nSitePh===3 ? [ctrlCX-18,ctrlCX-10,ctrlCX-2] : nSitePh===2 ? [ctrlCX-13,ctrlCX-5] : [ctrlCX-8];
  const solarLandXs = nSitePh===3 ? [ctrlCX+2, ctrlCX+10,ctrlCX+18] : nSitePh===2 ? [ctrlCX+5,ctrlCX+13] : [ctrlCX+8];

  // When libbi is AC battery AND controller, grid CTs connect directly to libbi
  const libbiIsCtrl = libbiIsBat_ac && pr[0] === "libbi";
  let gridDestXs = gridToHarvi && leftHarvi ? [leftHarvi.cx] : gridLandXs;
  let gridDestY  = gridToHarvi && leftHarvi ? leftHarvi.topY : ctrlTopY;
  if (libbiIsCtrl) { gridDestXs = [acBatCX]; gridDestY = acBatTopY + Math.round(libbiImgH * 0.6); }

  const solarHarvis = rightHarvis.filter(h => !h.isAcBat);
  const solarDestFor = (i) => {
    if (!solarToHarvi) return { xs:solarLandXs, y:ctrlTopY };
    if (use1phHarvi)   return { xs:[leftHarvi.cx], y:leftHarvi.topY };
    const h = solarHarvis[Math.min(i, solarHarvis.length-1)];
    return h ? { xs:[h.cx], y:h.topY } : { xs:solarLandXs, y:ctrlTopY };
  };

  // Wireless landing on controller
  const harviLandXs = use1phHarvi
    ? gridLandXs.concat(solarLandXs)
    : (leftHarvi ? gridLandXs : solarLandXs);

  // ── Device positions — controller centred, secondaries in horizontal row below ──
  const zappiH = devHOf("zappi");
  const ctrlEntry = { name: devList[0], isCtrl: true, x: ctrlX, cx: ctrlCX, y: ctrlTopY, boardExitCx: ctrlCX };
  const secDevList = devList.slice(1);
  let devPositions;
  if (secDevList.length === 0) {
    devPositions = [ctrlEntry];
  } else {
    const secRowY = ctrlTopY + devHOf(devList[0]) + devGap + secStep;
    const secEntries = computeSecondaryRow({ ctrlCX, boardW, devW, secRowY, secDevList, devWOf });
    devPositions = [ctrlEntry, ...secEntries];
  }

  // ── Helpers ───────────────────────────────────────────────
  const { gridCtX, mainSwitchX, topY, propertyCtX, propDashY, bypassY } =
    computeMainSwitchFork({ meterX, meterW, boardX, boardCX, busY, boardH, showMainSwitch });

  const SiteWire = ({x1,y1,x2,y2,color=WHITE}) => <>{siteOs.map((o,i)=>(
    <line key={i} x1={x1} y1={y1+o} x2={x2} y2={y2+o} stroke={color} strokeWidth={isMultiPh?2.5:3}/>
  ))}</>;
  const InvWire = ({x1,y1,x2,y2,v}) => <>{iOs(v).map((o,i)=>(
    <line key={i} x1={x1} y1={y1+o} x2={x2} y2={y2+o} stroke={WHITE} strokeWidth={iIs3(v)?2.5:3}/>
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

  const bottomAll = Math.max(...devPositions.map(d=>d.y+devHOf(d.name)));
  const VHbase = bottomAll+60; // extra padding so secondary devices are never clipped
  const { VXeff, VWeff, VH } = computeViewBox({ devPositions, devW, devWOf, VX, VW, VH: VHbase });

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

      {/* Individual circuit lines — straight for the controller (and for any device whose
          real position matches its board-exit point); a short jog for secondaries whose
          width-aware spacing has shifted them away from their evenly-spaced exit point. */}
      {devPositions.map((d, i) => {
        const topY = showMainSwitch ? bypassY : busY + boardH/2;
        if (showMainSwitch || d.cx === d.boardExitCx) {
          return <line key={i} x1={d.cx} y1={topY} x2={d.cx} y2={d.y} stroke={WHITE} strokeWidth={d.isCtrl ? 3 : 2.5}/>;
        }
        const jogY = d.y - 18;
        return (
          <g key={i}>
            <line x1={d.boardExitCx} y1={topY} x2={d.boardExitCx} y2={jogY} stroke={WHITE} strokeWidth={2.5}/>
            <line x1={d.boardExitCx} y1={jogY} x2={d.cx} y2={jogY} stroke={WHITE} strokeWidth={2.5}/>
            <line x1={d.cx} y1={jogY} x2={d.cx} y2={d.y} stroke={WHITE} strokeWidth={2.5}/>
          </g>
        );
      })}

      {/* Main switch — central fork: switchboard fed from the top, myenergi device fed from the bottom */}
      {showMainSwitch && (() => {
        const propTarget = hasSolar
          ? { x: invX, y: invCYs[0] }
          : { x: acBatCX, y: acBatTopY + acBatH/2 };
        return (
          <>
            {/* Switch body, centred on the incoming supply line */}
            <rect x={mainSwitchX-7} y={busY-7} width={14} height={14} rx={2} fill={BOX_BG} stroke={WHITE} strokeWidth={1.5}/>

            {/* Top branch → switchboard */}
            <line x1={mainSwitchX} y1={busY-7} x2={mainSwitchX} y2={topY} stroke={WHITE} strokeWidth={2.5}/>
            <line x1={mainSwitchX} y1={topY} x2={boardCX} y2={topY} stroke={WHITE} strokeWidth={2.5}/>
            <line x1={boardCX} y1={topY} x2={boardCX} y2={busY-boardH/2} stroke={WHITE} strokeWidth={2.5}/>
            <text x={mainSwitchX} y={busY-12} textAnchor="middle" fill={WHITE} fontSize={7.5} fontWeight="700" fontFamily="Overpass,sans-serif">MAIN SWITCH</text>

            {/* Bottom branch → myenergi device */}
            <line x1={mainSwitchX} y1={busY+7} x2={mainSwitchX} y2={bypassY} stroke={WHITE} strokeWidth={2.5}/>
            {devPositions.map((d,i) => (
              <line key={`byp-${i}`} x1={mainSwitchX} y1={bypassY} x2={d.cx} y2={bypassY} stroke={WHITE} strokeWidth={d.isCtrl?3:2.5}/>
            ))}

            {/* Property-side CT — on the switchboard branch, belongs to the inverter/battery, monitors the property load only */}
            <CT x={propertyCtX} y={topY} label="Property CT"/>
            <line x1={propertyCtX} y1={topY-8} x2={propertyCtX} y2={propDashY} stroke={SIG} strokeWidth={1.3} strokeDasharray="7 4"/>
            <line x1={propertyCtX} y1={propDashY} x2={propTarget.x} y2={propDashY} stroke={SIG} strokeWidth={1.3} strokeDasharray="7 4"/>
            <line x1={propTarget.x} y1={propDashY} x2={propTarget.x} y2={propTarget.y} stroke={SIG} strokeWidth={1.3} strokeDasharray="7 4"/>
          </>
        );
      })()}

      {/* 1ph harvi — left of zappi */}
      {use1phHarvi && leftHarvi && (
        <>
          <image href={harviImgUrl} x={leftHarvi.x} y={leftHarvi.topY} width={harviW} height={harviH} preserveAspectRatio="xMidYMid meet"/>
          {/* WiFi centred on harvi bottom, 2px clear below box, waves pointing down toward zappi */}
          <WiFi cx={leftHarvi.cx} cy={leftHarvi.bottomY + 12} rotate={180} color={WHITE}/>
        </>
      )}

      {/* 3ph/multi harvis */}
      {!use1phHarvi && allHarvis.map((h,hi)=>{
        return (
          <g key={hi}>
            <image href={harviImgUrl} x={h.x} y={h.topY} width={harviW} height={harviH} preserveAspectRatio="xMidYMid meet"/>
            {/* WiFi centred on harvi bottom, 2px clear below box, waves pointing down toward zappi */}
            <WiFi cx={h.cx} cy={h.bottomY + 12} rotate={180} color={WHITE}/>
          </g>
        );
      })}

      {/* myenergi devices — controller + horizontal row of secondaries */}
      {devPositions.map((d,i)=>(
        <g key={i}>
          {d.name === "zappi" ? (
            <>
              <defs>
                <clipPath id={`zappi-clip-${i}`}>
                  <rect x={d.x-devW/2} y={d.y} width={devW*2} height={zappiH} rx={4}/>
                </clipPath>
              </defs>
              <rect x={d.x-devW/2} y={d.y} width={devW*2} height={zappiH} fill={DARK}/>
              <image href={zappiImgUrl} x={d.x-devW/2} y={d.y} width={devW*2} height={zappiH}
                preserveAspectRatio="xMidYMid meet" clipPath={`url(#zappi-clip-${i})`}/>
            </>
          ) : (
            <>
              <rect x={d.cx-devWOf(d.name)/2} y={d.y} width={devWOf(d.name)} height={devHOf(d.name)} fill={DARK}/>
              <image href={DEVICE_IMGS[d.name]} x={d.cx-devWOf(d.name)/2} y={d.y} width={devWOf(d.name)} height={devHOf(d.name)} preserveAspectRatio="xMidYMid meet"/>
            </>
          )}
        </g>
      ))}

      {/* Single WiFi symbol below controller when secondaries exist */}
      {secDevList.length > 0 && (
        <WiFi cx={ctrlCX} cy={ctrlTopY + devHOf(devList[0]) + 14} rotate={180} color={WHITE} size={10}/>
      )}

      {/* Eddi appliances — drawn to the left of each eddi/eddi+ device */}
      {(() => {
        const APPLIANCE_LABELS = { "hot-water":"Hot Water", "underfloor":"Underfloor", "pool":"Pool/Spa", "radiator":"Radiator", "other":"Appliance" };
        const appW = 44, appH = 32, appGap = 10;
        let eddiIdx = 0;
        return devPositions.map((d, di) => {
          if (d.name !== "eddi" && d.name !== "eddi+") return null;
          const entry = appliancesList[eddiIdx++] || {};
          const apps = [entry.app1, entry.app2].filter(Boolean);
          if (apps.length === 0) return null;
          const devLeftX = d.cx - devWOf(d.name) / 2;
          const startX = devLeftX - 16;
          const totalH = apps.length * appH + (apps.length - 1) * appGap;
          const devMidY = d.y + devHOf(d.name) / 2;
          const firstY = devMidY - totalH / 2;
          return (
            <g key={`app-${di}`}>
              {apps.map((app, ai) => {
                const ay = firstY + ai * (appH + appGap);
                const iconX = startX - appW - 8;
                const connY = ay + appH / 2;
                return (
                  <g key={ai}>
                    <line x1={startX} y1={connY} x2={iconX + appW} y2={connY} stroke={WHITE} strokeWidth={1.8}/>
                    <ApplianceIcon x={iconX} y={ay} type={app} label={APPLIANCE_LABELS[app] || "Appliance"}/>
                  </g>
                );
              })}
              {/* Tap from device left edge to first appliance branch */}
              <line x1={devLeftX} y1={devMidY} x2={startX} y2={devMidY} stroke={WHITE} strokeWidth={1.8}/>
              {apps.length > 1 && (
                <line x1={startX} y1={firstY + appH/2} x2={startX} y2={firstY + appH + appGap + appH/2} stroke={WHITE} strokeWidth={1.8}/>
              )}
            </g>
          );
        });
      })()}

      {/* AC Battery — rendered independently of solar so it appears even with no inverter */}
      {hasACBat && (
        <>
          <BatIcon x={acBatCX-acBatW/2} y={acBatTopY} w={acBatW} h={acBatH} label={trunc(ab[0]?.label, 11) || "BATTERY"}/>
          {/* Battery → horizontal to boardCX → down to switchboard top */}
          <line x1={acBatCX-acBatW/2} y1={acBatLineY} x2={boardCX} y2={acBatLineY} stroke={WHITE} strokeWidth={2.5}/>
          <line x1={boardCX} y1={acBatLineY} x2={boardCX} y2={busY-boardH/2} stroke={WHITE} strokeWidth={2.5}/>
          {ab[0]?.mb && (() => {
            const acBatHarvi = rightHarvis.find(h => h.isAcBat);
            const destX = use1phHarvi ? leftHarvi?.cx : acBatHarvi ? acBatHarvi.cx : solarLandXs[solarLandXs.length-1];
            const destY = use1phHarvi ? leftHarvi?.topY : acBatHarvi ? acBatHarvi.topY : ctrlTopY;
            return (
              <>
                <CT x={acBatCtX} y={acBatLineY} label="Bat CT"/>
                <Curve x1={acBatCtX+5} y1={acBatLineY+8} x2={destX} y2={destY} dashed={true} sw={1.3}/>
              </>
            );
          })()}
        </>
      )}

      {/* Solar branch */}
      {hasSolar && (
        <>
          {/* Bus: board right → solarTapX */}
          <SiteWire x1={boardX+boardW} y1={busY} x2={solarTapX} y2={busY}/>
          {multiInv && <line x1={solarTapX} y1={busY} x2={solarTapX} y2={invCYs[inv.length-1]} stroke={WHITE} strokeWidth={2.5}/>}

          {inv.map((v,i)=>{
            const cy=invCYs[i];
            const ctX=invX-28;
            const lbl=v.dc?(iIs3(v)?"Gen+Bat CT×3":"Gen+Bat CT3"):(iIs3(v)?"Solar CT×3":(multiInv?`Solar CT${i+1}`:"Solar CT2"));
            const sd=solarDestFor(i);
            const isDcLibbi = libbiIsBat_dc && v.dc && v.db;
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
                {!v.ms && <InvWire x1={ctX} y1={cy} x2={invLeftX} y2={cy} v={v}/>}
                {isDcLibbi ? (
                  <image href={libbiImgUrl} x={invCX-libbiDcW/2} y={cy-libbiDcH/2} width={libbiDcW} height={libbiDcH} preserveAspectRatio="xMidYMid meet"/>
                ) : (
                  <>
                    {(() => {
                      const invLabel = trunc(v.label, 16) || (v.dc ? "HYBRID INV" : "INVERTER");
                      const invLabelFs = invLabel.length > 11 ? 7 : 8.5;
                      const batSub = v.dc ? (trunc(v.batLabel, 17) || "+ BATTERY") : undefined;
                      return <Blk x={invX} y={cy-invH/2} w={invW} h={invH} label={invLabel} labelFs={invLabelFs} sub={batSub} bc="#777" lc={WHITE}/>;
                    })()}
                    {v.dc&&v.db && (
                      <>
                        <line x1={invCX} y1={cy+invH/2} x2={invCX} y2={cy+invH/2+22} stroke={WHITE} strokeWidth={2.5}/>
                        <BatIcon x={invCX-dcBatW/2} y={cy+invH/2+22} w={dcBatW} h={dcBatH} label={trunc(v.batLabel, 11) || "BATTERY"}/>
                      </>
                    )}
                  </>
                )}
                <line x1={invRightX} y1={cy} x2={pvX} y2={cy} stroke={WHITE} strokeWidth={2.5}/>
                <g>
                  <rect x={pvX} y={cy-pvH/2} width={pvW} height={pvH} rx={3} fill="#e8ede8" stroke="#666" strokeWidth={1.5}/>
                  {[0,1,2].map(c=>[0,1].map(r=>(
                    <rect key={`${c}${r}`} x={pvX+4+c*18} y={cy-pvH/2+5+r*15} width={13} height={11} rx={1} fill="none" stroke="#ccc" strokeWidth={1}/>
                  )))}
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
        {Object.keys(CONFIGS).map(k=>(
          <button key={k} onClick={()=>setKey(k)} style={{background:k===key?G:"#1a1a1a",color:k===key?"#000":"#aaa",border:`1px solid ${k===key?G:"#333"}`,borderRadius:999,padding:"5px 12px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{k}</button>
        ))}
      </div>
      <Diagram config={CONFIGS[key]}/>
    </div>
  );
}
