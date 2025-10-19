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
    const response = await fetch(`${BACKEND_URL}/pin?key=${API_KEY}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ exists: false });
    }

    const data = await response.json();

    const exists = data.pin !== null && data.pin !== "";

    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Check PIN Error:", error);
    return NextResponse.json({ exists: false });
  }
}
