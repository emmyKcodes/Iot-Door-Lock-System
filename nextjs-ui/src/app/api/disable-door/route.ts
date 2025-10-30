import { NextResponse } from "next/server";

const API_KEY = process.env.DLIS_API_KEY;
const BACKEND_URL = process.env.DLIS_BACKEND_URL;

// 🔹 GET — Fetch current disable status
export async function GET() {
  if (!API_KEY || !BACKEND_URL) {
    return NextResponse.json(
      { detail: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${BACKEND_URL}/DLIS/lock`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        key: API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({
      disabled: !!data.disabled,
    });
  } catch (error) {
    console.error("Disable status fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch disable status" },
      { status: 500 }
    );
  }
}

// 🔹 POST — Update disable state
export async function POST(request: Request) {
  if (!API_KEY || !BACKEND_URL) {
    return NextResponse.json(
      { detail: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { disabled } = body;

    if (typeof disabled !== "boolean") {
      return NextResponse.json(
        { detail: "Disabled state must be a boolean" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/DLIS/lock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        key: API_KEY,
      },
      body: JSON.stringify({ lock: disabled }),
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
      disabled: !!data.disabled,
    });
  } catch (error: unknown) {
    console.error("API Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update disable state";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
