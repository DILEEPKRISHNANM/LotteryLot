import { requireAuth } from "@/lib/auth/middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const admin = await requireAuth(request);
    if (admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const clientData = request.json();
    const { username, password, displayname } = clientData as any;
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
