import { NextRequest, NextResponse } from "next/server";
import { OpenBaoClient } from "@/lib/openbao-client";

function getToken(request: NextRequest): string | null {
  return request.headers.get("x-openbao-token");
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;
    const client = new OpenBaoClient(token);
    const result = await client.getPolicy(name);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get policy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get policy" },
      { status: 500 }
    );
  }
}
