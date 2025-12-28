import { LotteryResultGridItem } from "@/components/lottery/lotteryGridUtils";
import jsPDF from "jspdf";

/**
 * Schedules a daily refresh of the data
 * @param refreshFn - The function to refresh the data
 * @returns The timeout for the refresh
 */
export const scheduleDailyRefresh = (refreshFn: any): NodeJS.Timeout => {
  const now = new Date();
  const target = new Date();
  target.setHours(16, 5, 0, 0);
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  const timeUntilTarget = target.getTime() - now.getTime();
  return setTimeout(() => {
    refreshFn();
    scheduleDailyRefresh(refreshFn);
  }, timeUntilTarget);
};

/**
 * Checks if current time is past 4:05 PM today
 * @returns true if current time is past 4:05 PM, false otherwise
 */
export const isPast4PM = () => {
  const now = new Date();
  const today4PM = new Date();
  today4PM.setHours(16, 5, 0, 0);
  return now > today4PM;
};

/**
 * Checks if a result is the first row in the filtered results
 * @param filteredResults - The filtered results to check
 * @param result - The lottery result to che
 * @returns true if it's the first row, false otherwise
 */
export const isFirstRow = (
  filteredResults: any,
  result: LotteryResultGridItem
): boolean => {
  return filteredResults.length > 0 && filteredResults[0].id === result.id;
};

// ---------------------------------------- PDF Utils ----------------------------------------

/**
 *
 * @param result - The lottery result to convert to PDF payload
 * @returns The PDF payload
 */
export const pdfGenerator = (
  result: LotteryResultGridItem,
  logoUrl: string,
  displayText: string,
  ticketRanges?: any
): any => {
  // Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 10; // Left/right margin
  let yPosition = 10; // Start from top

  // ========== STEP 1: LOGO + DISPLAY TEXT (Same Row) ==========
  const logoWidth = 20;
  const logoHeight = 20;

  // Add logo on left
  try {
    doc.addImage(logoUrl, "PNG", margin, yPosition, logoWidth, logoHeight);
  } catch (error) {
    console.warn("Could not load logo:", error);
  }

  // Add display text next to logo (same y position, but x is after logo)
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(displayText, margin + logoWidth + 5, yPosition + logoHeight / 2, {
    align: "left",
    baseline: "middle", // Vertically center with logo
  });

  // Move down for next section
  yPosition += logoHeight + 10; // Logo height + spacing

  // ========== STEP 2: FIRST PRIZE ==========
  if (result.first) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    // Get prize amount from result.prizes.amounts["1st"]
    const firstPrizeAmount = result.prizes?.amounts?.["1st"] || "1 Crore";
    const firstPrizeText = `First Prize: ${result.first.ticket} - ${firstPrizeAmount}`;

    doc.text(firstPrizeText, margin, yPosition);
    yPosition += 8; // Move down
  }

  // ========== STEP 3: SECOND PRIZE ==========
  if (result.prizes?.["2nd"] && result.prizes["2nd"].length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    const secondPrizeAmount = result.prizes?.amounts?.["2nd"] || "25 Lakh";
    const secondPrizeText = `Second Prize: ${result.prizes["2nd"][0]} - ${secondPrizeAmount}`;

    doc.text(secondPrizeText, margin, yPosition);
    yPosition += 8;
  }

  // ========== STEP 4: CONSOLATION PRIZES (if any) ==========
  if (result.prizes?.consolation && result.prizes.consolation.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Consolation Prizes:", margin, yPosition);
    yPosition += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Display consolation tickets in a grid
    const numbersPerRow = 5; // How many per row
    let xPos = margin;

    result.prizes.consolation.forEach((ticket: string, index: number) => {
      // Move to next row if needed
      if (index > 0 && index % numbersPerRow === 0) {
        yPosition += 5;
        xPos = margin; // Reset to left
      }

      doc.text(ticket, xPos, yPosition);
      xPos += 35; // Space between numbers
    });

    yPosition += 8; // Extra space after consolation
  }

  // ========== STEP 5: 3RD PRIZE ONWARD (Two Column Layout) ==========
  const prizeOrder = ["3rd", "4th", "5th", "6th", "7th", "8th", "9th"];
  const prizeLabels: { [key: string]: string } = {
    "3rd": "Third Prize - 10 Lakh",
    "4th": "Fourth Prize - 5000",
    "5th": "Fifth Prize - 2000",
    "6th": "Sixth Prize - 1000",
    "7th": "Seventh Prize - 500",
    "8th": "Eighth Prize - 200",
    "9th": "Ninth Prize - 100",
  };

  prizeOrder.forEach((prizeKey) => {
    const prizeNumbers =
      result.prizes?.[prizeKey as keyof typeof result.prizes];

    if (Array.isArray(prizeNumbers) && prizeNumbers.length > 0) {
      // LEFT COLUMN: Prize name and amount
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const prizeLabel = prizeLabels[prizeKey] || `${prizeKey} Prize`;
      doc.text(prizeLabel, margin, yPosition);

      // RIGHT COLUMN: Numbers in grid
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      const numbersPerRow = 10; // How many numbers per row
      let xPos = margin + 60; // Start numbers 60mm from left (after prize name)
      let currentY = yPosition; // Track current row

      prizeNumbers.forEach((num: string, index: number) => {
        // Move to next row if needed
        if (index > 0 && index % numbersPerRow === 0) {
          currentY += 5; // Move down
          xPos = margin + 60; // Reset to start of numbers column
        }

        doc.text(num, xPos, currentY);
        xPos += 12; // Space between numbers
      });

      // Move yPosition to the bottom of this prize section
      const rowsNeeded = Math.ceil(prizeNumbers.length / numbersPerRow);
      yPosition = currentY + (rowsNeeded > 1 ? 0 : 5) + 5; // Add spacing
    }
  });

  // ========== SAVE PDF ==========
  const fileName = `${result.draw_name}-${result.draw_code}-${result.draw_date}.pdf`;
  doc.save(fileName);

  return doc;
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
