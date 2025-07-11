import Papa from "papaparse";

export function toCsv(rows: Record<string, unknown>[]) {
  return Papa.unparse(rows, { header: true });
}