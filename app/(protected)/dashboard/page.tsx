"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { DataGrid } from "@/components/ui/DataGrid";
import {
  lotteryGridConfig,
  LotteryResultGridItem,
} from "@/components/lottery/lotteryGridUtils";
import { LotteryPreviewPanel } from "@/components/lottery/LotteryPreviewPanel";
import { apiClient } from "@/lib/api/client";
import { Search, Calendar, Eye, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_LOTTERY_HISTORY_ENDPOINT_INTERNAL } from "@/lib/utils/constants";
import {
  isPast4PM,
  isFirstRow,
  scheduleDailyRefresh,
} from "@/lib/utils/generalUtils";

/**
 * History API Response interface
 */
interface HistoryApiResponse {
  success: boolean;
  data?: {
    total: number;
    limit: number;
    offset: number;
    items: LotteryResultGridItem[];
  };
  error?: string;
  message?: string;
}

/**
 * Combined state for loading states
 */
interface LoadingState {
  initial: boolean; // Initial page load
  more: boolean; // Loading more results (infinite scroll)
}

/**
 * Combined state for search filters
 */
interface SearchFilters {
  date: string; // Date filter (YYYY-MM-DD)
  name: string; // Name/code search term
}

/**
 * Combined state for preview panel
 */
interface PreviewState {
  isOpen: boolean;
  result: LotteryResultGridItem | null;
}

/**
 * Client Dashboard Page - Displays lottery results with infinite scroll and search
 * Uses history API with offset/limit pagination
 */
export default function ClientDashboardPage() {
  const user = localStorage.getItem("user");
  const userData = user ? JSON.parse(user) : null;
  const isAdmin = userData?.role === "admin";
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  // Results data
  const [results, setResults] = useState<LotteryResultGridItem[]>([]);

  // Combined loading states
  const [loading, setLoading] = useState<LoadingState>({
    initial: true,
    more: false,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: true,
  });

  // Combined search filters
  const [filters, setFilters] = useState<SearchFilters>({
    date: "",
    name: "",
  });

  // Combined preview panel state
  const [preview, setPreview] = useState<PreviewState>({
    isOpen: false,
    result: null,
  });

  /**
   * Fetches lottery results using the history API
   * Uses getLotteryHistory() internally through the API route
   * @param limit - Number of results to fetch
   * @param offset - Number of results to skip
   * @param append - Whether to append to existing results or replace them
   */
  const fetchHistory = useCallback(
    async (limit: number, offset: number, append: boolean = false) => {
      try {
        const response = await apiClient.get<HistoryApiResponse>(
          API_LOTTERY_HISTORY_ENDPOINT_INTERNAL(limit, offset)
        );

        if (response.success && response.data) {
          const {
            total,
            limit: responseLimit,
            offset: responseOffset,
            items,
          } = response.data;

          // Map items to include ID for grid
          const resultsWithId: LotteryResultGridItem[] = items.map((item) => ({
            ...item,
            id: `${item.draw_date}-${item.draw_code}`,
          }));

          if (append) {
            // Append new results to existing ones
            setResults((prev) => [...prev, ...resultsWithId]);
          } else {
            // Replace existing results
            setResults(resultsWithId);
          }

          // Update pagination state
          setPagination({
            total,
            limit: responseLimit,
            offset: responseOffset + resultsWithId.length,
            hasMore: responseOffset + resultsWithId.length < total,
          });
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
        // Stop loading more if there's an error
        setPagination((prev) => ({ ...prev, hasMore: false }));
      }
    },
    []
  );

  /**
   * Loads the initial 10 lottery results using the history API
   * Uses getLotteryHistory() internally through the API route
   */
  useEffect(() => {
    const loadInitial = async () => {
      setLoading((prev) => ({ ...prev, initial: true }));

      try {
        // Fetch first 10 results (limit: 10, offset: 0)
        await fetchHistory(10, 0, false);
      } catch (error) {
        console.error("Failed to load initial results:", error);
      } finally {
        setLoading((prev) => ({ ...prev, initial: false }));
      }
    };

    loadInitial();
  }, [fetchHistory]);

  useEffect(() => {
    (refreshTimeoutRef.current as any) = scheduleDailyRefresh(() =>
      fetchHistory(10, 0, false)
    );
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchHistory]);

  /**
   * Loads more results for infinite scroll
   * Uses getLotteryHistory() through the API route with updated offset
   */
  const loadMoreResults = useCallback(async () => {
    if (loading.more || !pagination.hasMore) return;

    setLoading((prev) => ({ ...prev, more: true }));

    try {
      // Fetch next batch using current offset
      await fetchHistory(pagination.limit, pagination.offset, true);
    } catch (error) {
      console.error("Failed to load more results:", error);
    } finally {
      setLoading((prev) => ({ ...prev, more: false }));
    }
  }, [
    pagination.limit,
    pagination.offset,
    pagination.hasMore,
    loading.more,
    fetchHistory,
  ]);

  /**
   * Filters results based on search criteria (date and name/code)
   * Memoized to avoid recalculating on every render
   */
  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // Filter by date if provided
    if (filters.date) {
      filtered = filtered.filter((result) => result.draw_date === filters.date);
    }

    // Filter by name or code if provided
    if (filters.name) {
      const searchLower = filters.name.toLowerCase();
      filtered = filtered.filter(
        (result) =>
          result.draw_name?.toLowerCase().includes(searchLower) ||
          result.draw_code?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [filters.date, filters.name, results]);

  /**
   * Opens the preview panel with the selected result
   * @param result - The lottery result to preview
   */
  const handlePreview = useCallback((result: LotteryResultGridItem) => {
    setPreview({
      isOpen: true,
      result,
    });
  }, []);

  /**
   * Closes the preview panel
   */
  const handleClosePreview = useCallback(() => {
    setPreview({
      isOpen: false,
      result: null,
    });
  }, []);

  /**
   * Handles print functionality
   * TODO: Implement print with logo overlay
   * @param result - The lottery result to print
   */
  const handlePrint = useCallback((result: LotteryResultGridItem) => {
    console.log("Print result:", result);
    window.print();
  }, []);

  /**
   * Updates a specific filter value
   * @param key - Filter key to update
   * @param value - New filter value
   */
  const updateFilter = useCallback(
    (key: keyof SearchFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  /**
   * Clears all search filters
   */
  const clearFilters = useCallback(() => {
    setFilters({ date: "", name: "" });
  }, []);

  /**
   * Custom renderer for the actions column in the data grid
   * Renders a "View" button that opens the preview panel
   */
  const customRenderers = useMemo(
    () => ({
      drawDate: (row: LotteryResultGridItem) => {
        const drawDate = new Date(row.draw_date);
        const formattedDate = drawDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const showNewBadge = isFirstRow(filteredResults, row) && isPast4PM();
        return (
          <div className="relative inline-block w-full">
            <span>{formattedDate}</span>
            {showNewBadge && (
              <span className="absolute -top-2 -right-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm z-10">
                New
              </span>
            )}
          </div>
        );
      },
      actions: (row: LotteryResultGridItem) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePreview(row);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
            title="View Details"
          >
            <Eye size={18} />
          </button>
        </div>
      ),
    }),
    [handlePreview, filteredResults, isPast4PM, isFirstRow]
  );

  /**
   * Handles the goto admin dashboard
   */
  const handleGotoAdminDashboard = () => {
    router.push("/admin");
  };

  // Show loading state during initial load
  if (loading.initial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        {/* Header Section */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex  justify-between">
            <h1 className="text-2xl font-bold text-gray-800">LotteryLot</h1>
            <div>
              {isAdmin && (
                <button
                  onClick={handleGotoAdminDashboard}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition cursor-pointer"
                >
                  <LayoutDashboard size={18} />
                  Admin Dashboard
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Search Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Search by Date
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => updateFilter("date", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Name/Code Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search size={16} className="inline mr-1" />
                  Search by Name/Code
                </label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => updateFilter("name", e.target.value)}
                  placeholder="Enter draw name or code..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Clear Filters Button - Only show if filters are active */}
            {(filters.date || filters.name) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Results Grid Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Latest Results
            </h2>
            <DataGrid
              data={filteredResults}
              columns={lotteryGridConfig}
              hasMore={pagination.hasMore && !filters.date && !filters.name}
              isLoading={loading.more}
              onLoadMore={loadMoreResults}
              emptyMessage="No results found. Try adjusting your search filters."
              customRenderers={customRenderers}
            />
          </div>
        </main>
      </div>

      {/* Preview Panel - Shows detailed lottery result */}
      <LotteryPreviewPanel
        isOpen={preview.isOpen}
        onClose={handleClosePreview}
        result={preview.result}
        onPrint={handlePrint}
      />
    </>
  );
}
