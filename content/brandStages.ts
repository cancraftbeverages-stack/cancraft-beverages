/**
 * "Built for brands at every stage" — MARKETING COPY communicating that
 * CanCraft can work with businesses at different maturity levels. No
 * capacity or output claims are made here.
 */

export type BrandStage = {
  key: string;
  label: string;
  quote: string;
};

export const brandStages: BrandStage[] = [
  {
    key: "idea",
    label: "Idea",
    quote: "I have a beverage concept.",
  },
  {
    key: "startup",
    label: "Startup",
    quote: "I need my first production run.",
  },
  {
    key: "growing-brand",
    label: "Growing Brand",
    quote: "I need a reliable manufacturing partner.",
  },
  {
    key: "established-business",
    label: "Established Business",
    quote: "I need additional production capability.",
  },
];
