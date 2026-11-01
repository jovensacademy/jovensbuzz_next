import { ImageResponse } from "next/og";

export const alt = "Jovens Buzz — Making Small Businesses Look Big";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated social sharing image (used for Open Graph and Twitter/X cards)
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0b1730 0%, #17233f 65%, #2a3754 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#f88d00",
              color: "#0b1730",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 800,
            }}
          >
            B
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>Jovens Buzz</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
            Making Small Businesses Look Big.
          </div>
          <div style={{ fontSize: 30, color: "#c9d0dd", maxWidth: 900 }}>
            Strategy, content, design and digital experiences that help ambitious businesses grow.
          </div>
        </div>
        <div style={{ display: "flex", height: 8, width: 160, borderRadius: 4, background: "#f88d00" }} />
      </div>
    ),
    size,
  );
}
