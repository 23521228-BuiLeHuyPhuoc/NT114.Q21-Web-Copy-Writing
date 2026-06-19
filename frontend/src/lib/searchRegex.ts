function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createSearchRegex(query: string) {
  const normalized = query.trim();
  if (!normalized) return null;

  try {
    return new RegExp(normalized, 'i');
  } catch {
    return new RegExp(escapeRegExp(normalized), 'i');
  }
}

export function matchesSearchRegex(query: string, values: unknown[]) {
  const regex = createSearchRegex(query);
  if (!regex) return true;

  return regex.test(values.map((value) => (value == null ? '' : String(value))).join(' '));
}
