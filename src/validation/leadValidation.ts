import { phoneRules } from "@/data/phoneRulesData";
import { RawLeadData } from "@/types/lead-import";

export function validateLeads(
  leads: RawLeadData[],
  selectedCountryCode: string
): { valid: RawLeadData[]; errors: string[] } {
  const errors: string[] = [];
  const valid: RawLeadData[] = [];

  leads.forEach((lead, index) => {
    const rowNum = index + 1;
    const name = lead.name?.trim();
    const phone = lead.phoneNumber?.trim();
    const code = normalizeCountryCode(lead.countryCode) || selectedCountryCode;

    // 1. Name check
    if (!name) {
      errors.push(`Row ${rowNum}: Name is required.`);
      return;
    }

    // 2. Phone check
    if (!phone) {
      errors.push(`Row ${rowNum}: Phone number is required.`);
      return;
    }

    // 3. Country code validation
    const rule = phoneRules[code] || phoneRules["default"];
    if (!rule.test(phone)) {
      errors.push(`Row ${rowNum}: Phone number "${phone}" is invalid for country code ${code}.`);
      return;
    }

    // If all checks pass
    valid.push({ ...lead, countryCode: code });
  });

  return { valid, errors };
}

function normalizeCountryCode(code?: string): string {
  if (!code) return "";
  const trimmed = code.trim();
  if (trimmed.startsWith("+")) return trimmed;
  return `+${trimmed}`;
}


