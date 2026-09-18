import { ImageResponse } from "next/og";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

/** Shared brand card used for both opengraph-image and twitter-image — text + brand colors only, no fabricated photography. */
export function buildBrandOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0B0B0A",
          color: "#F4F1EB",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", width: 64, height: 6, backgroundColor: "#C9601E" }} />
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          CANCRAFT
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 34,
            color: "#B8B4AC",
          }}
        >
          Your Beverage. Our Manufacturing.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 22,
            color: "#9C978C",
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          Beverage Contract Manufacturing · Uttar Pradesh
        </div>
      </div>
    ),
    { ...ogImageSize },
  );
}
