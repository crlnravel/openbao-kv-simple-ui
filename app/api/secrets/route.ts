import { NextRequest, NextResponse } from "next/server";
import { OpenBaoClient } from "@/lib/openbao-client";

function getToken(request: NextRequest): string | null {
  return request.headers.get("x-openbao-token");
}

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get("path") || "";

    const client = new OpenBaoClient(token);
    const result = await client.listSecrets(path);

    return NextResponse.json(result);
  } catch (error) {
    console.error("List secrets error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list secrets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { path, data } = body;

    if (!path || !data) {
      return NextResponse.json({ error: "Path and data are required" }, { status: 400 });
    }

    const client = new OpenBaoClient(token);
    const result = await client.createSecret(path, data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Create secret error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create secret" },
      { status: 500 }
    );
  }
}
