function relLum(hex) {
  const c = hex.match(/\w\w/g).map((x) => parseInt(x, 16) / 255);
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(hex1, hex2) {
  const L1 = relLum(hex1);
  const L2 = relLum(hex2);
  const [lighter, darker] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (lighter + 0.05) / (darker + 0.05);
}

const tokens = {
  "ink-950": "#0B0C0E",
  "ink-900": "#15171A",
  "ink-700": "#2B2D31",
  "paper-50": "#F7F4EE",
  "paper-100": "#EFEAE0",
  "steel-300": "#C9C4B8",
  "steel-400": "#9C978C",
  "steel-600": "#6B675E",
  "accent-100": "#F3DCC7",
  "accent-500": "#C9601E",
  "accent-600": "#A84E17",
  "error": "#B3402C",
  "success": "#3E7A4B",
  white: "#FFFFFF",
};

const pairs = [
  ["steel-600", "paper-50", "body text on light section"],
  ["steel-600", "white", "body text on white card"],
  ["steel-400", "paper-50", "muted/helper text on light section"],
  ["steel-400", "white", "muted/helper text on white card"],
  ["ink-950", "paper-50", "headings on light section"],
  ["ink-950", "white", "headings on white card"],
  ["accent-600", "paper-50", "accent link text on light section"],
  ["accent-600", "white", "accent link text on white card"],
  ["paper-50", "ink-950", "body text on dark section"],
  ["steel-300", "ink-950", "muted body text on dark section"],
  ["steel-400", "ink-950", "muted/helper text on dark section (footer nav)"],
  ["accent-500", "ink-950", "accent text/link on dark section"],
  ["ink-950", "accent-500", "button text on copper CTA"],
  ["error", "white", "error text on white"],
  ["error", "paper-50", "error text on light section"],
  ["accent-600", "accent-100", "eyebrow/tag text on accent-100 chip"],
];

console.log("pair".padEnd(45), "ratio", "AA-normal(4.5)", "AA-large(3.0)");
for (const [fg, bg, label] of pairs) {
  const r = ratio(tokens[fg], tokens[bg]);
  console.log(
    `${fg} on ${bg} (${label})`.padEnd(60),
    r.toFixed(2).padEnd(6),
    r >= 4.5 ? "PASS" : "FAIL",
    r >= 3.0 ? "PASS" : "FAIL",
  );
}
