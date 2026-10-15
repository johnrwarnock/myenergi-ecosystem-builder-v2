// Tilted solar panel (used for every PV array)
export const SolarPanel = ({ x, y, w = 62, h = 40 }) => {
  const k = w * 0.14; // slant
  const cols = 4, rows = 2;
  return (
    <g>
      <path d={`M${x + k},${y} H${x + w} L${x + w - k},${y + h} H${x} Z`} fill="#dfe8f2" stroke="#4a6a8a" strokeWidth={1.5} strokeLinejoin="round"/>
      {Array.from({ length: cols - 1 }, (_, i) => {
        const t = (i + 1) / cols;
        return <line key={`c${i}`} x1={x + k + (w - k) * t} y1={y} x2={x + (w - k) * t} y2={y + h} stroke="#4a6a8a" strokeWidth={0.8}/>;
      })}
      {Array.from({ length: rows - 1 }, (_, i) => {
        const t = (i + 1) / rows;
        return <line key={`r${i}`} x1={x + k * (1 - t)} y1={y + h * t} x2={x + w - k * t} y2={y + h * t} stroke="#4a6a8a" strokeWidth={0.8}/>;
      })}
    </g>
  );
};
