import { requireAuth } from "@/lib/auth/middleware";
import { supabase } from "@/lib/db/supabase";
import { hashPassword } from "@/lib/utils/bcrypt";
import { uploadFile } from "@/lib/utils/s3utils";
import { registerClientSchema } from "@/lib/validations/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const admin = await requireAuth(request);
    if (admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse FormData (includes file)
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const displayname = formData.get("displayname") as string | null;
    const logoFile = formData.get("logo") as File | null;

    // Validate input (without logo, as it's a file)
    const validationData = {
      username,
      password,
      displayText: displayname || undefined,
    };

    const validationResult = registerClientSchema.safeParse(validationData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid Input", details: validationResult.error.message },
        { status: 400 }
      );
    }

    // Check if username already exists
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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const { data: newUser, error: dbError } = await supabase
      .from("users")
      .insert({
        username,
        password_hash: hashedPassword, // Fix: was hashedPassword, should be password_hash
        role: "client",
        is_active: true,
      })
      .select("id")
      .single();

    if (dbError || !newUser) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Upload logo if provided
    let logoPath = null;
    if (logoFile && logoFile.size > 0) {
      const uploadResult = await uploadFile(logoFile, "client-logos", "logos");

      if (uploadResult.error || !uploadResult.path) {
        // If upload fails, delete the user we just created
        await supabase.from("users").delete().eq("id", newUser.id);
        return NextResponse.json(
          { error: uploadResult.error || "Failed to upload logo" },
          { status: 500 }
        );
      }

      logoPath = uploadResult.path;
    }

    // Insert client details (with or without logo)
    if (displayname || logoPath) {
      const detailsData: any = {
        user_id: newUser.id,
      };
      if (displayname) detailsData.display_text = displayname;
      if (logoPath) detailsData.logo_url = logoPath;

      const { error: detailsError } = await supabase
        .from("client_details")
        .insert(detailsData);

      if (detailsError) {
        // If details creation fails, clean up user and uploaded file
        await supabase.from("users").delete().eq("id", newUser.id);
        if (logoPath) {
          await supabase.storage.from("client-logos").remove([logoPath]);
        }
        return NextResponse.json(
          { error: "Failed to create client details" },
          { status: 500 }
        );
      }
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
