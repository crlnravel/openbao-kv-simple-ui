import { NextRequest, NextResponse } from "next/server";
import { OpenBaoClient } from "@/lib/openbao-client";

function getToken(request: NextRequest): string | null {
  return request.headers.get("x-openbao-token");
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string }> }) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { path } = await params;
    const client = new OpenBaoClient(token);
    const result = await client.getSecret(path);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get secret error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get secret" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string }> }) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { path } = await params;
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json({ error: "Data is required" }, { status: 400 });
    }

    const client = new OpenBaoClient(token);
    const result = await client.updateSecret(path, data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Update secret error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update secret" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { path } = await params;
    const client = new OpenBaoClient(token);
    await client.deleteSecret(path);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete secret error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete secret" },
      { status: 500 }
    );
  }
}
