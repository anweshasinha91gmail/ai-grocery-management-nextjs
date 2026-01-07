// utils/normalizeName.ts
export function normalizeName(name: string): string {
  if (!name) return "";
  let normalized = name.toLowerCase().trim();

  // Common English plural → singular mappings
  const rules: [RegExp, string][] = [
    [/(ies)$/, "y"],          // berries → berry
    [/(ves)$/, "f"],          // leaves → leaf
    [/(oes)$/, "o"],          // potatoes → potato
    [/(ches)$/, "ch"],
    [/(ses)$/, "s"],          // dresses → dress
    [/s$/, ""],               // apples → apple (but only last fallback)
  ];

  for (const [pattern, replacement] of rules) {
    if (pattern.test(normalized)) {
      normalized = normalized.replace(pattern, replacement);
      break;
    }
  }

  return normalized;
}
