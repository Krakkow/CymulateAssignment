import { parse } from "csv-parse/sync";
import fs from "fs";
import { FindingRow } from "../types/findingRow";

// Normalize headers (case & spaces)
const normalizeHeader = (h: string) => h.toLowerCase().replace(/\s+/g, " ").trim();
// Normalize cell text
export const normalizeText = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * Reads the first row from the exported findings CSV.
 * Returns { name, timestamp, status } as FindingRow.
 */
export function firstRowFromCsv(csvPath: string): FindingRow {
  const buf = fs.readFileSync(csvPath);
  const rows: Record<string, string>[] = parse(buf, {
    columns: true,
    skip_empty_lines: true,
  });

  if (!rows.length) {
    throw new Error("CSV has no data rows");
  }

  const row = rows[0];

  // Build a lookup map of normalized header -> original header
  const headerMap = new Map<string, string>();
  Object.keys(row).forEach((key) => {
    headerMap.set(normalizeHeader(key), key);
  });

  const get = (wanted: string): string => {
    const key = normalizeHeader(wanted);
    const actual = headerMap.get(key);
    if (!actual) {
      throw new Error(`Header "${wanted}" not found. Available: ${[...headerMap.keys()].join(", ")}`);
    }
    return normalizeText(row[actual] ?? "");
  };

  return {
    name: get("Finding Name"),
    timestamp: get("Timestamp"),
    status: get("Status"),
  };
}
