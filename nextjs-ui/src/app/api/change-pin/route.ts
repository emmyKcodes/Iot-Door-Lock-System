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
    const { old_key, new_key } = body;

    if (!old_key || !new_key) {
      return NextResponse.json(
        { detail: "Both old_key and new_key are required" },
        { status: 400 }
      );
    }

    // Check current PIN with header
    const checkResponse = await fetch(`${BACKEND_URL}/pin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        key: API_KEY,
      },
    });

    if (!checkResponse.ok) {
      return NextResponse.json(
        { detail: "Failed to verify current PIN" },
        { status: checkResponse.status }
      );
    }

    const currentData = await checkResponse.json();

    if (currentData.pin !== old_key) {
      return NextResponse.json(
        { detail: "Current PIN is incorrect" },
        { status: 401 }
      );
    }

    // Update PIN with header
    const response = await fetch(`${BACKEND_URL}/pin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        key: API_KEY,
      },
      body: JSON.stringify({ pin: new_key }),
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
      message: "PIN changed successfully",
      result: data.Result || data.result,
    });
  } catch (error: unknown) {
    console.error("API Error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to change PIN";

    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
