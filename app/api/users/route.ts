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

    const client = new OpenBaoClient(token);
    const result = await client.listUsers();

    return NextResponse.json(result);
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list users" },
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
    const { username, password, policies } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const client = new OpenBaoClient(token);
    const result = await client.createUser(username, password, policies || []);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 500 }
    );
  }
}
