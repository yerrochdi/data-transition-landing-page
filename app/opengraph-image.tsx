import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NextMove AI — Votre coach IA pour la transition data";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #050707 0%, #0a0d0c 50%, #0f1411 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(74, 222, 128, 0.30) 0%, rgba(34, 197, 94, 0.0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -250,
            left: -150,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34, 197, 94, 0.22) 0%, rgba(74, 222, 128, 0.0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              color: "#0a0d0c",
              boxShadow: "0 0 40px rgba(74, 222, 128, 0.4)",
            }}
          >
            N
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            NextMove AI
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Votre transition</span>
            <span
              style={{
                background:
                  "linear-gradient(90deg, #4ade80 0%, #22c55e 100%)",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 0 30px rgba(74, 222, 128, 0.4))",
              }}
            >
              pilotée par l'IA.
            </span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#9ca3af",
              maxWidth: 900,
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            Parcours personnalisé, opportunités, copilot intelligent.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: "1px solid rgba(74, 222, 128, 0.12)",
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: "#6b7280",
              display: "flex",
            }}
          >
            nextmove.sh
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#4ade80",
              fontWeight: 700,
              display: "flex",
            }}
          >
            AI-Powered Career Evolution
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
