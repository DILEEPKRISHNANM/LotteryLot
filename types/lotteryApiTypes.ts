// Type definitions based on your data model
export interface FirstPrize {
  ticket: string;
  location: string;
  agent: string;
  agency_no: string;
}

export interface PrizeAmounts {
  "1st": string;
  "2nd"?: string;
  "3rd"?: string;
  "4th"?: string;
  "5th"?: string;
  "6th"?: string;
  "7th"?: string;
  "8th"?: string;
  "9th"?: string;
  consolation: string;
  [key: string]: string | undefined; // For other prize amounts
}

export interface Prizes {
  consolation: string[];
  "2nd": string[];
  "3rd": string[];
  "4th": string[];
  "5th": string[];
  "6th": string[];
  "7th": string[];
  "8th": string[];
  "9th": string[];
  amounts: PrizeAmounts;
  guess?: string[]; // Optional
}

export interface LotteryResult {
  draw_date: string; // YYYY-MM-DD
  draw_name: string; // e.g., "Akshaya"
  draw_code: string; // e.g., "AK-655"
  first: FirstPrize;
  prizes: Prizes;
}

/**
 * History API Response interface matching the external API format
 */
export interface HistoryApiResponse {
  total: number;
  limit: number;
  offset: number;
  items: LotteryResult[];
}
