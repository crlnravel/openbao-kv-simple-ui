import { NextRequest, NextResponse } from "next/server";
import { OpenBaoClient } from "@/lib/openbao-client";

function getToken(request: NextRequest): string | null {
  return request.headers.get("x-openbao-token");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await params;
    const client = new OpenBaoClient(token);
    const result = await client.getUser(username);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await params;
    const body = await request.json();
    const { password, policies } = body;

    const client = new OpenBaoClient(token);

    if (password) {
      await client.updateUserPassword(username, password);
    }

    if (policies) {
      await client.updateUserPolicies(username, policies);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await params;
    const client = new OpenBaoClient(token);
    await client.deleteUser(username);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}
