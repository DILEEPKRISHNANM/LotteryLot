import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { getLotteryHistory } from "@/lib/api/lottery-api";
import { LotteryResult } from "@/types/lotteryApiTypes";

/**
 * History API Response interface matching the external API format
 */
interface HistoryApiResponse {
  total: number;
  limit: number;
  offset: number;
  items: LotteryResult[];
}

/**
 * GET /api/lottery/history
 * Fetches lottery result history with pagination
 * Query parameters:
 *   - limit: number of results to return (default: 10)
 *   - offset: number of results to skip (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    if(!user){
        return NextResponse.json({error:'Unauthorized'},{status:401});
    }

    // Get limit and offset from query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    // Parse and validate limit (default: 10, min: 1, max: 100)
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          error: "Invalid limit parameter. Must be a number between 1 and 100",
        },
        { status: 400 }
      );
    }

    // Parse and validate offset (default: 0, min: 0)
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { error: "Invalid offset parameter. Must be a non-negative number" },
        { status: 400 }
      );
    }

    // Fetch history using getLotteryHistory() from lottery-api.ts
    // The external API returns: { total, limit, offset, items: [...] }
    const apiResponse: HistoryApiResponse = await getLotteryHistory(
      limit,
      offset
    );

    // Return the response in the expected format
    return NextResponse.json(
      {
        success: true,
        data: apiResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle auth errors
    if (error instanceof Response) {
      return error;
    }

    // Handle API errors
    console.error("History result error:", error);

    // Check if it's a 404 (no results found)
    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json(
        {
          success: true,
          data: {
            total: 0,
            limit: parseInt(
              new URL(request.url).searchParams.get("limit") || "10",
              10
            ),
            offset: parseInt(
              new URL(request.url).searchParams.get("offset") || "0",
              10
            ),
            items: [],
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch lottery history",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
