import { company } from "@/content/company";
import { buildBrandOgImage, ogImageContentType, ogImageSize } from "@/lib/ogImage";

export const runtime = "edge";
export const alt = `${company.brandName} — Beverage Contract Manufacturing`;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function OpengraphImage() {
  return buildBrandOgImage();
}
