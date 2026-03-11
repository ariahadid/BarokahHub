import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "BarakahHub";
  const subtitle = searchParams.get("subtitle") || "";
  const type = searchParams.get("type") === "program" ? "program" : "mosque";

  const emoji = type === "mosque" ? "\uD83D\uDD4C" : "\uD83E\uDD32";
  const badge = type === "program" ? "Program Ramadhan" : "Masjid";
  const titleSize = title.length > 30 ? 44 : 56;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #059669, #047857, #065f46)",
          position: "relative",
        }}
      >
        {/* Icon circle */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            marginBottom: 24,
          }}
        >
          {emoji}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: 28,
              color: "rgba(255, 255, 255, 0.85)",
              textAlign: "center",
              maxWidth: 800,
              marginTop: 16,
              lineHeight: 1.4,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Badge pill */}
        <div
          style={{
            marginTop: 32,
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 8,
            paddingBottom: 8,
            borderRadius: 9999,
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            fontSize: 20,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {badge}
        </div>

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 22,
            color: "rgba(255, 255, 255, 0.7)",
            fontWeight: 600,
            display: "flex",
          }}
        >
          BarakahHub
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
