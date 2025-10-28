import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://iot-door-lock-system.onrender.com/DLIS/lock"
    );

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch door state" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(
      "https://iot-door-lock-system.onrender.com/DLIS/lock",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("API Error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update door state";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
