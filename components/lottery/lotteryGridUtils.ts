import { clientGridColumnConfig } from "@/types/gridTypes";
import { LotteryResult } from "@/types/lotteryApiTypes";

// Extend LotteryResult for grid display
export interface LotteryResultGridItem extends LotteryResult {
  id: string; // For grid row key
}

// Grid column configuration for lottery results
export const lotteryGridConfig: clientGridColumnConfig[] = [
  {
    id: "drawDate",
    accessorKey: "draw_date",
    header: "Date",
    type: "date",
  },
  {
    id: "drawName",
    accessorKey: "draw_name",
    header: "Draw Name",
    type: "text",
    fallBackValue: "-",
  },
  {
    id: "drawCode",
    accessorKey: "draw_code",
    header: "Draw Code",
    type: "text",
    fallBackValue: "-",
  },
  {
    id: "firstPrize",
    accessorKey: "first_ticket",
    header: "First Prize",
    type: "text",
    fallBackValue: "-",
  },
  {
    id: "actions",
    accessorKey: "actions",
    header: "Actions",
    type: "text",
  },
];
