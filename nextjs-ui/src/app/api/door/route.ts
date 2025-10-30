import { NextResponse } from "next/server";

const API_KEY = process.env.DLIS_API_KEY;
const BACKEND_URL = process.env.DLIS_BACKEND_URL;

export async function GET() {
  if (!API_KEY || !BACKEND_URL) {
    return NextResponse.json(
      { detail: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${BACKEND_URL}/lock`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        key: API_KEY, // ✅ include API key
      },
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    // Ensure we always return a boolean
    return NextResponse.json({
      lock: !!data.lock,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch door state" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!API_KEY || !BACKEND_URL) {
    return NextResponse.json(
      { detail: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { lock } = body;

    // ✅ validate input
    if (typeof lock !== "boolean") {
      return NextResponse.json(
        { detail: "Lock state must be a boolean" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/lock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        key: API_KEY, // ✅ include API key
      },
      body: JSON.stringify({ lock }),
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
    return NextResponse.json({ lock: !!data.lock });
  } catch (error: unknown) {
    console.error("API Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update door state";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
