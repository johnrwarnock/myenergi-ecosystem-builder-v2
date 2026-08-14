import zappiImgUrl    from "../zappi.svg";
import harviImgUrl    from "../harvi.svg";
import libbiImgUrl    from "../libbi.svg";
import eddiImgUrl     from "../eddi.svg";
import eddiPlusImgUrl from "../eddi+.svg";
import gloImgUrl      from "../GLO.svg";

/**
 * Single source of truth for "what a device looks like in the diagram" —
 * icon and trunk-row scale. Deliberately does NOT include CT capacity
 * (ctsIncluded/ctsSupported): that's business/product data, and
 * systembuilder.jsx's PRODUCTS array is its one source of truth, threaded
 * into the diagram config at runtime (buildDiagramConfig's ctrlCtsSupported)
 * rather than duplicated here. Keeping those two concerns apart is what
 * fixed the CTRL_CTS-vs-PRODUCTS.ctsSupported drift bug.
 *
 * @typedef {Object} DeviceSpec
 * @property {string} label
 * @property {string|null} icon - image URL, or null to fall back to a
 *   generic labeled box (used for libbi 2's satellites, which don't have
 *   final artwork yet — ships functionally correct, swap in an icon later)
 * @property {'trunk'|'satellite'} role - trunk devices sit in the main
 *   controller/secondary row; satellites attach to a parent (harvi is the
 *   only registry-driven satellite so far — AC/DC battery attachment isn't
 *   registry-driven yet, see src/diagram/layout/satellite.js)
 * @property {number} scale - multiplier applied to the base device box size
 * @property {{ac:boolean, dc:boolean}} [couples] - marks a device that can
 *   act as either an AC-coupled standalone battery or a DC-hybrid inverter
 *   sub-battery (libbi, libbi2) — Diagram() uses this instead of hardcoded
 *   name checks to decide whether the device appears as its own trunk box
 *   or via the battery representation it's coupled to
 */

/** @type {Record<string, DeviceSpec>} */
export const DEVICE_REGISTRY = {
  zappi:   { label: "zappi",   icon: zappiImgUrl,     role: "trunk", scale: 2 },
  eddi:    { label: "eddi",    icon: eddiImgUrl,      role: "trunk", scale: 1.5 },
  "eddi+": { label: "eddi+",   icon: eddiPlusImgUrl,  role: "trunk", scale: 1.5 },
  GLO:     { label: "GLO",     icon: gloImgUrl,       role: "trunk", scale: 2 },
  libbi:   { label: "libbi",   icon: libbiImgUrl,     role: "trunk", scale: 2.25, couples: { ac: true, dc: true } },
  libbi2:  { label: "libbi 2", icon: null,            role: "trunk", scale: 2.25, couples: { ac: true, dc: true } },
  harvi:   { label: "harvi",   icon: harviImgUrl,     role: "satellite", scale: 1 },
  libbiController: { label: "LIBBI CTRL", icon: null, role: "satellite", scale: 1 },
  csipController:  { label: "CSIP CTRL",  icon: null, role: "satellite", scale: 1 },
};
