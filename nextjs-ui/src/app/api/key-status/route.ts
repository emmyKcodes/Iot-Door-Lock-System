import { NextResponse } from "next/server";

export async function GET() {
  const BACKEND_URL = process.env.DLIS_BACKEND_URL;
  const API_KEY = process.env.DLIS_API_KEY;

  try {
    const res = await fetch(`${BACKEND_URL}/key-status?key=${API_KEY}`);
    const data = await res.json();

    return NextResponse.json({
      status: data.disabled ? "disabled" : "active",
    });
  } catch (err) {
    return NextResponse.json({ status: "active" });
  }
}
