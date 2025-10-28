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
    const response = await fetch(`${BACKEND_URL}/pin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        key: API_KEY,
      },
    });

    if (!response.ok) {
      console.error("Backend responded with error:", response.status);
      return NextResponse.json({ exists: false });
    }

    const data = await response.json();

    // Check if PIN exists and is not empty
    const exists =
      data.pin !== null && data.pin !== undefined && data.pin !== "";

    console.log("PIN check result:", { pin: data.pin, exists });

    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Check PIN Error:", error);
    return NextResponse.json({ exists: false });
  }
}
