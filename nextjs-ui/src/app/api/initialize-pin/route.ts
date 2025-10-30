import { NextResponse } from "next/server";

const API_KEY = process.env.DLIS_API_KEY;
const BACKEND_URL = process.env.DLIS_BACKEND_URL;

export async function POST(request: Request) {
  console.log("Initialize PIN route called");

  if (!API_KEY || !BACKEND_URL) {
    console.error("Missing env vars:", {
      hasKey: !!API_KEY,
      hasUrl: !!BACKEND_URL,
    });
    return NextResponse.json(
      { detail: "Server configuration error" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
    console.log("Received body:", body);
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return NextResponse.json(
      { detail: "Invalid request body" },
      { status: 400 }
    );
  }

  const { pin } = body;

  if (!pin) {
    return NextResponse.json({ detail: "PIN is required" }, { status: 400 });
  }

  try {
    // 🔹 Step 1: Check if PIN already exists
    const checkResponse = await fetch(`${BACKEND_URL}/DLIS/pin`, {
      method: "GET",
      headers: { key: API_KEY },
    });

    const checkData = await checkResponse.json();
    console.log("Check PIN data:", checkData);

    if (checkResponse.ok && checkData.pin) {
      return NextResponse.json(
        { detail: "A PIN already exists. Initialization not allowed." },
        { status: 409 } // 409 = Conflict
      );
    }

    // 🔹 Step 2: Initialize PIN only if none exists
    console.log("Initializing new PIN:", pin);
    const response = await fetch(`${BACKEND_URL}/DLIS/pin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        key: API_KEY,
      },
      body: JSON.stringify({ pin }),
    });

    console.log("Backend responded with status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend error:", errorData);
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
    console.log("Backend success:", data);

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
