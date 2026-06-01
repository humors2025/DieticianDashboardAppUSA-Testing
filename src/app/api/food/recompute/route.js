import { NextResponse } from "next/server";

const FLASK_BASE = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000";

export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch(`${FLASK_BASE}/api/recompute_food`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
