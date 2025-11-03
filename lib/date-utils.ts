/**
 * Date normalization utilities
 * Adds current year to dates that don't have a year specified
 */

/**
 * Normalize a date string by adding the current year if missing
 * Handles formats like:
 * - "MM-DD" -> "YYYY-MM-DD"
 * - "YYYY-MM-DD" -> unchanged
 * - "Jan 15" -> "YYYY-01-15" (if parseable)
 */
export function normalizeDate(dateString: string | undefined): string | undefined {
  if (!dateString || !dateString.trim()) return dateString;

  const trimmed = dateString.trim();
  const currentYear = new Date().getFullYear();

  // Check if date already has a year (format: YYYY-MM-DD or similar)
  const yearMatch = trimmed.match(/^(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    // If the year is in the past (not current year) or way in the future, replace with current year
    if (year < currentYear || year > currentYear + 10) {
      // Replace the year with current year
      const withoutYear = trimmed.replace(/^\d{4}[-/]/, '').replace(/^\d{4}/, '');
      const mmddMatch = withoutYear.match(/^(\d{1,2})[-/](\d{1,2})/);
      if (mmddMatch) {
        const month = mmddMatch[1].padStart(2, '0');
        const day = mmddMatch[2].padStart(2, '0');
        return `${currentYear}-${month}-${day}`;
      }
    } else if (year === currentYear) {
      // Current year, return as-is (already validated)
      return trimmed;
    }
  }

  // Try to parse as MM-DD format (no year specified)
  const mmddMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})(?:\s|$)/);
  if (mmddMatch) {
    const month = mmddMatch[1].padStart(2, '0');
    const day = mmddMatch[2].padStart(2, '0');
    return `${currentYear}-${month}-${day}`;
  }

  // Try to parse month names (Jan, January, etc.)
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const shortMonthNames = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  const lowerTrimmed = trimmed.toLowerCase();
  for (let i = 0; i < monthNames.length; i++) {
    const monthPattern = new RegExp(`(${monthNames[i]}|${shortMonthNames[i]})\\s+(\\d{1,2})`, 'i');
    const match = trimmed.match(monthPattern);
    if (match) {
      const month = String(i + 1).padStart(2, '0');
      const day = match[2].padStart(2, '0');
      return `${currentYear}-${month}-${day}`;
    }
  }

  // If we can't parse it, try to create a Date and see if it works
  // If it's a valid date string that JavaScript can parse
  try {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const parsedYear = parsed.getFullYear();
      // If the parsed date has an old year (not current year) or is way in the past/future, use current year
      if (parsedYear < currentYear || parsedYear > currentYear + 10) {
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${currentYear}-${month}-${day}`;
      }
      // If it's current year or near future, format it as YYYY-MM-DD
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Couldn't parse, return original
  }

  return trimmed;
}

/**
 * Normalize event data dates
 */
export function normalizeEventDates<T extends { date?: string; endDate?: string }>(
  eventData: T
): T {
  const normalized = { ...eventData };

  if (normalized.date) {
    normalized.date = normalizeDate(normalized.date) || normalized.date;
  }

  if (normalized.endDate) {
    normalized.endDate = normalizeDate(normalized.endDate) || normalized.endDate;
  } else if (normalized.date) {
    // If no endDate but there's a start date, use the same date
    normalized.endDate = normalized.date;
  }

  return normalized;
}

