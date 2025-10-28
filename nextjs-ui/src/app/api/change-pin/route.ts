import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { old_key, new_key } = body;

    if (!old_key || !new_key) {
      return NextResponse.json(
        { detail: "Both old_key and new_key are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://iot-door-lock-system.onrender.com/DLIS/pin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_key,
          new_key,
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
      error instanceof Error ? error.message : "Failed to change PIN";

    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
