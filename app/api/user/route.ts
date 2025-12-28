import { requireAuth } from "@/lib/auth/middleware";
import { supabase } from "@/lib/db/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data, error } = await supabase
      .from("client_details")
      .select("display_text,logo_url")
      .eq("user_id", user.userId)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      data: { ...data, logo_url: data.logo_url || null, display_text: data.display_text || null },
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error("User error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
