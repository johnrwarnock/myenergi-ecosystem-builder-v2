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
 * @property {string} icon - image URL
 * @property {'trunk'} role - the only role existing devices use; satellites
 *   (harvi, AC/DC batteries) aren't registry-driven yet — that's step 4/5.
 * @property {number} scale - multiplier applied to the base device box size
 */

/** @type {Record<string, DeviceSpec>} */
export const DEVICE_REGISTRY = {
  zappi:   { label: "zappi",   icon: zappiImgUrl,     role: "trunk", scale: 2 },
  eddi:    { label: "eddi",    icon: eddiImgUrl,      role: "trunk", scale: 1.5 },
  "eddi+": { label: "eddi+",   icon: eddiPlusImgUrl,  role: "trunk", scale: 1.5 },
  GLO:     { label: "GLO",     icon: gloImgUrl,       role: "trunk", scale: 2 },
  libbi:   { label: "libbi",   icon: libbiImgUrl,     role: "trunk", scale: 2.25 },
  harvi:   { label: "harvi",   icon: harviImgUrl,     role: "satellite", scale: 1 },
};
