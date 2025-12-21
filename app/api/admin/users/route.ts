import { requireAuth } from "@/lib/auth/middleware";
import { supabase } from "@/lib/db/supabase";
import { hashPassword } from "@/lib/utils/bcrypt";
import { registerClientSchema } from "@/lib/validations/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const admin = await requireAuth(request);
    if (admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const clientData = await request.json();
    const { username, password, displayname } = clientData as any;
    const validationResult = registerClientSchema.safeParse(clientData);
    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid Input" }, { status: 400 });
    }
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }
    const hashedPassword = await hashPassword(password);
    const { data: newUser, error: dbError } = await supabase
      .from("users")
      .insert({
        username,
        hashedPassword,
        role: "client",
        is_active: true,
      })
      .select("id")
      .single();
    if (dbError || !newUser) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
    // Insert client logo details
    if (displayname) {
      const { error: detailsError } = await supabase
        .from("client_details")
        .insert({
          user_id: newUser.id,
          display_text: displayname,
        })
        .select("id")
        .single();
      if (detailsError) {
        return NextResponse.json(
          { error: "Failed to create client details" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          success: true,
          message: "User created successfully",
          data: {
            userId: newUser.id,
            username,
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const admin = await requireAuth(request);
    if (admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Fetch users with client_details (LEFT JOIN)
    const {
      data: users,
      error,
      count,
    } = await supabase
      .from("users")
      .select(
        `
        id,
        username,
        role,
        is_active,
        created_at,
        client_details (
          id,
          display_text,
          logo_url
        )
      `,
        { count: "exact" }
      )
      .eq("role", "client") // Only get clients
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    return NextResponse.json(
      {
        success: true,
        data: users || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasMore,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
