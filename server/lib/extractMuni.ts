// AI-powered municipal financial data extraction using OpenAI
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ""
});

export interface MunicipalData {
  revenues: Array<{
    category: string;
    amount: number;
    description: string;
    fund?: string;
  }>;
  expenditures: Array<{
    category: string;
    amount: number;
    description: string;
    fund?: string;
  }>;
  funds: Array<{
    name: string;
    balance: number;
    type: string;
  }>;
  assets: Array<{
    category: string;
    amount: number;
    description?: string;
  }>;
  liabilities: Array<{
    category: string;
    amount: number;
    description?: string;
  }>;
  metadata: {
    municipalityName?: string;
    fiscalYear?: string;
    reportType?: string;
    extractedAt: string;
  };
}

export async function extractMunicipalData(text: string): Promise<MunicipalData> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert financial analyst specializing in municipal CAFR (Comprehensive Annual Financial Report) documents. 
          
Extract and structure financial data from the provided text. Focus on:

1. **Revenues**: Tax revenues, intergovernmental revenues, charges for services, fines, investment income
2. **Expenditures**: General government, public safety, public works, community development, debt service
3. **Fund Balances**: General fund, special revenue funds, capital projects funds, debt service funds
4. **Assets**: Current assets, capital assets, investments, restricted assets
5. **Liabilities**: Current liabilities, long-term debt, pension obligations

Return JSON in this exact structure:
{
  "revenues": [{"category": "string", "amount": number, "description": "string", "fund": "string"}],
  "expenditures": [{"category": "string", "amount": number, "description": "string", "fund": "string"}],
  "funds": [{"name": "string", "balance": number, "type": "string"}],
  "assets": [{"category": "string", "amount": number, "description": "string"}],
  "liabilities": [{"category": "string", "amount": number, "description": "string"}],
  "metadata": {
    "municipalityName": "string",
    "fiscalYear": "string", 
    "reportType": "string",
    "extractedAt": "ISO date string"
  }
}

Extract actual dollar amounts (convert thousands/millions as needed). If no data found for a category, return empty array.`
        },
        {
          role: "user",
          content: `Extract municipal financial data from this CAFR text:\n\n${text.substring(0, 15000)}` // Limit to avoid token limits
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1 // Low temperature for consistent extraction
    });

    const extractedData = JSON.parse(response.choices[0].message.content || "{}");
    
    // Ensure metadata has extractedAt timestamp
    if (!extractedData.metadata) {
      extractedData.metadata = {};
    }
    extractedData.metadata.extractedAt = new Date().toISOString();
    
    return validateMunicipalData(extractedData);
  } catch (error) {
    throw new Error(`AI extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateMunicipalData(data: any): MunicipalData {
  // Ensure all required arrays exist
  const validated: MunicipalData = {
    revenues: Array.isArray(data.revenues) ? data.revenues : [],
    expenditures: Array.isArray(data.expenditures) ? data.expenditures : [],
    funds: Array.isArray(data.funds) ? data.funds : [],
    assets: Array.isArray(data.assets) ? data.assets : [],
    liabilities: Array.isArray(data.liabilities) ? data.liabilities : [],
    metadata: {
      municipalityName: data.metadata?.municipalityName || "Unknown",
      fiscalYear: data.metadata?.fiscalYear || "Unknown",
      reportType: data.metadata?.reportType || "CAFR",
      extractedAt: data.metadata?.extractedAt || new Date().toISOString()
    }
  };
  
  return validated;
}

export function convertToCSV(data: MunicipalData): string {
  const rows: string[] = [];
  
  // CSV Header
  rows.push("Category,Type,Description,Amount,Fund,Municipality,Fiscal_Year");
  
  // Add revenues
  data.revenues.forEach(item => {
    rows.push(`"${item.category}","Revenue","${item.description}",${item.amount},"${item.fund || ''}","${data.metadata.municipalityName}","${data.metadata.fiscalYear}"`);
  });
  
  // Add expenditures
  data.expenditures.forEach(item => {
    rows.push(`"${item.category}","Expenditure","${item.description}",${item.amount},"${item.fund || ''}","${data.metadata.municipalityName}","${data.metadata.fiscalYear}"`);
  });
  
  // Add funds
  data.funds.forEach(item => {
    rows.push(`"${item.name}","Fund Balance","${item.type}",${item.balance},"","${data.metadata.municipalityName}","${data.metadata.fiscalYear}"`);
  });
  
  // Add assets
  data.assets.forEach(item => {
    rows.push(`"${item.category}","Asset","${item.description || ''}",${item.amount},"","${data.metadata.municipalityName}","${data.metadata.fiscalYear}"`);
  });
  
  // Add liabilities
  data.liabilities.forEach(item => {
    rows.push(`"${item.category}","Liability","${item.description || ''}",${item.amount},"","${data.metadata.municipalityName}","${data.metadata.fiscalYear}"`);
  });
  
  return rows.join("\n");
}

export function summarizeExtraction(data: MunicipalData) {
  const totalRevenue = data.revenues.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenditures = data.expenditures.reduce((sum, item) => sum + item.amount, 0);
  const totalAssets = data.assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = data.liabilities.reduce((sum, item) => sum + item.amount, 0);
  const recordCount = data.revenues.length + data.expenditures.length + data.funds.length + data.assets.length + data.liabilities.length;

  return {
    recordCount,
    totalRevenue,
    totalExpenditures,
    totalAssets,
    totalLiabilities,
    netPosition: totalAssets - totalLiabilities,
    municipality: data.metadata.municipalityName,
    fiscalYear: data.metadata.fiscalYear
  };
}