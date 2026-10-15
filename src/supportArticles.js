// ── myenergi Help Centre articles per third-party battery ───────────────────
// Sourced from support.myenergi.com (en-gb), 14 Oct 2026. Several articles
// are published in more than one Help Centre section with identical content;
// these all point at the copy in the "Commissioning" section for
// consistency. Keyed by BATTERIES id in systembuilder.jsx. To add one, find
// the article id in the Help Centre URL and add a row.

const HC = "https://support.myenergi.com/hc/en-gb/articles/";

export const GENERAL_BATTERY_ARTICLE = {
  title: "Using a 3rd party battery with myenergi devices",
  url: HC + "6778001879569-Using-a-3rd-party-battery-with-myenergi-devices",
};

/** Shown whenever a third-party hybrid inverter (solar + DC battery) is in the design. */
export const HYBRID_ARTICLE = {
  title: "Hybrid PV & battery: set up and avoid draining",
  url: HC + "4716922623633-Hybrid-PV-Battery-Set-up-Avoid-Draining",
};

const zappiWith = (brand, slugBrand, id) => ({
  title: `How to use zappi with ${brand}: charge your EV from solar without draining your battery`,
  url: `${HC}${id}-How-to-Use-zappi-with-${slugBrand}-Battery-Charge-Your-EV-from-Solar-Without-Draining-Your-Battery`,
});

const POWERWALL = zappiWith("Tesla Powerwall", "Tesla-Powerwall", "45044518355089");

export const BATTERY_ARTICLES = {
  1:  [POWERWALL],                                               // Tesla Powerwall 2
  2:  [POWERWALL],                                               // Tesla Powerwall 3
  3:  [zappiWith("Sungrow", "Sungrow", "45043992236049")],
  4:  [zappiWith("Sigenergy", "Sigenergy", "45043007739281")],
  6:  [zappiWith("AlphaESS", "AlphaESS", "45043488879505")],
  11: [zappiWith("FoxESS", "FoxESS", "45043323651985")],
  17: [zappiWith("GoodWe", "GoodWe", "45043707060369")],
};

/** Brand-specific articles first, then the general third-party battery article. */
export const batterySupportArticles = id => [...(BATTERY_ARTICLES[parseInt(id)] || []), GENERAL_BATTERY_ARTICLE];
