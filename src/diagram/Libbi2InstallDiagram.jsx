import gridImgUrl from "../grid.svg";
import ctrlImgUrl from "../libbi2-controller.svg";
import { SolarPanel } from "./SolarPanel.jsx";
import { libbi2Summary, REGIONS, DEFAULT_LIBBI2, EARTH_GREEN, EARTH_YELLOW, amps } from "../libbi2.js";

// Installation schematic for libbi 2 (after PM-00043 Figs 3-6,
// 3-8, 3-10, 3-11, 3-12). Unlike the ecosystem Diagram in App.jsx, this
// shows one libbi 2 install in detail: switchboard circuits with their
// protection, inverter ports, battery stack, EPS, PV, CTs and earthing.
// Layout is fixed-grid on purpose — every optional element has a reserved
// slot, so toggling EPS/coupling/region never moves anything else.

const INK = "#111", MUTED = "#888", BOX = "#f0f0f0", BG = "#ffffff";
const EPS_COL = "#cc006a", DC_COL = "#d97706", SIG = "#999", EARTH = EARTH_GREEN;
const FONT = "Overpass,sans-serif";

const T = ({ x, y, children, fs = 7, fill = INK, anchor = "start", bold = false }) => (
  <text x={x} y={y} textAnchor={anchor} fill={fill} fontSize={fs} fontWeight={bold ? 700 : 400} fontFamily={FONT}>{children}</text>
);
const Mcb = ({ x, y, label, col = INK }) => (
  <g>
    <rect x={x} y={y - 7} width={28} height={14} rx={2} fill={BOX} stroke={col} strokeWidth={1.3}/>
    <T x={x + 14} y={y + 2.5} anchor="middle" fs={6.5} bold fill={col}>{label}</T>
  </g>
);
const Rcd = ({ x, y, col = INK }) => (
  <g>
    <rect x={x} y={y - 7} width={28} height={14} rx={2} fill="#fff" stroke={col} strokeWidth={1.3} strokeDasharray="3 1.5"/>
    <T x={x + 14} y={y + 2.5} anchor="middle" fs={6.5} bold fill={col}>RCD</T>
  </g>
);
const CtOnH = ({ x, y }) => <rect x={x - 5} y={y - 8} width={10} height={16} rx={1.5} fill="#555" stroke="#333" strokeWidth={0.8}/>;
const CtOnV = ({ x, y }) => <rect x={x - 8} y={y - 5} width={16} height={10} rx={1.5} fill="#555" stroke="#333" strokeWidth={0.8}/>;
const L = ({ pts, col = INK, w = 2.2, dash }) => {
  const d = pts.map(p => p.join(",")).join(" ");
  // White conductors (AU L2) get a grey casing so they read on the white page
  return (
    <g>
      {col.toLowerCase() === "#ffffff" && <polyline points={d} fill="none" stroke="#888" strokeWidth={w + 1.6} strokeLinejoin="round"/>}
      <polyline points={d} fill="none" stroke={col} strokeWidth={w} strokeDasharray={dash} strokeLinejoin="round"/>
    </g>
  );
};
const Earth = ({ pts }) => <><L pts={pts} col={EARTH_GREEN} w={2}/><L pts={pts} col={EARTH_YELLOW} w={2} dash="4 4"/></>;
const NOFF = 10; // neutral drawn this far below / right of its line conductor
const Pv = ({ x, y }) => <SolarPanel x={x} y={y} w={62} h={40}/>;

export function Libbi2InstallDiagram({ libbi2 = DEFAULT_LIBBI2, region = "aunz", sitePhase = "1ph", hasThirdPartyPv = false, backupCircuits = [] }) {
  const s = libbi2Summary(libbi2);
  const reg = REGIONS.find(r => r.id === region) || REGIONS.find(r => r.id === "aunz");
  const isAu = reg.id === "aunz";
  const cc = reg.conductors, LC = cc.L[0], NC = cc.N;
  const eps = !!libbi2.eps;
  const showPv = s.hasPv;
  const show3p = hasThirdPartyPv;
  const is3ph = sitePhase === "3ph";

  // Fixed grid
  const SY = 70;                                  // incoming supply
  const BX = 215, BY = 40, BW = 270, BH = 335;    // main switchboard
  const BUSX = 255, MCBX = 265, RCDX = 301;
  const R_CTRL = 95, R_GRID = 140, R_3P = 230, R_LOAD = 295;
  const IX = 600, IW = 90, IY = 60, IH = 120;     // libbi 2 inverter
  const P_COMMS = 80, P_GRID = R_GRID, P_EPS = 165, P_PV1 = 88, P_PV2 = 113;
  // libbi 2 controller sits above the switchboard, beside the libbi 2.
  // The viewBox starts TOP above zero to make room, so its y is negative.
  const TOP = 80;
  const CX = 415, CW = 50, CH = 64, CY = -CH - 6;
  const CSUP = 440;                               // controller supply riser
  const EPSX = 560;
  // Modules are drawn taller than the old strips (real module 725×418 mm vs
  // inverter 725×390). Up to 4 sit under the inverter; the rest form a
  // second stack alongside with no inverter on top.
  const modH = 48, perStack = 4, stackTop = IY + IH + 4;
  const stack1 = Math.min(s.modules, perStack), stack2 = Math.max(0, s.modules - perStack);
  const S2X = IX + IW + 12;
  const stackBot = stackTop + stack1 * modH;
  const earthY = Math.max(412, stackBot + 30);
  const EB = { x: 545, y: Math.max(440, earthY + 28), w: 170 };
  EB.h = 58 + Math.max(1, backupCircuits.length) * 11;

  const notesY = 128;
  const notes = [...reg.earthingNotes, `Grid code: ${reg.gridCodes.join(" / ")}.`];
  // Crude wrap to fit the left column (~48 chars at 6.6px)
  const wrap = str => str.split(" ").reduce((lines, w) => {
    const last = lines[lines.length - 1];
    if ((last + " " + w).trim().length > 46) lines.push(w); else lines[lines.length - 1] = (last + " " + w).trim();
    return lines;
  }, [""]);
  const noteLines = notes.flatMap(n => wrap(n).map((l, i) => (i === 0 ? "• " : "  ") + l));
  const legendY = notesY + 16 + noteLines.length * 10 + 18;
  const legend = [
    ...(is3ph
      ? cc.L.map((c, i) => ({ col: c, label: `L${i + 1} · ${cc.names[i]}` }))
      : [{ col: LC, label: `Line (L1) · ${cc.names[0]}` }]),
    { col: NC, label: `Neutral · ${cc.nName}` },
    { col: EARTH, label: "Protective earth · Green/Yellow", earth: true },
    ...(showPv ? [{ col: DC_COL, label: "PV DC (≤ 500 V)" }] : []),
    { col: SIG, label: "CT signal / RS485 comms", dash: "5 3" },
  ];

  const H = Math.max(eps ? EB.y + EB.h : 0, show3p ? 540 : 480, legendY + legend.length * 13) + 14 + TOP;

  return (
    <svg width="100%" viewBox={`0 ${-TOP} 830 ${H}`} style={{ background: BG, borderRadius: 8, display: "block" }}>
      {/* ── Supply: grid → meter → grid CT → main switch ─────────────── */}
      <image href={gridImgUrl} x={2} y={6} width={76} height={66} preserveAspectRatio="xMidYMid meet"/>
      <T x={40} y={92} anchor="middle" bold fs={8}>GRID</T>
      {(is3ph ? [-6, 0, 6] : [0]).map((o, i) => <L key={i} pts={[[72, SY + o], [225, SY + o]]} col={cc.L[i]} w={is3ph ? 2.2 : 3}/>)}
      <L pts={[[72, SY + (is3ph ? 16 : NOFF)], [BX, SY + (is3ph ? 16 : NOFF)]]} col={NC} w={2.2}/>
      <rect x={95} y={SY - 17} width={56} height={34} rx={4} fill={BOX} stroke={INK} strokeWidth={1.5}/>
      <T x={123} y={SY + 3} anchor="middle" bold fs={8}>METER</T>
      <CtOnH x={180} y={SY}/>
      <T x={180} y={SY + 28} anchor="middle" bold fs={6.8} fill="#555">{is3ph ? "GRID CT ×3" : "GRID CT · L1"}</T>
      <T x={180} y={SY + 37} anchor="middle" fs={6.5} fill="#555">{is3ph ? "→ CT1–CT3" : "→ CT1"}</T>
      <L pts={[[180, SY - 8], [180, CY + 22], [CX, CY + 22]]} col={SIG} w={1.3} dash="5 3"/>

      {/* ── Main switchboard ─────────────────────────────────────────── */}
      <T x={BX + BW / 2} y={BY - 8} anchor="middle" bold fs={8}>MAIN SWITCHBOARD</T>
      <rect x={BX} y={BY} width={BW} height={BH} rx={4} fill="none" stroke={INK} strokeWidth={1.5}/>
      <rect x={225} y={SY - 7} width={16} height={14} rx={2} fill={BOX} stroke={INK} strokeWidth={1.4}/>
      <T x={233} y={88} anchor="middle" fs={6.3} bold>MAIN</T>
      <L pts={[[241, SY], [BUSX, SY], [BUSX, R_LOAD]]} col={LC} w={3}/>

      {/* Controller supply — top row, rises out of the board to the controller */}
      <L pts={[[BUSX, R_CTRL], [MCBX, R_CTRL]]} col={LC}/>
      <Mcb x={MCBX} y={R_CTRL} label="3A"/>
      <L pts={[[MCBX + 28, R_CTRL], [CSUP, R_CTRL], [CSUP, CY + CH]]} col={LC}/>
      <L pts={[[CSUP + NOFF, BY], [CSUP + NOFF, CY + CH]]} col={NC}/>
      <T x={300} y={R_CTRL - 8} bold fs={7.2}>libbi 2 controller · L1</T>
      <T x={MCBX} y={R_CTRL + 17} fs={6.3} fill="#444">3 A MCB (6 A max) · 1.5 mm² · not from EPS</T>

      {/* libbi 2 grid circuit */}
      <L pts={[[BUSX, R_GRID], [MCBX, R_GRID]]} col={LC}/>
      <Mcb x={MCBX} y={R_GRID} label={amps(s.inverter.gridBreakerA).replace(" ", "")}/>
      <L pts={[[MCBX + 28, R_GRID], [RCDX, R_GRID]]} col={LC}/>
      <Rcd x={RCDX} y={R_GRID}/>
      <L pts={[[RCDX + 28, R_GRID], [IX, P_GRID]]} col={LC} w={2.6}/>
      <L pts={[[BX + BW, P_GRID + NOFF], [IX, P_GRID + NOFF]]} col={NC}/>
      <T x={345} y={R_GRID - 8} bold fs={7.2}>libbi 2 grid supply</T>
      <T x={MCBX} y={R_GRID + 17} fs={6.3} fill="#444">{`${amps(s.inverter.gridBreakerA)} MCB · 300 mA Type A RCD${s.inverter.provisional ? "" : " · 6–10 mm²"}`}</T>

      {/* Existing solar inverter (AC / DC + standalone) */}
      {show3p && (
        <g>
          <L pts={[[BUSX, R_3P], [MCBX, R_3P]]} col={LC}/>
          <Mcb x={MCBX} y={R_3P} label="MCB"/>
          <L pts={[[MCBX + 28, R_3P], [385, R_3P], [385, 430]]} col={LC}/>
          <L pts={[[385 + NOFF, BY + BH], [385 + NOFF, 430]]} col={NC}/>
          <T x={300} y={R_3P - 8} bold fs={7}>Existing solar inverter</T>
          <T x={300} y={R_3P + 15} fs={6.3} fill="#444">MCB per manufacturer</T>
          <CtOnV x={385} y={400}/>
          <T x={371} y={404} anchor="end" bold fs={6.5} fill="#555">{is3ph ? "GEN CT → harvi" : "GEN CT → CT2"}</T>
          <L pts={[[393, 398], [520, 398], [520, 14], [CX + CW - 8, 14], [CX + CW - 8, CY + CH]]} col={SIG} w={1.3} dash="5 3"/>
          <rect x={345} y={430} width={80} height={34} rx={4} fill={BOX} stroke="#777" strokeWidth={1.5}/>
          <T x={385} y={445} anchor="middle" bold fs={7}>SOLAR</T>
          <T x={385} y={455} anchor="middle" bold fs={7}>INVERTER</T>
          <L pts={[[385, 464], [385, 480]]} col={DC_COL}/>
          <Pv x={354} y={480}/>
          <T x={422} y={503} fs={6.5} fill="#555">existing PV</T>
        </g>
      )}

      {/* Normal loads */}
      <L pts={[[BUSX, R_LOAD], [MCBX, R_LOAD]]} col={LC}/>
      <Mcb x={MCBX} y={R_LOAD} label="MCB"/>
      <L pts={[[MCBX + 28, R_LOAD], [MCBX + 28, 430]]} col={LC}/>
      <L pts={[[MCBX + 28 + NOFF, BY + BH], [MCBX + 28 + NOFF, 430]]} col={NC}/>
      <T x={300} y={R_LOAD - 4} bold fs={7}>Normal loads</T>
      <rect x={248} y={430} width={90} height={32} rx={4} fill={BOX} stroke="#777" strokeWidth={1.5}/>
      <T x={293} y={444} anchor="middle" bold fs={7}>NORMAL LOADS</T>
      <T x={293} y={454} anchor="middle" fs={6.3} fill="#555">not backed up</T>

      {/* Neutral / earth bars (+ MEN link in AU/NZ) */}
      <rect x={400} y={326} width={70} height={8} rx={1} fill={BOX} stroke={NC} strokeWidth={1.6}/>
      <T x={395} y={333} anchor="end" bold fs={6.5} fill={NC}>N</T>
      <rect x={400} y={350} width={70} height={8} rx={1} fill={BOX} stroke={EARTH} strokeWidth={1.3}/>
      <T x={395} y={357} anchor="end" bold fs={6.5} fill={EARTH}>E</T>
      {isAu
        ? <><L pts={[[410, 334], [410, 350]]} col={INK} w={2}/><T x={416} y={345} bold fs={6.2}>MEN LINK</T></>
        : <T x={416} y={345} fs={6.2} fill={MUTED}>no N–E link</T>}

      {/* ── libbi 2 controller ───────────────────────────────────────── */}
      <image href={ctrlImgUrl} x={CX} y={CY} width={CW} height={CH} preserveAspectRatio="xMidYMid meet"/>
      <T x={CX - 6} y={CY + 40} anchor="end" bold fs={7.5}>libbi 2 controller</T>
      <T x={CX - 6} y={CY + 50} anchor="end" fs={6.3} fill="#555">CT1 · CT2 · CT3 · RS485</T>
      <L pts={[[CX + CW, CY + 22], [590, CY + 22], [590, P_COMMS], [IX, P_COMMS]]} col={SIG} w={1.3} dash="5 3"/>

      {/* ── libbi 2 inverter + battery stack ─────────────────────────── */}
      <T x={IX + IW / 2} y={IY - 18} anchor="middle" bold fs={8}>{`libbi 2 · ${s.inverter.label}`}</T>
      <T x={IX + IW / 2} y={IY - 8} anchor="middle" fs={6.5} fill="#555">{s.inverter.model || "specifications TBC"}</T>
      <rect x={IX} y={IY} width={IW} height={IH} rx={2} fill="#ffffff" stroke={INK} strokeWidth={1.6}/>
      <rect x={IX + IW / 2 - 7} y={IY + 10} width={14} height={40} rx={7} fill={INK}/>
      <T x={IX + 4} y={P_GRID + 3} bold fs={6.5}>GRID</T>
      <T x={IX + 4} y={P_EPS + 3} bold fs={6.5} fill={eps ? EPS_COL : MUTED}>{eps ? "EPS" : "EPS ×"}</T>
      <T x={IX + 4} y={P_COMMS + 3} bold fs={6.5}>COMMS</T>
      {showPv && <><T x={IX + IW - 4} y={P_PV1 + 3} anchor="end" bold fs={6.5} fill={DC_COL}>PV1</T>
                   <T x={IX + IW - 4} y={P_PV2 + 3} anchor="end" bold fs={6.5} fill={DC_COL}>PV2</T></>}
      {[[IX, stack1], [S2X, stack2]].map(([sx, n], si) => n > 0 && (
        <g key={si}>
          {Array.from({ length: n }).map((_, i) => (
            <g key={i}>
              <rect x={sx} y={stackTop + i * modH} width={IW} height={modH} fill="#ffffff" stroke={INK} strokeWidth={1.4}/>
              <T x={sx + IW / 2} y={stackTop + i * modH + modH / 2 + 3} anchor="middle" fs={7} fill="#333">{`${s.moduleKWh} kWh`}</T>
            </g>
          ))}
          <rect x={sx + 4} y={stackTop + n * modH} width={8} height={5} fill={INK}/>
          <rect x={sx + IW - 12} y={stackTop + n * modH} width={8} height={5} fill={INK}/>
        </g>
      ))}
      {stack2 > 0 && <L pts={[[IX + IW, stackTop + 12], [S2X, stackTop + 12]]} col={INK} w={1.2} dash="2 2"/>}
      <T x={stack2 ? (IX + S2X + IW) / 2 : IX + IW / 2} y={stackBot + 17} anchor="middle" bold fs={6.8}>{`${s.modules} × ${s.moduleKWh} kWh modules · ${s.capacityKWh} kWh`}</T>

      {/* PV on libbi 2 (DC / DC + standalone) */}
      {showPv && (
        <g>
          <L pts={[[IX + IW, P_PV1], [745, P_PV1]]} col={DC_COL} w={2.2}/>
          <L pts={[[IX + IW, P_PV2], [745, P_PV2]]} col={DC_COL} w={2.2}/>
          <rect x={712} y={P_PV1 - 9} width={20} height={P_PV2 - P_PV1 + 18} rx={2} fill={BOX} stroke={DC_COL} strokeWidth={1.4}/>
          <T x={722} y={P_PV1 - 14} anchor="middle" bold fs={6.3} fill={DC_COL}>PV ISOLATOR</T>
          <Pv x={748} y={80}/>
          <T x={779} y={133} anchor="middle" bold fs={7.5}>PV ARRAY</T>
          <T x={779} y={143} anchor="middle" fs={6.3} fill="#555">{s.inverter.pvMaxV ? `2 strings · ≤ ${s.inverter.pvMaxV} V` : "PV limits TBC"}</T>
        </g>
      )}

      {/* EPS → backup section */}
      {eps && (
        <g>
          <L pts={[[IX, P_EPS], [EPSX, P_EPS], [EPSX, EB.y]]} col={LC} w={2.4}/>
          <L pts={[[IX, P_EPS + NOFF], [EPSX + NOFF, P_EPS + NOFF], [EPSX + NOFF, EB.y]]} col={NC}/>
          <rect x={EB.x} y={EB.y} width={EB.w} height={EB.h} rx={4} fill="none" stroke={EPS_COL} strokeWidth={1.5}/>
          <T x={EB.x + 54} y={EB.y + 14} bold fs={7.2} fill={EPS_COL}>EPS / BACKUP CIRCUITS</T>
          <Mcb x={EB.x + 12} y={EB.y + 30} label={amps(s.inverter.epsBreakerA).replace(" ", "")} col={EPS_COL}/>
          <Rcd x={EB.x + 46} y={EB.y + 30} col={EPS_COL}/>
          <T x={EB.x + 80} y={EB.y + 33} fs={6.3} fill="#444">300 mA Type A · 6 mm²</T>
          <T x={EB.x + 12} y={EB.y + 50} fs={6.3} fill="#444">{`Max ${amps(s.inverter.epsRatedA)} · no EV, heat pump or oven`}</T>
          {(backupCircuits.length ? backupCircuits : ["Essential circuits (select in wizard)"]).map((c, i) => (
            <T key={c} x={EB.x + 12} y={EB.y + 64 + i * 11} fs={6.8}>{`• ${c}`}</T>
          ))}
        </g>
      )}

      {/* Chassis protective earth → main earth bar */}
      <Earth pts={[[IX, stackBot - 10], [IX - 10, stackBot - 10], [IX - 10, earthY], [470, earthY], [470, 358]]}/>
      <T x={476} y={earthY + 12} fs={6.3} fill={EARTH}>6 mm² PE</T>

      {/* ── Left column: region notes + legend ───────────────────────── */}
      <T x={8} y={notesY} bold fs={7.5}>{`${reg.label.toUpperCase()} WIRING`}</T>
      {noteLines.map((l, i) => <T key={i} x={8} y={notesY + 14 + i * 10} fs={6.6} fill="#333">{l}</T>)}
      <T x={8} y={legendY} bold fs={7.5}>KEY</T>
      {legend.map((k, i) => (
        <g key={k.label}>
          {k.earth
            ? <Earth pts={[[8, legendY + 10 + i * 13], [30, legendY + 10 + i * 13]]}/>
            : <L pts={[[8, legendY + 10 + i * 13], [30, legendY + 10 + i * 13]]} col={k.col} w={2} dash={k.dash}/>}
          <T x={36} y={legendY + 13 + i * 13} fs={6.6}>{k.label}</T>
        </g>
      ))}
    </svg>
  );
}
