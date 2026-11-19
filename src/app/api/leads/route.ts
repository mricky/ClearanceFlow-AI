import { NextRequest, NextResponse } from "next/server";

// Simple Lead Capture API (Stores visitor emails voluntarily submitted for PDF audits)
const capturedLeads: Array<{ email: string; containerNo?: string; timestamp: string; ip: string }> = [];

export async function POST(req: NextRequest) {
  try {
    const { email, containerNo } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const leadEntry = {
      email,
      containerNo,
      timestamp: new Date().toISOString(),
      ip: clientIp,
    };

    capturedLeads.push(leadEntry);
    console.log(`[Lead Captured] Email: ${email} | Container: ${containerNo || "N/A"} | Time: ${leadEntry.timestamp}`);

    return NextResponse.json({
      success: true,
      message: "Lead recorded successfully. PDF copy queued for delivery.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process lead" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    totalLeads: capturedLeads.length,
    leads: capturedLeads,
  });
}
