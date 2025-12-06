import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    // requireAuth validates the access token and returns user payload
    const user = await requireAuth(request);

    return NextResponse.json(
      {
        success: true,
        user: {
          userId: user.userId,
          username: user.username,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // If requireAuth throws, it's already a Response object
    if (error instanceof Response) {
      return error;
    }

    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
