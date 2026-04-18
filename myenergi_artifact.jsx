// myenergi System Builder — self-contained React artifact

const { useState, useMemo, useRef, useEffect } = React;


// ── Inline device icon components (replace imported SVGs) ──────────
// These return data URIs via an SVG string — used as href in <image> tags
function makeSvgUri(svgContent) {
  return "data:image/svg+xml," + encodeURIComponent(svgContent);
}

const zappiImgUrl = makeSvgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120">
  <rect x="5" y="5" width="70" height="110" rx="8" fill="#1a1a1a" stroke="#40ff7a" stroke-width="2.5"/>
  <rect x="12" y="12" width="56" height="30" rx="4" fill="#111" stroke="#333" stroke-width="1"/>
  <text x="40" y="32" text-anchor="middle" fill="#40ff7a" font-size="11" font-weight="700" font-family="sans-serif">zappi</text>
  <text x="40" y="54" text-anchor="middle" fill="#fff" font-size="9" font-family="sans-serif">EV CHARGER</text>
  <rect x="18" y="62" width="44" height="22" rx="3" fill="#222" stroke="#40ff7a" stroke-width="1"/>
  <text x="40" y="77" text-anchor="middle" fill="#40ff7a" font-size="8" font-family="sans-serif">myenergi</text>
  <rect x="25" y="90" width="30" height="20" rx="3" fill="#333" stroke="#555" stroke-width="1"/>
  <circle cx="40" cy="100" r="6" fill="none" stroke="#40ff7a" stroke-width="1.5"/>
</svg>`);

const eddiImgUrl = makeSvgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 100">
  <rect x="4" y="4" width="62" height="92" rx="7" fill="#1a1a1a" stroke="#ff9900" stroke-width="2"/>
  <text x="35" y="28" text-anchor="middle" fill="#ff9900" font-size="11" font-weight="700" font-family="sans-serif">eddi</text>
  <text x="35" y="45" text-anchor="middle" fill="#aaa" font-size="8" font-family="sans-serif">WATER HEATER</text>
  <rect x="12" y="55" width="46" height="28" rx="4" fill="#222" stroke="#ff9900" stroke-width="1"/>
  <text x="35" y="73" text-anchor="middle" fill="#ff9900" font-size="8" font-family="sans-serif">myenergi</text>
</svg>`);

const eddiPlusImgUrl = makeSvgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 100">
  <rect x="4" y="4" width="62" height="92" rx="7" fill="#1a1a1a" stroke="#ffaa00" stroke-width="2"/>
  <text x="35" y="26" text-anchor="middle" fill="#ffaa00" font-size="11" font-weight="700" font-family="sans-serif">eddi+</text>
  <text x="35" y="43" text-anchor="middle" fill="#aaa" font-size="8" font-family="sans-serif">WATER HEATER</text>
  <text x="35" y="56" text-anchor="middle" fill="#ffaa00" font-size="7" font-family="sans-serif">3-PHASE</text>
  <rect x="12" y="65" width="46" height="25" rx="4" fill="#222" stroke="#ffaa00" stroke-width="1"/>
  <text x="35" y="81" text-anchor="middle" fill="#ffaa00" font-size="8" font-family="sans-serif">myenergi</text>
</svg>`);

const gloImgUrl = makeSvgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 80">
  <rect x="4" y="4" width="62" height="72" rx="7" fill="#1a1a1a" stroke="#56c1dd" stroke-width="2"/>
  <text x="35" y="26" text-anchor="middle" fill="#56c1dd" font-size="14" font-weight="700" font-family="sans-serif">GLO</text>
  <text x="35" y="42" text-anchor="middle" fill="#aaa" font-size="8" font-family="sans-serif">LOAD CTRL</text>
  <rect x="16" y="52" width="38" height="16" rx="3" fill="#222" stroke="#56c1dd" stroke-width="1"/>
  <text x="35" y="64" text-anchor="middle" fill="#56c1dd" font-size="7" font-family="sans-serif">myenergi</text>
</svg>`);

const harviImgUrl = makeSvgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 50">
  <rect x="3" y="3" width="74" height="44" rx="6" fill="#1a1a1a" stroke="#ffe066" stroke-width="2"/>
  <text x="40" y="20" text-anchor="middle" fill="#ffe066" font-size="11" font-weight="700" font-family="sans-serif">harvi</text>
  <text x="40" y="35" text-anchor="middle" fill="#aaa" font-size="8" font-family="sans-serif">WIRELESS CT</text>
</svg>`);

const libbiImgUrl = makeSvgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55 100">
  <rect x="3" y="3" width="49" height="94" rx="6" fill="#1a1a1a" stroke="#40c8c8" stroke-width="2"/>
  <text x="27" y="24" text-anchor="middle" fill="#40c8c8" font-size="10" font-weight="700" font-family="sans-serif">libbi</text>
  <rect x="8" y="30" width="39" height="42" rx="3" fill="#111" stroke="#40c8c8" stroke-width="1"/>
  <rect x="12" y="34" width="31" height="7" rx="1" fill="#40c8c8" opacity="0.9"/>
  <rect x="12" y="44" width="24" height="7" rx="1" fill="#40c8c8" opacity="0.7"/>
  <rect x="12" y="54" width="18" height="7" rx="1" fill="#40c8c8" opacity="0.4"/>
  <text x="27" y="87" text-anchor="middle" fill="#40c8c8" font-size="7" font-family="sans-serif">BATTERY</text>
</svg>`);

const gridImgUrl = makeSvgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 90">
  <line x1="30" y1="5" x2="30" y2="40" stroke="#888" stroke-width="2.5"/>
  <line x1="5" y1="15" x2="30" y2="5" stroke="#888" stroke-width="2"/>
  <line x1="55" y1="15" x2="30" y2="5" stroke="#888" stroke-width="2"/>
  <line x1="8" y1="28" x2="30" y2="18" stroke="#888" stroke-width="1.5"/>
  <line x1="52" y1="28" x2="30" y2="18" stroke="#888" stroke-width="1.5"/>
  <line x1="5" y1="15" x2="8" y2="28" stroke="#888" stroke-width="1.5"/>
  <line x1="55" y1="15" x2="52" y2="28" stroke="#888" stroke-width="1.5"/>
  <line x1="30" y1="40" x2="10" y2="55" stroke="#666" stroke-width="2"/>
  <line x1="30" y1="40" x2="50" y2="55" stroke="#666" stroke-width="2"/>
  <line x1="10" y1="55" x2="50" y2="55" stroke="#666" stroke-width="1.5"/>
  <line x1="10" y1="55" x2="5" y2="85" stroke="#666" stroke-width="2"/>
  <line x1="50" y1="55" x2="55" y2="85" stroke="#666" stroke-width="2"/>
  <line x1="5" y1="85" x2="55" y2="85" stroke="#888" stroke-width="2"/>
</svg>`);

const mainSbImgUrl = makeSvgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 50">
  <rect x="2" y="2" width="92" height="46" rx="4" fill="#2a2a2a" stroke="#555" stroke-width="1.5"/>
  <rect x="6" y="6" width="12" height="20" rx="2" fill="#444" stroke="#666" stroke-width="1"/>
  <rect x="21" y="6" width="12" height="20" rx="2" fill="#444" stroke="#666" stroke-width="1"/>
  <rect x="36" y="6" width="12" height="20" rx="2" fill="#444" stroke="#666" stroke-width="1"/>
  <rect x="51" y="6" width="12" height="20" rx="2" fill="#444" stroke="#666" stroke-width="1"/>
  <rect x="66" y="6" width="12" height="20" rx="2" fill="#444" stroke="#666" stroke-width="1"/>
  <rect x="81" y="6" width="11" height="20" rx="2" fill="#444" stroke="#666" stroke-width="1"/>
  <rect x="6" y="32" width="84" height="12" rx="2" fill="#333" stroke="#555" stroke-width="1"/>
</svg>`);


// ── Diagram helpers (from App.jsx) ──────────────────────────────

const G     = "#40ff7a";   // myenergi green (borders)
const G_TXT = "#1a6b35";   // dark green text for controller boxes
const DARK  = "#ffffff";   // diagram / page background (white)
const YELLOW= "#b07700";   // harvi / secondary amber (darkened for white bg)
const WHITE = "#111111";   // power lines (heavy black)
const MUTED = "#888";
const CT_COL= "#555";
const SIG   = "#aaa";
const BOX_BG= "#f2f2f2";   // infrastructure box fill
const phSp  = 7;

const DEVICE_IMGS = {
  harvi: harviImgUrl,
  libbi: libbiImgUrl,
  eddi:  eddiImgUrl,
  "eddi+": eddiPlusImgUrl,
  GLO:   gloImgUrl,
};
// Scale multipliers relative to base devW/devH
const DEVICE_SCALES = { zappi:2, eddi:1.5, "eddi+":1.5, libbi:2.25 };


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

function Diagram({ config }) {
  const { sp, inv, ab, wl, pr } = config;
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
  const VW=980, busY=175;
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
  const acBatBotY_eff = libbiIsBat_ac ? acBatTopY + libbiImgH : acBatTopY + acBatH;
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
  const nDevices = devList.length;
  const devStartCX = nDevices > 1 ? boardCX - Math.round((nDevices-1)*24/2) : boardCX;
  const ctrlX = devStartCX-devW/2;
  const ctrlCX = devStartCX;

  // ── Harvi positions — centred vertically between MAIN SWITCHBOARD and zappi ──
  // Always use minCtrlTopY so position is identical across all diagrams
  const harviTopY = Math.round((busY + boardH/2 + minCtrlTopY) / 2 - harviH/2);

  let leftHarvi=null, rightHarvis=[];

  if (use1phHarvi) {
    // Single harvi left of zappi — placed after we know ctrlTopY; placeholder cx here
    leftHarvi = { side:"left", forGrid:true, label:"harvi" };
  } else {
    if (gridToHarvi) {
      leftHarvi = { side:"left", x:ctrlCX-harviW-22, topY:harviTopY, cx:ctrlCX-harviW-22+harviW/2, bottomY:harviTopY+harviH, forGrid:true, label:"harvi 1" };
    }
    if (solarToHarvi && inv.some(v=>v.ms)) {
      const nSH = Math.ceil(solarCTcount/3);
      for (let i=0;i<nSH;i++) {
        const hx = ctrlCX+22 + i*(harviW+harviHGap);
        const maxCTY = i < nSH-1 ? invCYs[i] : Math.max(...invCYs.slice(i));
        const hTopY  = Math.max(harviTopY, maxCTY + 30);
        rightHarvis.push({ side:"right", x:hx, topY:hTopY, cx:hx+harviW/2, bottomY:hTopY+harviH, forGrid:false, idx:i,
          label: (gridToHarvi ? `harvi ${i+2}` : (nSH>1 ? `harvi ${i+1}` : "harvi")) });
      }
    }
    if (!gridToHarvi && rightHarvis.length===1) rightHarvis[0].label="harvi";
  }

  const allHarvis = [...(leftHarvi&&!use1phHarvi?[leftHarvi]:[]), ...rightHarvis];

  // Ensure ctrlTopY is below all right-harvi bottoms
  if (rightHarvis.length > 0) {
    const maxRHBot = Math.max(...rightHarvis.map(h=>h.bottomY));
    if (maxRHBot + 20 > ctrlTopY) ctrlTopY = maxRHBot + 20;
  }

  // Finalise 1ph harvi position (left of zappi) now we know ctrlTopY
  if (use1phHarvi) {
    leftHarvi.x = ctrlX - harviW - 16;
    leftHarvi.topY = harviTopY;
    leftHarvi.cx = ctrlX - harviW - 16 + harviW/2;
    leftHarvi.bottomY = harviTopY + harviH;
  }

  // ── CT landing zones ──────────────────────────────────────
  const gridLandXs  = nSitePh===3 ? [ctrlCX-18,ctrlCX-10,ctrlCX-2] : nSitePh===2 ? [ctrlCX-13,ctrlCX-5] : [ctrlCX-8];
  const solarLandXs = nSitePh===3 ? [ctrlCX+2, ctrlCX+10,ctrlCX+18] : nSitePh===2 ? [ctrlCX+5,ctrlCX+13] : [ctrlCX+8];

  const gridDestXs = gridToHarvi && leftHarvi ? [leftHarvi.cx] : gridLandXs;
  const gridDestY  = gridToHarvi && leftHarvi ? leftHarvi.topY : ctrlTopY;

  const solarDestFor = (i) => {
    if (!solarToHarvi) return { xs:solarLandXs, y:ctrlTopY };
    if (use1phHarvi)   return { xs:[leftHarvi.cx], y:leftHarvi.topY };
    const h = rightHarvis[Math.min(i, rightHarvis.length-1)];
    return h ? { xs:[h.cx], y:h.topY } : { xs:solarLandXs, y:ctrlTopY };
  };

  // Wireless landing on controller
  const harviLandXs = use1phHarvi
    ? gridLandXs.concat(solarLandXs)
    : (leftHarvi ? gridLandXs : solarLandXs);

  // ── Secondary device positions ────────────────────────────
  const nSec = pr.length-1;
  const zappiH = devHOf("zappi");
  const secXStep = 24; // horizontal stagger per secondary device
  const devPositions = devList.reduce((acc, name, i) => {
    if (i === 0) return [{ name, isCtrl:true, x:ctrlX, cx:ctrlCX, y:ctrlTopY }];
    const prev = acc[i-1];
    const cx = ctrlCX + i * secXStep;
    return [...acc, { name, isCtrl:false, x:cx-devWOf(name)/2, cx, y:prev.y + devHOf(prev.name) + devGap }];
  }, []);

  // ── Helpers ───────────────────────────────────────────────
  const gridCtX = Math.round(meterX+meterW+(boardX-meterX-meterW)*0.75);

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
  const VH = bottomAll+60; // extra padding so secondary devices are never clipped

  return (
    <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{background:DARK,borderRadius:8,display:"block"}}>

      {/* GRID */}
      <image href={gridImgUrl} x={pylonX-50} y={busY-90} width={100} height={90} preserveAspectRatio="xMidYMid meet"/>
      <text x={pylonX} y={busY+20} textAnchor="middle" fill={WHITE} fontSize={8} fontFamily="Overpass,sans-serif" fontWeight="700">GRID</text>

      {/* Pylon → Meter */}
      <SiteWire x1={pylonX+50} y1={busY} x2={meterX} y2={busY}/>
      <Blk x={meterX} y={busY-meterH/2} w={meterW} h={meterH} label="METER" bc={WHITE} lc={WHITE}/>

      {/* Meter → Grid CT → Board */}
      <SiteWire x1={meterX+meterW} y1={busY} x2={gridCtX-7} y2={busY}/>
      <SiteCTs x={gridCtX} y={busY} label={is3ph?"Grid CT×3":is2ph?"Grid CT×2":"Grid CT1"}/>
      <SigSet ctX={gridCtX} ctY={busY} osArr={siteOs} xsArr={siteXOs} dxs={gridDestXs} dy={gridDestY}/>
      <SiteWire x1={gridCtX+7} y1={busY} x2={boardX} y2={busY}/>

      {/* Main Switchboard */}
      <text x={boardCX} y={busY-boardH/2-10} textAnchor="middle" fill={WHITE} fontSize={8} fontWeight="700" fontFamily="Overpass,sans-serif">MAIN SWITCHBOARD</text>
      <image href={mainSbImgUrl} x={boardX} y={busY-boardH/2} width={boardW} height={boardH} preserveAspectRatio="none"/>

      {/* Horizontal bus from switchboard extending to rightmost device, then a vertical drop to each device */}
      {devPositions.length > 1 && (
        <line x1={devPositions[0].cx} y1={busY+boardH/2} x2={devPositions[devPositions.length-1].cx} y2={busY+boardH/2} stroke={WHITE} strokeWidth={3}/>
      )}
      {devPositions.map((d,i) => (
        <line key={`drop-${i}`} x1={d.cx} y1={busY+boardH/2} x2={d.cx} y2={d.y} stroke={WHITE} strokeWidth={3}/>
      ))}

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

      {/* myenergi devices — vertical stack on trunk */}
      {devPositions.map((d,i)=>(
        <g key={i}>
          {d.name === "zappi" ? (
            <>
              <defs>
                <clipPath id="zappi-clip">
                  <rect x={d.x-devW/2} y={d.y} width={devW*2} height={zappiH} rx={4}/>
                </clipPath>
              </defs>
              <image href={zappiImgUrl} x={d.x-devW/2} y={d.y} width={devW*2} height={zappiH}
                preserveAspectRatio="xMidYMid meet" clipPath="url(#zappi-clip)"/>
            </>
          ) : (
            <>
              <image href={DEVICE_IMGS[d.name]} x={d.cx-devWOf(d.name)/2} y={d.y} width={devWOf(d.name)} height={devHOf(d.name)} preserveAspectRatio="xMidYMid meet"/>
              <text x={d.cx+devWOf(d.name)/2+(d.isCtrl?30:10)} y={d.y+devHOf(d.name)/2} dominantBaseline="middle" textAnchor={d.isCtrl?"middle":"start"} fill={d.isCtrl?G_TXT:"#111111"} fontSize={7} fontWeight="700" fontFamily="Overpass,sans-serif">{d.isCtrl?"controller":"secondary"}</text>
            </>
          )}
          {/* WiFi between adjacent devices: points down (away from master/prev device toward slave) */}
          {!d.isCtrl && (
            <WiFi cx={Math.round((devPositions[i-1].cx+d.cx)/2)} cy={Math.round((devPositions[i-1].y+devHOf(devPositions[i-1].name)+d.y)/2)} rotate={180} color={WHITE} size={10}/>
          )}
        </g>
      ))}

      {/* AC Battery — rendered independently of solar so it appears even with no inverter */}
      {hasACBat && (
        <>
          {libbiIsBat_ac
            ? <image href={libbiImgUrl} x={acBatCX-libbiImgW/2} y={acBatTopY} width={libbiImgW} height={libbiImgH} preserveAspectRatio="xMidYMid meet"/>
            : <BatIcon x={acBatCX-acBatW/2} y={acBatTopY} w={acBatW} h={acBatH} label={trunc(ab[0]?.label, 11) || "BATTERY"}/>
          }
          {/* Battery → horizontal to boardCX → down to switchboard top */}
          <line x1={acBatCX-acBatW/2} y1={acBatLineY} x2={boardCX} y2={acBatLineY} stroke={WHITE} strokeWidth={2.5}/>
          <line x1={boardCX} y1={acBatLineY} x2={boardCX} y2={busY-boardH/2} stroke={WHITE} strokeWidth={2.5}/>
          {ab[0]?.mb && (
            <>
              <CT x={acBatCtX} y={acBatLineY} label="Bat CT3"/>
              <Curve x1={acBatCtX+5} y1={acBatLineY+8} x2={use1phHarvi?leftHarvi?.cx:solarLandXs[solarLandXs.length-1]} y2={use1phHarvi?leftHarvi?.topY:ctrlTopY} dashed={true} sw={1.3}/>
            </>
          )}
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


// ── SystemBuilder wizard (from systembuilder.jsx) ────────────────

const G = "#40ff7a", DARK = "#0d0d0d", CARD = "#1a1a1a", BORDER = "#252525";
const MUTED = "#666", WARN = "#f91561", YELLOW = "#ffe066", BLUE = "#56c1dd";

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
  { name: "Other",                acOnly: false, allInOne: false, autoBatId: null },
];

const BATTERIES = [
  { id: 14, label: "myenergi libbi",            type: "AC or DC" },
  { id: 4,  label: "Sigenergy SigenStor",       type: "DC Hybrid" },
  { id: 1,  label: "Tesla Powerwall 2",         type: "AC Coupled" },
  { id: 2,  label: "Tesla Powerwall 3",         type: "AC or DC" },
  { id: 3,  label: "Sungrow SBR / SBH",        type: "DC Hybrid" },
  { id: 11, label: "FoxESS ECS / HV series",   type: "DC Hybrid" },
  { id: 6,  label: "Alpha ESS Smile / Storion", type: "AC or DC" },
  { id: 16, label: "Growatt ARK / APX",        type: "DC Hybrid" },
  { id: 17, label: "Goodwe Lynx Home U/F / ESA", type: "DC Hybrid" },
  { id: 5,  label: "BYD HVS / HVM",            type: "DC Hybrid" },
  { id: 8,  label: "SolarEdge Home Battery",   type: "DC Hybrid" },
  { id: 9,  label: "Enphase IQ Battery",       type: "AC Coupled" },
  { id: 10, label: "iStore Battery",           type: "DC Hybrid" },
  { id: 12, label: "Franklin Home Power",      type: "AC Coupled" },
  { id: 15, label: "Fronius Reserva",         type: "DC Hybrid" },
  { id: 99, label: "Other",                    type: null },
];

// Batteries suitable for DC coupling (shown on inverter card)
const DC_BATTERIES = BATTERIES.filter(b => b.type === "DC Hybrid" || b.type === "AC or DC" || b.id === 99);
// Batteries suitable for standalone AC installation (shown on battery step)
const AC_BATTERIES = BATTERIES.filter(b => b.type === "AC Coupled" || b.type === "AC or DC" || b.id === 99);

const PRODUCTS = [
  { id: 2, name: "zappi multiphase (7 / 22kW)", ctsIncluded: 3, ctsSupported: 3 },
  { id: 3, name: "GLO",   ctsIncluded: 1, ctsSupported: 2 },
  { id: 4, name: "eddi",  ctsIncluded: 1, ctsSupported: 2 },
  { id: 5, name: "eddi+", ctsIncluded: 3, ctsSupported: 3 },
  { id: 6, name: "libbi", ctsIncluded: 1, ctsSupported: 3 },
];

// ── Translate SystemBuilder state → Diagram config ───────────────────────────
function buildDiagramConfig(cfg, wireless, monitorSolar, monitorBattery) {
  const { phase, inverters = [], batteries = [], selections = {} } = cfg;

  const sp = phase || "1ph";
  const wl = wireless || phase === "2ph";

  const inv = inverters
    .filter(i => i.brand)
    .map(i => {
      const coupledBat = i.hasCoupledBat && i.coupledBatId
        ? DC_BATTERIES.find(b => b.id === parseInt(i.coupledBatId))
        : null;
      return {
        ph: i.phase || (phase === "3ph" ? "3ph" : "1ph"),
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
      const t = found.type === "AC or DC" ? b.mode : found.type;
      return t === "AC Coupled";
    })
    .map(b => {
      const found = AC_BATTERIES.find(x => x.id === parseInt(b.id));
      return {
        mb: monitorBattery,
        label: parseInt(b.id) !== 99 ? (found?.label || null) : null,
      };
    });

  // zappi first (controller), then secondary devices in a consistent order
  const ORDER = [
    { id: 2, name: "zappi" },
    { id: 5, name: "eddi+" },
    { id: 4, name: "eddi" },
    { id: 3, name: "GLO" },
    { id: 6, name: "libbi" },
  ];
  const pr = [];
  ORDER.forEach(({ id, name }) => {
    const qty = selections[id] || 0;
    for (let q = 0; q < qty; q++) pr.push(name);
  });
  if (pr.length === 0) pr.push("zappi");

  return { sp, inv, ab, wl, pr };
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
  const box = { width: 48, height: 48, background: "#000", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", padding: 4, boxSizing: "border-box" };
  const url = ICON_URLS[name];
  if (url) return (
    <div style={box}>
      <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain", filter: "invert(1)" }}/>
    </div>
  );
  return <div style={{ ...box, fontSize: 9, color: MUTED, textAlign: "center", padding: 4 }}>{name}</div>;
}

const newInv = () => ({ uid: Math.random(), brand: "", phase: "", hasCoupledBat: false, coupledBatId: "", coupledBatMode: "" });
const newBat = () => ({ uid: Math.random(), id: "", mode: "" });

function resolveStandaloneBatType(bat) {
  const found = AC_BATTERIES.find(b => b.id === parseInt(bat.id));
  if (!found) return null;
  return found.type === "AC or DC" ? (bat.mode || null) : found.type;
}

function calcResults(cfg, monitorSolar, monitorBattery) {
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

  const validComps = comps.filter(c => c.cts > 0);
  const totalCTs = validComps.reduce((s, c) => s + c.cts, 0);
  const solarBatCTs = validComps.filter(c => c.isSolar || c.isBattery).reduce((s, c) => s + c.cts, 0);
  const gridCTs = validComps.filter(c => c.isGrid).reduce((s, c) => s + c.cts, 0);

  const selProds = Object.entries(selections || {}).map(([id, qty]) => ({ ...PRODUCTS.find(p => p.id === parseInt(id)), qty })).filter(p => p?.name && p.qty > 0);
  const master = selProds.reduce((best, p) => !best || p.ctsSupported > best.ctsSupported ? p : best, null);
  const ctsSupported = master?.ctsSupported || 0;
  const ctsIncluded = selProds.reduce((s, p) => s + p.ctsIncluded * p.qty, 0);
  const additionalCTs = Math.max(0, totalCTs - ctsIncluded);

  let harvisNeeded = 0;
  if (is1ph) {
    harvisNeeded = Math.ceil(Math.max(0, totalCTs - ctsSupported) / 3);
  } else if (is2ph) {
    // Grid CTs always need a dedicated harvi; solar CTs (if any) need separate harvis
    const sCTs = validComps.filter(c => c.isSolar).reduce((s, c) => s + c.cts, 0);
    harvisNeeded = 1 + (sCTs > 0 ? Math.ceil(sCTs / 3) : 0);
  } else {
    const acBatCTs = validComps.filter(c => c.isBattery && !c.label.startsWith("DC")).reduce((s, c) => s + c.cts, 0);
    const dcCTs = validComps.filter(c => c.isBattery && c.label.startsWith("DC")).reduce((s, c) => s + c.cts, 0);
    const sCTs = validComps.filter(c => c.isSolar).reduce((s, c) => s + c.cts, 0);
    harvisNeeded = Math.ceil((sCTs + acBatCTs + dcCTs) / 3);
    if (ctsSupported < gridCTs) harvisNeeded += Math.ceil((gridCTs - ctsSupported) / 3);
  }

  const hasSolar = inverters.some(i => i.brand);
  const hasAcBat = batteries.some(b => resolveStandaloneBatType(b) === "AC Coupled");

  return { validComps, totalCTs, gridCTs, solarBatCTs, harvisNeeded, ctsSupported, ctsIncluded, additionalCTs, selProds, master, is2ph, hasSolar, hasAcBat };
}

// ── Shared UI ────────────────────────────────────────────────────────────────
const SelBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ padding: "9px 20px", borderRadius: 999, cursor: "pointer", fontSize: 13, border: `1px solid ${active ? G : BORDER}`, background: active ? "rgba(64,255,122,0.1)" : CARD, color: active ? G : "#bbb", fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap" }}>{children}</button>
);
const SecLabel = ({ children }) => (
  <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{children}</div>
);
const NextBtn = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled} style={{ background: disabled ? BORDER : G, color: disabled ? MUTED : "#000", border: "none", borderRadius: 999, padding: "11px 28px", fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{children}</button>
);
const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ background: "none", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 999, padding: "11px 24px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
);
const AddBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: `1px dashed ${BORDER}`, color: G, borderRadius: 999, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", width: "100%", marginTop: 8, justifyContent: "center" }}>
    <span style={{ fontSize: 20, lineHeight: 1, fontWeight: 300 }}>+</span> {children}
  </button>
);
const Checkbox = ({ checked, onChange, label, sub, color }) => (
  <div style={{ padding: "12px 16px", background: CARD, border: `1px solid ${checked ? (color || G) : BORDER}`, borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }} onClick={onChange}>
    <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${checked ? (color || G) : MUTED}`, background: checked ? (color || G) : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
      {checked && <span style={{ color: "#000", fontSize: 13, fontWeight: 900, lineHeight: 1 }}>✓</span>}
    </div>
    <div>
      <div style={{ fontSize: 13, color: checked ? (color || G) : "#ddd" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

const selStyle = { background: CARD, border: `1px solid ${BORDER}`, color: "#ddd", borderRadius: 6, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" };
const th = { textAlign: "left", padding: "7px 10px", background: "#090909", color: G, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${BORDER}` };
const tdr = i => ({ padding: "8px 10px", background: i % 2 === 0 ? CARD : "#161616", borderBottom: `1px solid ${BORDER}`, fontSize: 12 });
const statBox = (label, val, col) => (
  <div style={{ flex: 1, padding: "14px 10px", background: CARD, borderRadius: 8, border: `1px solid ${BORDER}`, textAlign: "center" }}>
    <div style={{ fontSize: 28, fontWeight: 800, color: col }}>{val}</div>
    <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{label}</div>
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
    const autoTick = meta?.allInOne || false;
    const autoBatId = autoTick && meta?.autoBatId ? String(meta.autoBatId) : "";
    onChange({ ...inv, brand, hasCoupledBat: autoTick, coupledBatId: autoBatId, coupledBatMode: "" });
  };

  const handleHybridToggle = () => {
    const toggling = !inv.hasCoupledBat;
    const autoBatId = toggling && brandMeta?.autoBatId ? String(brandMeta.autoBatId) : "";
    onChange({ ...inv, hasCoupledBat: toggling, coupledBatId: autoBatId, coupledBatMode: "" });
  };

  return (
    <div style={{ background: CARD, border: `1px solid ${inv.brand ? G : BORDER}`, borderRadius: 8, padding: "14px 16px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: inv.brand ? G : MUTED, fontWeight: 600 }}>
          {inv.brand ? (inv.hasCoupledBat && coupledBat ? `${inv.brand} + ${coupledBat.label}` : inv.brand) : "Solar inverter"}
        </span>
        <button onClick={onRemove} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <SecLabel>Inverter Brand</SecLabel>
        <select value={inv.brand} onChange={e => handleBrandChange(e.target.value)} style={selStyle}>
          <option value="">Select brand...</option>
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

      {/* Hybrid checkbox — only shown for non-AC-only brands */}
      {inv.brand && !isAcOnly && (
        <div style={{ marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 12px", background: inv.hasCoupledBat ? "rgba(64,255,122,0.05)" : "#141414", borderRadius: 6, border: `1px solid ${inv.hasCoupledBat ? G : BORDER}` }}
            onClick={handleHybridToggle}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${inv.hasCoupledBat ? G : MUTED}`, background: inv.hasCoupledBat ? G : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {inv.hasCoupledBat && <span style={{ color: "#000", fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
            </div>
            <div>
              <div style={{ fontSize: 12, color: inv.hasCoupledBat ? G : "#aaa" }}>This is a hybrid inverter with a coupled DC battery</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>Solar and battery share one inverter — only one CT required</div>
            </div>
          </div>

          {inv.hasCoupledBat && !brandMeta?.allInOne && (
            <div style={{ marginTop: 10, paddingLeft: 8, borderLeft: `2px solid ${G}` }}>
              <SecLabel>Coupled Battery Brand</SecLabel>
              <select value={inv.coupledBatId} onChange={e => onChange({ ...inv, coupledBatId: e.target.value, coupledBatMode: "" })} style={selStyle}>
                <option value="">Select battery...</option>
                {[...DC_BATTERIES].sort((a, b) => {
                  const brand = inv.brand?.toLowerCase() || "";
                  const aMatch = a.label.toLowerCase().includes(brand) ? -1 : 0;
                  const bMatch = b.label.toLowerCase().includes(brand) ? -1 : 0;
                  return aMatch - bMatch;
                }).map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
              {needsBatMode && (
                <div style={{ marginTop: 10 }}>
                  <SecLabel>Coupling Mode</SecLabel>
                  <div style={{ display: "flex", gap: 8 }}>
                    <SelBtn active={inv.coupledBatMode === "DC Hybrid"} onClick={() => onChange({ ...inv, coupledBatMode: "DC Hybrid" })}>DC Hybrid</SelBtn>
                    <SelBtn active={inv.coupledBatMode === "AC Coupled"} onClick={() => onChange({ ...inv, coupledBatMode: "AC Coupled" })}>AC Coupled</SelBtn>
                  </div>
                </div>
              )}
            </div>
          )}
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
        <span style={{ fontSize: 12, color: bat.id ? G : MUTED, fontWeight: 600 }}>{found?.label || "Battery"}</span>
        <button onClick={onRemove} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
      </div>
      <div>
        <SecLabel>Brand / Model</SecLabel>
        <select value={bat.id} onChange={e => onChange({ ...bat, id: e.target.value, mode: "" })} style={selStyle}>
          <option value="">Select battery...</option>
          {AC_BATTERIES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      </div>
      {needsMode && (
        <div style={{ marginTop: 10 }}>
          <SecLabel>Installation Mode</SecLabel>
          <div style={{ display: "flex", gap: 8 }}>
            <SelBtn active={bat.mode === "AC Coupled"} onClick={() => onChange({ ...bat, mode: "AC Coupled" })}>AC Coupled</SelBtn>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: MUTED }}>For DC coupled installation, add this battery via the inverter card on the Site step.</div>
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState({ phase: null, inverters: [], batteries: [], selections: {} });
  const [wireless, setWireless] = useState(false);
  const [monitorSolar, setMonitorSolar] = useState(true);
  const [monitorBattery, setMonitorBattery] = useState(true);

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
        #results-page h2,
        #results-page div,
        #results-page span,
        #results-page td,
        #results-page th,
        #results-page p {
          background: white !important;
          color: black !important;
          border-color: #ccc !important;
        }
        #results-page thead th {
          background: #f0f0f0 !important;
        }
        #results-page tbody tr:nth-child(even) td {
          background: #f7f7f7 !important;
        }
        #results-page textarea {
          background: white !important;
          color: black !important;
          border: 1px solid #aaa !important;
        }
        #results-page svg { background: white !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.getElementById('sb-print-styles')?.remove();
  }, []);

  const exportPDF = () => {
    try {
      const prev = document.title;
      document.title = 'myenergi system design';
      window.print();
      document.title = prev;
    } catch(e) {
      alert('PDF export is not available in preview mode.');
    }
  };

  const result = useMemo(() => calcResults(cfg, monitorSolar, monitorBattery), [cfg, monitorSolar, monitorBattery]);
  const STEPS = ["Site", "Battery", "Products", "Results"];
  const needsInvPhase = cfg.phase === "3ph" || cfg.phase === "2ph";
  const step0ok = !!cfg.phase;
  const step2ok = Object.values(cfg.selections).some(q => q > 0);

  const ctConfig = useMemo(() => {
    if (!result) return [];
    const { validComps, ctsSupported } = result;
    const is3ph = cfg.phase === "3ph", is2ph = cfg.phase === "2ph", is1ph = cfg.phase === "1ph";
    const needsGridHarvi = is2ph || (is3ph && ctsSupported < 3) || (wireless && is1ph);
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
        if (wireless || is3ph || is2ph) { input = wireless && is1ph ? "harvi — CT2" : "harvi — pair wirelessly"; routing = "harvi"; }
        else { input = "CT2"; routing = "device"; }
      } else {
        if (wireless || is3ph || is2ph) { input = "harvi — pair wirelessly"; routing = "harvi"; }
        else { input = "CT3"; routing = "device"; }
      }
      rows.push({ component: comp.label, type: comp.isGrid ? "Grid" : comp.isSolar ? "Generation Only" : "Gen & Battery", input, routing, note, cts: comp.cts });
    });

    if (acBatComps.length > 0) {
      const totalAcCTs = acBatComps.reduce((s, c) => s + c.cts, 0);
      const label = acBatComps.length === 1 ? acBatComps[0].label : `AC Batteries (${acBatComps.length} units)`;
      let input, routing;
      if (wireless || is3ph || is2ph) { input = `harvi — pair wirelessly (${totalAcCTs} CT${totalAcCTs > 1 ? "s" : ""} share 1 harvi)`; routing = "harvi"; }
      else { input = "CT3"; routing = "device"; }
      rows.push({ component: label, type: "AC Battery", input, routing, note: acBatComps.length > 1 ? `${acBatComps.length} AC batteries share one harvi — connect each CT to available inputs on the same harvi unit.` : null, cts: totalAcCTs });
    }
    return rows;
  }, [result, cfg, wireless, monitorSolar, monitorBattery]);

  const incr = id => setCfg(c => { const tot = Object.values(c.selections).reduce((s,q)=>s+q,0); if(tot>=5) return c; return {...c, selections:{...c.selections,[id]:(c.selections[id]||0)+1}}; });
  const decr = id => setCfg(c => ({...c, selections:{...c.selections,[id]:Math.max(0,(c.selections[id]||0)-1)}}));
  const goToResults = () => { setMonitorSolar(true); setMonitorBattery(true); setStep(3); };
  const resetAll = () => { setStep(0);       setCfg({ phase: null, inverters: [], batteries: [], selections: {}, noSolar: false }); setWireless(false); setMonitorSolar(true); setMonitorBattery(true); };

  return (
    <div id="sb-app" style={{ background: DARK, minHeight: "100vh", fontFamily: "'Overpass', sans-serif", color: "#ddd", maxWidth: 660, margin: "0 auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=Overpass:ital,wght@0,300;0,700;1,800&display=swap" rel="stylesheet"/>

      <div id="step-tabs" style={{ display: "flex", background: "#0a0a0a", borderBottom: `1px solid ${BORDER}` }}>
        {STEPS.map((s, i) => (
          <div key={i} onClick={() => i < step && setStep(i)} style={{ flex: 1, padding: "10px 0", textAlign: "center", fontSize: 10, color: i === step ? G : i < step ? "#777" : "#3a3a3a", borderBottom: i === step ? `2px solid ${G}` : "2px solid transparent", cursor: i < step ? "pointer" : "default", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {i < step ? `✓ ${s}` : s}
          </div>
        ))}
      </div>

      <div style={{ padding: 24 }}>

        {/* STEP 0 */}
        {step === 0 && (
          <div>
            <h2 style={{ margin: "0 0 22px", color: "#fff", fontWeight: 800, fontStyle: "italic", fontSize: 18 }}>Site Details</h2>
            <div style={{ marginBottom: 24 }}>
              <SecLabel>Supply Phase</SecLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["1ph","2ph","3ph"].map(p => <SelBtn key={p} active={cfg.phase === p} onClick={() => setPhase(p)}>{p}</SelBtn>)}
              </div>
              {cfg.phase === "2ph" && <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(86,193,221,0.08)", border: `1px solid ${BLUE}`, borderRadius: 6, fontSize: 12, color: BLUE }}>ⓘ 2-phase installation is not a standard configuration, which can lead to unexpected device behaviour. We recommend contacting myenergi support before proceeding.</div>}
            </div>
            <div style={{ marginBottom: 24 }}>
              <SecLabel>Solar Inverters</SecLabel>
              <div style={{ marginBottom: 8 }}>
                <Checkbox
                  checked={cfg.noSolar || false}
                  onChange={() => setCfg(c => ({ ...c, noSolar: !c.noSolar, inverters: !c.noSolar ? [] : c.inverters }))}
                  label="No solar installed on this property"
                  sub="Skip inverter and battery configuration — go straight to product selection"
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
            <NextBtn onClick={() => cfg.noSolar ? setStep(2) : setStep(1)} disabled={!step0ok}>Next →</NextBtn>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ margin: "0 0 6px", color: "#fff", fontWeight: 800, fontStyle: "italic", fontSize: 18 }}>Battery</h2>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: MUTED }}>For standalone AC coupled batteries only. Skip if no battery is being installed.</p>
            <p style={{ margin: "0 0 20px", fontSize: 11, color: "#444" }}>If you have a DC coupled or hybrid battery, add it via the inverter card on the Site step.</p>
            {cfg.batteries.map((bat, i) => (
              <BatteryCard key={bat.uid} bat={bat}
                onChange={updated => setBatteries(prev => prev.map((x, j) => j === i ? updated : x))}
                onRemove={() => setBatteries(prev => prev.filter((_, j) => j !== i))}/>
            ))}
            {cfg.batteries.length === 0 && <AddBtn onClick={() => setBatteries(prev => [...prev, newBat()])}>Add battery</AddBtn>}
            {cfg.batteries.length > 0 && cfg.batteries.length < 3 && <AddBtn onClick={() => setBatteries(prev => [...prev, newBat()])}>Add another battery</AddBtn>}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <BackBtn onClick={() => setStep(0)}/>
              <NextBtn onClick={() => setStep(2)}>Next →</NextBtn>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (() => {
          const totalDevices = Object.values(cfg.selections).reduce((s, q) => s + q, 0);
          const atLimit = totalDevices >= 5;
          return (
            <div>
              <h2 style={{ margin: "0 0 6px", color: "#fff", fontWeight: 800, fontStyle: "italic", fontSize: 18 }}>myenergi Products</h2>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: MUTED }}>Multiple devices use controller/secondary config — CTs connect to controller only. Maximum 5 devices per system.</p>
              <div style={{ marginBottom: 12, fontSize: 12, color: atLimit ? WARN : MUTED }}>
                Devices selected: <span style={{ fontWeight: 700, color: atLimit ? WARN : G }}>{totalDevices} / 5</span>
                {atLimit && <span style={{ marginLeft: 8 }}>— Maximum reached</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {PRODUCTS.map(p => {
                  const qty = cfg.selections[p.id] || 0;
                  return (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: qty > 0 ? "rgba(64,255,122,0.07)" : CARD, border: `1px solid ${qty > 0 ? G : BORDER}`, borderRadius: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Icon name={p.name}/>
                        <div>
                          <div style={{ fontSize: 14, color: qty > 0 ? G : "#ddd", fontWeight: qty > 0 ? 700 : 400 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{p.ctsIncluded} CT{p.ctsIncluded !== 1 ? "s" : ""} included · supports {p.ctsSupported} CT{p.ctsSupported !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => decr(p.id)} style={{ background: "#222", border: "none", color: "#fff", borderRadius: 999, width: 30, height: 30, cursor: "pointer", fontSize: 18, lineHeight: 1, fontFamily: "inherit" }}>−</button>
                        <span style={{ width: 22, textAlign: "center", fontSize: 15, color: qty > 0 ? G : MUTED, fontWeight: 700 }}>{qty}</span>
                        <button onClick={() => incr(p.id)} style={{ background: atLimit ? "#333" : G, border: "none", color: atLimit ? "#555" : "#000", borderRadius: 999, width: 30, height: 30, cursor: atLimit ? "not-allowed" : "pointer", fontSize: 18, lineHeight: 1, fontFamily: "inherit" }}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <BackBtn onClick={() => cfg.noSolar ? setStep(0) : setStep(1)}/>
                <NextBtn onClick={goToResults} disabled={!step2ok}>View Results →</NextBtn>
              </div>
            </div>
          );
        })()}

        {/* STEP 3 */}
        {step === 3 && result && (() => {
          const harviTotal = result.harvisNeeded + (wireless && cfg.phase === "1ph" ? 1 : 0);
          const diagramConfig = buildDiagramConfig(cfg, wireless, monitorSolar, monitorBattery);
          return (
            <div id="results-page">
              <h2 style={{ margin: "0 0 16px", color: "#fff", fontWeight: 800, fontStyle: "italic", fontSize: 18 }}>System Summary</h2>
              {result.is2ph && <div style={{ marginBottom: 16, padding: "12px 14px", background: "rgba(86,193,221,0.08)", border: `1px solid ${BLUE}`, borderRadius: 6, fontSize: 12, color: BLUE }}>ⓘ 2-phase installation is not a standard configuration, which can lead to unexpected device behaviour. We recommend contacting myenergi support before proceeding.</div>}

              <div style={{ marginBottom: 20, padding: "10px 14px", background: CARD, borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ background: "#222", padding: "2px 8px", borderRadius: 4, color: "#ddd" }}>{cfg.phase}</span>
                {cfg.inverters.filter(i=>i.brand).map((inv,i)=>{
                  const cb = inv.hasCoupledBat && inv.coupledBatId ? DC_BATTERIES.find(b=>b.id===parseInt(inv.coupledBatId)) : null;
                  return <span key={i} style={{ background: "#222", padding: "2px 8px", borderRadius: 4, color: "#ddd" }}>{inv.brand}{cb ? ` + ${cb.label}` : ""}{inv.phase ? ` (${inv.phase})` : ""}</span>;
                })}                {cfg.batteries.filter(b=>b.id).map((bat,i)=>{ const f=AC_BATTERIES.find(x=>x.id===parseInt(bat.id)); return <span key={i} style={{ background: "#222", padding: "2px 8px", borderRadius: 4, color: "#ddd" }}>{f?.label} (AC)</span>; })}
              </div>

              {(result.hasSolar || result.hasAcBat) && (
                <div style={{ marginBottom: 16 }}>
                  <SecLabel>Monitoring Options</SecLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.hasSolar && <Checkbox checked={monitorSolar} onChange={() => setMonitorSolar(m => !m)} label="Monitor solar generation" sub="Required to see self-consumption % and solar output on your myenergi device + app. Solar-aware charging is not impacted."/>}
                    {result.hasAcBat && <Checkbox checked={monitorBattery} onChange={() => setMonitorBattery(m => !m)} label="Monitor battery output" sub="Shows battery charge/discharge on your myenergi device + app. Solar-aware charging is not impacted."/>}
                  </div>
                </div>
              )}

              {cfg.phase === "1ph" && (
                <div style={{ marginBottom: 20 }}>
                  <Checkbox checked={wireless} onChange={() => setWireless(w => !w)} label="Use wireless CT connection (harvi)" sub="Tick if CTs will connect via harvi instead of directly to the myenergi device" color={YELLOW}/>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                {statBox("CTs Required", result.totalCTs, "#fff")}
                {statBox("CTs Included", result.ctsIncluded, "#fff")}
                {statBox("Additional CTs", result.additionalCTs, result.additionalCTs > 0 ? G : MUTED)}
                {statBox("harvis Required", harviTotal, harviTotal > 0 ? YELLOW : MUTED)}
              </div>

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
                            <td style={{ ...tdr(i), color: "#ccc" }}>{row.component}</td>
                            <td style={{ ...tdr(i), textAlign: "center", color: G, fontWeight: 700 }}>{row.cts}</td>
                            <td style={{ ...tdr(i), color: BLUE }}>{row.type}</td>
                            <td style={{ ...tdr(i), color: row.routing === "harvi" ? YELLOW : MUTED }}>{row.input}</td>
                            <td style={{ ...tdr(i), color: row.routing === "harvi" ? YELLOW : MUTED }}>
                              {row.routing === "harvi" && wireless && cfg.phase === "1ph" ? `→ wire to harvi, pair with ${result.master?.name || "myenergi device"}` : row.routing === "harvi" ? "→ harvi" : "→ wire to myenergi device"}
                            </td>
                          </tr>
                          {row.note && <tr><td colSpan={5} style={{ padding: "6px 10px 10px", background: i % 2 === 0 ? CARD : "#161616", borderBottom: `1px solid ${BORDER}` }}><div style={{ padding: "7px 10px", background: "rgba(255,224,102,0.08)", border: "1px solid rgba(255,224,102,0.3)", borderRadius: 5, fontSize: 11, color: YELLOW }}>⚠️ {row.note}</div></td></tr>}
                        </React.Fragment>
                      ))}
                      <tr>
                        <td style={{ padding: "8px 10px", color: "#fff", fontWeight: 700, borderTop: `2px solid ${BORDER}`, fontSize: 12 }}>Total</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: G, fontWeight: 700, borderTop: `2px solid ${BORDER}`, fontSize: 12 }}>{result.totalCTs}</td>
                        <td colSpan={3} style={{ borderTop: `2px solid ${BORDER}` }}/>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

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
                        <td style={tdr(i)}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon name={p.name}/><span style={{ color: "#ddd" }}>{p.name}</span></div></td>
                        <td style={{ ...tdr(i), textAlign: "center", color: "#fff", fontWeight: 700 }}>{p.qty}</td>
                      </tr>
                    ))}
                    {harviTotal > 0 && (() => { const i = result.selProds.length; return (
                      <tr><td style={tdr(i)}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon name="harvi"/><span style={{ color: "#ddd" }}>harvi</span></div></td><td style={{ ...tdr(i), textAlign: "center", color: YELLOW, fontWeight: 700 }}>{harviTotal}</td></tr>
                    ); })()}
                    {result.additionalCTs > 0 && (() => { const i = result.selProds.length + (harviTotal > 0 ? 1 : 0); return (
                      <tr><td style={{ ...tdr(i), color: "#ddd" }}>Additional CT clamps</td><td style={{ ...tdr(i), textAlign: "center", color: G, fontWeight: 700 }}>{result.additionalCTs}</td></tr>
                    ); })()}
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Wiring Diagram</div>
                <Diagram config={diagramConfig} />
              </div>

              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Notes</div>
                <textarea
                  placeholder="Add notes here…"
                  style={{ width: "100%", minHeight: 100, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, color: "#ddd", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              <div className="no-print" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={resetAll} style={{ background: "none", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 999, padding: "11px 24px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Start over</button>
                <button onClick={exportPDF} style={{ background: G, color: "#000", border: "none", borderRadius: 999, padding: "11px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Export PDF</button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}