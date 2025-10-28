import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://iot-door-lock-system.onrender.com/DLIS/disable"
    );

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch door status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, duration_minutes } = body;

    // Validate input
    if (!action || (action === "disable" && !duration_minutes)) {
      return NextResponse.json(
        { detail: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://iot-door-lock-system.onrender.com/DLIS/disable",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          duration_minutes,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.detail ||
        errorData.message ||
        errorData.error ||
        `Backend error: ${response.status}`;

      return NextResponse.json(
        { detail: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("API Error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update door status";

    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
