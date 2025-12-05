import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getResultByDate } from '@/lib/api/lottery-api';
import { LotteryResult } from '@/types/lotteryApiTypes';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    // Get date from query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required (format: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Fetch result for the date
    const result: LotteryResult = await getResultByDate(date);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle auth errors
    if (error instanceof Response) {
      return error;
    }

    // Handle API errors
    console.error('Date result error:', error);
    
    // Check if it's a 404 (no result for that date)
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: 'No result found for the specified date' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch lottery result',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}