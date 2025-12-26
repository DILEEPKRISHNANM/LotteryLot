"use client";

import { useMemo, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { clientGridColumnConfig } from "@/types/gridTypes";

interface DataGridProps<T = any> {
  data: T[];
  columns: clientGridColumnConfig[];
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
  customRenderers?: Record<string, (row: T) => React.ReactNode>;
  maxHeight?: string;
}

// Render cell based on column type
function renderCell(
  config: clientGridColumnConfig,
  value: any
): React.ReactNode {
  // Use fallback if value is null/undefined/empty
  if (value === null || value === undefined || value === "") {
    return <span>{config.fallBackValue ?? "-"}</span>;
  }

  switch (config.type) {
    case "text":
      return <span>{String(value)}</span>;

    case "number":
      return <span>{Number(value).toLocaleString()}</span>;

    case "date":
      const date = new Date(value);
      return (
        <span>
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );

    case "boolean":
      return (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      );

    case "checkbox":
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          readOnly
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      );

    default:
      return <span>{String(value)}</span>;
  }
}

// Convert config to TanStack Table columns
function createColumnsFromConfig<T>(
  configs: clientGridColumnConfig[],
  customRenderers?: Record<string, (row: T) => React.ReactNode>
): ColumnDef<T>[] {
  return configs.map((config) => {
    // Check if there's a custom renderer for this column
    if (customRenderers && customRenderers[config.id]) {
      return {
        id: config.id,
        accessorKey: config.accessorKey,
        header: config.header,
        cell: (info) => customRenderers[config.id](info.row.original),
      };
    }

    // Default rendering
    return {
      id: config.id,
      accessorKey: config.accessorKey,
      header: config.header,
      cell: (info) => {
        const value = info.getValue();
        return renderCell(config, value);
      },
    };
  });
}

export function DataGrid<T = any>({
  data,
  columns,
  hasMore = false,
  isLoading = false,
  onLoadMore,
  emptyMessage = "No data found",
  customRenderers,
  maxHeight = "600px",
}: DataGridProps<T>) {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    if (!onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  // Create columns from config
  const tableColumns = useMemo(
    () => createColumnsFromConfig<T>(columns, customRenderers),
    [columns, customRenderers]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Empty state
  if (data.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: maxHeight }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infinite Scroll Trigger */}
      {onLoadMore && (
        <div
          ref={observerTarget}
          className="h-10 flex items-center justify-center"
        >
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={20} />
              <span>Loading more...</span>
            </div>
          )}
          {!hasMore && data.length > 0 && (
            <div className="text-sm text-gray-500">No more data to load</div>
          )}
        </div>
      )}
    </div>
  );
}
