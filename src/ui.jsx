import { useState, useEffect } from "react";

// ── Shared visual building blocks for the wizard ─────────────────────────────
// Customer-first: pictures and one-line labels up front, explanations behind
// an ⓘ tip, installer detail behind the Installer view. Green means
// "selected" only; information uses the neutral blue note.

export const UI = {
  G: "#40ff7a", DARK: "#000000", CARD: "#343434", CARD2: "#262626", BORDER: "#4a4a4a",
  MUTED: "#8a8a8a", TEXT: "#dddddd", WARN: "#ff008c", BLUE: "#56c1dd", DC: "#d97706",
};
const { G, CARD, CARD2, BORDER, MUTED, TEXT, WARN, BLUE, DC } = UI;

// Plain-language explanations for terms of art
export const GLOSSARY = {
  CT: "A CT clamp is a small sensor that clips around a cable to measure the power flowing through it. No rewiring needed.",
  harvi: "harvi is a wireless sensor. It reads CT clamps that are too far from the myenergi device and sends the readings wirelessly. It needs no power supply.",
  EPS: "EPS (emergency power supply) keeps selected circuits running from the battery during a power cut. Switchover takes about 20 ms, so it is not a UPS.",
  RCD: "An RCD is a safety switch that cuts power if current leaks to earth. myenergi devices use Type A RCDs; libbi 2 circuits need 300 mA Type A.",
  MCB: "An MCB is the circuit breaker in the switchboard that protects the cable from overload.",
  DC: "DC coupled: solar panels plug straight into libbi 2. It converts solar once, which is the most efficient option for new solar.",
  AC: "AC coupled: libbi 2 connects to the switchboard and stores surplus from solar that already has its own inverter. Ideal for adding a battery to existing solar.",
  controller: "The controller is the myenergi device the CT clamps connect to. It shares readings with the other devices. It is chosen for you, and you can change it under Adjust design.",
  phase: "Most homes have single-phase power. Three-phase supplies have three active cables and usually a larger main switch. Your electricity bill or switchboard will show it.",
  hybrid: "A hybrid inverter runs solar panels and a battery through one box (for example Sigenergy, Sungrow or Tesla Powerwall 3).",
  monitor: "Monitoring adds a CT clamp so the myenergi app can show this power. Solar-aware charging works either way.",
  split: "Wires the myenergi device on its own circuit, so off-peak grid charging doesn't drain the home battery.",
  csip: "On a CSIP-AUS site the network controls export remotely. libbi 2 must be the master device.",
};

/** ⓘ button that reveals a short explanation underneath its row. */
export function Tip({ term, text }) {
  const [open, setOpen] = useState(false);
  const body = text || GLOSSARY[term];
  if (!body) return null;
  return (
    <span style={{ display: "inline" }}>
      <button type="button" aria-label={`What is ${term}?`} aria-expanded={open}
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ marginLeft: 6, width: 18, height: 18, borderRadius: 999, border: `1px solid ${open ? BLUE : "#666"}`, background: open ? "rgba(86,193,221,0.15)" : "transparent", color: open ? BLUE : "#aaa", fontSize: 11, fontWeight: 700, lineHeight: "16px", padding: 0, cursor: "pointer", fontFamily: "Georgia, serif", verticalAlign: "middle" }}>i</button>
      {open && (
        <span onClick={e => e.stopPropagation()} style={{ display: "block", marginTop: 6, padding: "8px 10px", background: "rgba(86,193,221,0.08)", border: `1px solid rgba(86,193,221,0.35)`, borderRadius: 6, fontSize: 12, lineHeight: 1.5, color: "#cfe9f1", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>{body}</span>
      )}
    </span>
  );
}

/** Neutral information note (never green — green means "selected"). */
export const InfoNote = ({ children, tone = "info" }) => {
  const col = tone === "warn" ? WARN : BLUE;
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: tone === "warn" ? "rgba(255,0,140,0.06)" : "rgba(86,193,221,0.07)", border: `1px solid ${tone === "warn" ? "rgba(255,0,140,0.4)" : "rgba(86,193,221,0.4)"}`, borderRadius: 8, fontSize: 13, lineHeight: 1.5, color: "#d6eef5" }}>
      <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 999, background: col, color: "#000", fontSize: 12, fontWeight: 800, textAlign: "center", lineHeight: "18px", fontFamily: "Georgia, serif" }}>{tone === "warn" ? "!" : "i"}</span>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
};

/** Section heading with optional tip. */
export const SectionHead = ({ children, tip, tipText }) => (
  <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontWeight: 700 }}>
    {children}{(tip || tipText) && <Tip term={tip || children} text={tipText}/>}
  </div>
);

/** Picture choice card: the picture is the choice. */
export function PicCard({ active, onClick, title, sub, children, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={!!active}
      style={{ flex: "1 1 140px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px 10px 10px", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
        background: active ? "rgba(64,255,122,0.08)" : CARD, border: `1.5px solid ${active ? G : BORDER}`, color: active ? G : TEXT, opacity: disabled ? 0.45 : 1, textAlign: "center" }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "center", color: active ? G : "#bbb" }}>{children}</div>
      <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.3 }}>{sub}</div>}
    </button>
  );
}

// ── Line icons (stroke = currentColor) ───────────────────────────────────────
const svgP = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

export const PhaseIcon = ({ n = 1 }) => (
  <svg viewBox="0 0 96 40" width="96" height="40" aria-hidden="true">
    <rect x="2" y="6" width="22" height="28" rx="3" {...svgP}/>
    <path d="M9 13 h8 M9 20 h8 M9 27 h8" {...svgP} strokeWidth="1.4"/>
    {(n === 3 ? [12, 20, 28] : [20]).map((y, i) => <path key={i} d={`M24 ${y} H94`} {...svgP} strokeWidth={2.4}/>)}
  </svg>
);

const Panel = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M6,0 H40 L34,22 H0 Z" {...svgP} strokeWidth={1.6}/>
    <path d="M17,0 L12,22 M28,0 L23,22 M3,11 H37" {...svgP} strokeWidth={1}/>
  </g>
);

export const SolarOnlyIcon = () => (
  <svg viewBox="0 0 120 40" width="120" height="40" aria-hidden="true">
    <Panel x={2} y={9}/>
    <path d="M42 20 H62" stroke={DC} strokeWidth="2.2"/>
    <rect x="62" y="6" width="26" height="28" rx="3" {...svgP}/><path d="M68 24 l6 -8 l6 8" {...svgP} strokeWidth={1.4}/>
    <path d="M88 20 H118" {...svgP}/>
  </svg>
);

export const SolarBatteryIcon = () => (
  <svg viewBox="0 0 120 40" width="120" height="40" aria-hidden="true">
    <Panel x={2} y={9}/>
    <path d="M42 20 H58" stroke={DC} strokeWidth="2.2"/>
    <rect x="58" y="4" width="26" height="32" rx="3" {...svgP}/>
    <rect x="63" y="20" width="16" height="11" rx="1.5" {...svgP} strokeWidth={1.4}/><path d="M68 18 v2 M74 18 v2" {...svgP} strokeWidth={1.4}/>
    <path d="M84 20 H118" {...svgP}/>
  </svg>
);

// Backup circuit glyphs
const glyphs = {
  "Lights": <path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3zM9.5 19h5M10.5 21.5h3" {...svgP}/>,
  "Refrigeration": <g {...svgP}><rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M6 9.5h12M9 5.5v2M9 12.5v3"/></g>,
  "Communications": <g {...svgP}><path d="M3 9a13 13 0 0 1 18 0M6 12.5a8.5 8.5 0 0 1 12 0M9 16a4 4 0 0 1 6 0"/><circle cx="12" cy="19.5" r="0.8" fill="currentColor"/></g>,
  "Security": <path d="M12 2.5l7.5 3v5.5c0 4.6-3.2 8.6-7.5 10-4.3-1.4-7.5-5.4-7.5-10V5.5z" {...svgP}/>,
  "Essential sockets": <g {...svgP}><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M9 9v3M15 9v3M10 16h4"/></g>,
  "Other essential load": <g {...svgP}><circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/></g>,
  "EV charger": <g {...svgP}><path d="M4 15l1.8-5h12.4L20 15v4H4z"/><circle cx="8" cy="17" r="1.2"/><circle cx="16" cy="17" r="1.2"/><path d="M7 10l1-3h8l1 3"/></g>,
  "Heat pump": <g {...svgP}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="10" cy="12" r="4"/><path d="M10 8v8M6 12h8M16.5 9h2M16.5 12h2M16.5 15h2"/></g>,
  "Oven / cooktop": <g {...svgP}><rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 8.5h17"/><circle cx="7" cy="6" r="0.6" fill="currentColor"/><circle cx="10" cy="6" r="0.6" fill="currentColor"/><rect x="7" y="11.5" width="10" height="6" rx="1"/></g>,
};
export const Glyph = ({ name, size = 22 }) => <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">{glyphs[name] || glyphs["Other essential load"]}</svg>;

/**
 * Backup power picture: a house whose backed-up circuits light up, with the
 * big loads that never go on backup shown greyed out underneath.
 */
export function BackupHouse({ options, selected, onToggle }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "0 12px 12px", background: CARD2 }}>
      <svg viewBox="0 0 300 34" width="100%" height="34" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block" }}>
        <path d="M2 33 L150 3 L298 33" fill="none" stroke={selected.length ? G : "#666"} strokeWidth="2" vectorEffect="non-scaling-stroke"/>
      </svg>
      <div style={{ fontSize: 11, color: MUTED, textAlign: "center", marginBottom: 8 }}>Tap the circuits to keep on during a power cut</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))", gap: 8 }}>
        {options.map(o => {
          const on = selected.includes(o);
          return (
            <button key={o} type="button" onClick={() => onToggle(o)} aria-pressed={on}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
                background: on ? "rgba(64,255,122,0.12)" : CARD, border: `1px solid ${on ? G : BORDER}`, color: on ? G : "#999", boxShadow: on ? "0 0 14px rgba(64,255,122,0.25)" : "none" }}>
              <Glyph name={o}/>
              <span style={{ fontSize: 11, lineHeight: 1.2, color: on ? G : "#bbb" }}>{o}</span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#777" }}>
        <span>Never on backup:</span>
        {["EV charger", "Heat pump", "Oven / cooktop"].map(n => (
          <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 4, opacity: 0.55, textDecoration: "line-through" }}><Glyph name={n} size={16}/>{n}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * libbi 2 stack that grows with the module count. Monochrome, in true
 * proportion (inverter 725×390 mm, module 725×418 mm). Up to 4 modules sit
 * under the inverter; the rest start a second stack with no inverter on top.
 */
export function StackGraphic({ modules, max = 8, kWh, perStack = 4 }) {
  const w = 44, invH = 24, mH = 25, gap = 8, feet = 5;
  const cols = Math.max(1, Math.ceil(max / perStack));
  const H = invH + perStack * mH + feet + 2;
  const W = cols * w + (cols - 1) * gap + 2;
  const stacks = [Math.min(modules, perStack), Math.max(0, modules - perStack)];
  const ink = "#e6e6e6", fill = "#2b2b2b";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-label={`${modules} modules, ${kWh} kWh`}>
      {stacks.map((n, si) => {
        if (si >= cols) return null;
        const x = 1 + si * (w + gap);
        const hasInv = si === 0;
        const bottom = H - feet - 1;
        const topModules = bottom - n * mH;
        return (
          <g key={si}>
            {/* empty slots, dashed */}
            {Array.from({ length: perStack - n }, (_, i) => (
              <rect key={`e${i}`} x={x} y={bottom - (n + i + 1) * mH} width={w} height={mH} fill="none" stroke="#3d3d3d" strokeDasharray="2 2"/>
            ))}
            {hasInv && n > 0 && <>
              <rect x={x} y={topModules - invH} width={w} height={invH} rx="2" fill={fill} stroke={ink} strokeWidth="1.4"/>
              <rect x={x + w / 2 - 3.5} y={topModules - invH + 4} width="7" height={invH - 8} rx="3.5" fill={ink}/>
            </>}
            {Array.from({ length: n }, (_, i) => (
              <g key={i}>
                <rect x={x} y={topModules + i * mH} width={w} height={mH} fill={fill} stroke={ink} strokeWidth="1.4"/>
              </g>
            ))}
            {n > 0 && <><rect x={x + 4} y={bottom} width="5" height={feet} fill={ink}/><rect x={x + w - 9} y={bottom} width="5" height={feet} fill={ink}/></>}
          </g>
        );
      })}
    </svg>
  );
}

/** Breaker badge — the rating as it would appear on the device. */
export const BreakerBadge = ({ text, kind = "breaker" }) => {
  // kind: "breaker" (rating from text), "isolator" (DC switch), "earth" (no breaker)
  const tbc = kind === "breaker" && (!text || text === "TBC");
  const amp = kind === "breaker" && !tbc ? (text.match(/^(\d+(?:\.\d+)?)\s*A/) || [])[1] : null;
  const label = tbc ? "TBC" : kind === "isolator" ? "DC" : kind === "earth" ? "PE" : amp ? `${amp}A` : "—";
  const knob = tbc ? WARN : kind === "earth" ? "#2e9e4f" : kind === "isolator" ? DC : G;
  return (
    <div style={{ width: 46, flexShrink: 0, borderRadius: 6, border: `1.5px solid ${tbc ? WARN : "#ccc"}`, background: "#1c1c1c", textAlign: "center", padding: "4px 0 5px" }}>
      <div style={{ width: kind === "isolator" ? 18 : 10, height: kind === "isolator" ? 10 : 16, margin: kind === "isolator" ? "3px auto 6px" : "0 auto 3px", borderRadius: 2, background: knob }}/>
      <div style={{ fontSize: 12, fontWeight: 800, color: tbc ? WARN : "#fff", fontVariantNumeric: "tabular-nums" }}>{label}</div>
    </div>
  );
};

/** Diagram wrapper: tap to open full screen with scroll and pinch zoom. */
export function Zoomable({ children, label = "diagram" }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <div style={{ position: "relative" }}>
        {children}
        <button type="button" className="no-print" onClick={() => setOpen(true)}
          style={{ position: "absolute", right: 8, top: 8, background: "rgba(0,0,0,0.75)", color: "#fff", border: "1px solid #555", borderRadius: 999, padding: "5px 11px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
          ⤢ Enlarge
        </button>
      </div>
      {open && (
        <div role="dialog" aria-label={`Enlarged ${label}`} onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column", paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px max(16px, env(safe-area-inset-right, 0px)) 10px max(16px, env(safe-area-inset-left, 0px))", color: "#ddd", fontSize: 13 }}>
            <span>Scroll or pinch to zoom</span>
            <button type="button" onClick={() => setOpen(false)} style={{ background: G, color: "#000", border: "none", borderRadius: 999, padding: "7px 16px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
          </div>
          <div onClick={e => e.stopPropagation()} style={{ flex: 1, overflow: "auto", WebkitOverflowScrolling: "touch", padding: 12 }}>
            <div style={{ minWidth: 1100 }}>{children}</div>
          </div>
        </div>
      )}
    </>
  );
}

/** Customer / Installer segmented switch. */
export const ViewSwitch = ({ view, onChange }) => (
  <div role="group" aria-label="Level of detail" style={{ display: "inline-flex", padding: 3, borderRadius: 999, background: CARD2, border: `1px solid ${BORDER}` }}>
    {[["customer", "Customer view"], ["installer", "Installer view"]].map(([id, label]) => (
      <button key={id} type="button" onClick={() => onChange(id)} aria-pressed={view === id}
        style={{ border: "none", borderRadius: 999, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          background: view === id ? G : "transparent", color: view === id ? "#000" : "#aaa" }}>{label}</button>
    ))}
  </div>
);

/** One-line on/off toggle row with a tip. */
export function ToggleRow({ checked, onChange, label, tip, tipText, disabled, note }) {
  return (
    <div style={{ padding: "10px 0", borderBottom: `1px solid #2c2c2c` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0, fontSize: 14, color: disabled ? "#777" : TEXT }}>
          {label}{(tip || tipText) && <Tip term={tip || label} text={tipText}/>}
        </div>
        <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={onChange}
          style={{ width: 44, height: 24, borderRadius: 999, border: "none", padding: 2, cursor: disabled ? "not-allowed" : "pointer", background: checked ? G : "#555", opacity: disabled ? 0.5 : 1, flexShrink: 0 }}>
          <span style={{ display: "block", width: 20, height: 20, borderRadius: 999, background: checked ? "#000" : "#ddd", transform: `translateX(${checked ? 20 : 0}px)`, transition: "transform 0.15s" }}/>
        </button>
      </div>
      {note && <div style={{ fontSize: 12, color: WARN, marginTop: 6 }}>{note}</div>}
    </div>
  );
}
