import { NextRequest, NextResponse } from "next/server";
import { OpenBaoClient, validateToken } from "@/lib/openbao-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, username, password, token } = body;

    if (method === "token") {
      // Validate token
      if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
      }

      const isValid = await validateToken(token);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        token,
      });
    } else if (method === "userpass") {
      // Userpass login
      if (!username || !password) {
        return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
      }

      const client = new OpenBaoClient("");
      const response = await client.loginUserpass(username, password);

      return NextResponse.json({
        success: true,
        token: response.auth.client_token,
      });
    } else {
      return NextResponse.json({ error: "Invalid login method" }, { status: 400 });
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 401 }
    );
  }
}
