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

    if (response.status === 401) {
      const err = await response.json();
      console.error("Unauthorized:", err);
      return NextResponse.json({ exists: false, error: "Invalid key" });
    }

    if (!response.ok) {
      console.error("Backend responded with:", response.status);
      return NextResponse.json({ exists: false });
    }

    const data = await response.json();
    const pinValue = data.pin ?? data.data?.pin;
    const exists = Boolean(pinValue);

    console.log("PIN check result:", { pin: pinValue, exists });
    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Check PIN Error:", error);
    return NextResponse.json({ exists: false });
  }
}
