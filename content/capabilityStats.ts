/**
 * Display-ready capability stats, assembled from VERIFIED FACTS in
 * content/company.ts. This file formats those facts for the stat grid —
 * it does not introduce new numbers.
 *
 * `isTheoretical` marks values that describe theoretical line capacity
 * (e.g. a monthly-output calculation) rather than guaranteed production.
 * None are currently displayed as guaranteed output — see ARCHITECTURE.md
 * Section on Manufacturing Capability.
 */

import { company } from "./company";

export type CapabilityStat = {
  key: string;
  value: string;
  label: string;
  isTheoretical?: boolean;
};

export const capabilityStats: CapabilityStat[] = [
  {
    key: "line-speed",
    value: `${company.productionLine.speedCansPerMinute}`,
    label: "Cans per minute",
  },
  {
    key: "can-sizes",
    value: `${company.productionLine.canSizesMl[0]}–${
      company.productionLine.canSizesMl[company.productionLine.canSizesMl.length - 1]
    } ml`,
    label: "Can formats",
  },
  {
    key: "facility-area",
    value: `${company.facility.totalAreaSqm} sq m`,
    label: "Total facility area",
  },
  {
    key: "production-area",
    value: `${company.facility.productionAreaSqm} sq m`,
    label: "Production area",
  },
];

export const proofIndicators = [
  `${company.productionLine.speedCansPerMinute} CANS/MIN`,
  `${company.productionLine.canSizesMl[0]}–${
    company.productionLine.canSizesMl[company.productionLine.canSizesMl.length - 1]
  } ML`,
  company.commercial.moqStatement.toUpperCase(),
  "NCR, INDIA",
];
