import { NextResponse } from "next/server";

const API_KEY = process.env.DLIS_API_KEY;
const BACKEND_URL = process.env.DLIS_BACKEND_URL;

export async function POST(request: Request) {
  if (!API_KEY || !BACKEND_URL) {
    return NextResponse.json(
      { detail: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json({ detail: "PIN is required" }, { status: 400 });
    }

    if (pin.length !== 4) {
      return NextResponse.json(
        { detail: "PIN must be 4 digits" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/pin?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pin: pin,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error ||
        errorData.detail ||
        errorData.message ||
        `Backend error: ${response.status}`;

      return NextResponse.json(
        { detail: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      message: "PIN initialized successfully",
      result: data.Result || data.result,
    });
  } catch (error: unknown) {
    console.error("Initialize PIN Error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to initialize PIN";

    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
