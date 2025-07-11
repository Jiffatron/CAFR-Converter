// Client-side AI extraction utilities
// Note: Main AI processing happens on the server using OpenAI

export interface ExtractedData {
  revenues: Array<{
    category: string;
    amount: number;
    description: string;
  }>;
  expenditures: Array<{
    category: string;
    amount: number;
    description: string;
  }>;
  funds: Array<{
    name: string;
    balance: number;
    type: string;
  }>;
  assets: Array<{
    category: string;
    amount: number;
  }>;
  liabilities: Array<{
    category: string;
    amount: number;
  }>;
}

export function validateExtractedData(data: any): data is ExtractedData {
  if (!data || typeof data !== "object") return false;
  
  const requiredFields = ["revenues", "expenditures", "funds", "assets", "liabilities"];
  return requiredFields.every(field => Array.isArray(data[field]));
}

export function countTotalRecords(data: ExtractedData): number {
  return (
    data.revenues.length +
    data.expenditures.length +
    data.funds.length +
    data.assets.length +
    data.liabilities.length
  );
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function summarizeExtractedData(data: ExtractedData) {
  const totalRevenue = data.revenues.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenditures = data.expenditures.reduce((sum, item) => sum + item.amount, 0);
  const totalAssets = data.assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = data.liabilities.reduce((sum, item) => sum + item.amount, 0);

  return {
    totalRevenue,
    totalExpenditures,
    totalAssets,
    totalLiabilities,
    netPosition: totalAssets - totalLiabilities,
    recordCount: countTotalRecords(data),
  };
}
