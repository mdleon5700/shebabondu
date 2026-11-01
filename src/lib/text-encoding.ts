const legacyBytes = new Map<string, number>();
const legacyDecoder = new TextDecoder('windows-1252');
const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

for (let byte = 128; byte < 160; byte++) {
  legacyBytes.set(legacyDecoder.decode(new Uint8Array([byte])), byte);
}

const legacyRun = /[\u0080-\u00ff\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013-\u201a\u201c-\u201e\u2020-\u2022\u2026\u2030\u2039\u203a\u20ac\u2122]+/g;

export function repairTextEncoding(value: string): string {
  let result = value;
  for (let pass = 0; pass < 3; pass++) {
    if (!/[àÃÂâð]/.test(result)) break;
    const expanded = result.replace(/\\x([89a-f][0-9a-f])/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    const decoded = expanded.replace(legacyRun, run => {
      if (!/[àÃÂâð]/.test(run)) return run;
      const bytes = Array.from(run, character => legacyBytes.get(character) ?? character.charCodeAt(0));
      try {
        return utf8Decoder.decode(new Uint8Array(bytes));
      } catch {
        return run;
      }
    });
    if (decoded === result) break;
    result = decoded;
  }
  return result;
}

export function repairStoredText<T>(value: T): T {
  if (typeof value === 'string') return repairTextEncoding(value) as T;
  if (Array.isArray(value)) return value.map(repairStoredText) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairStoredText(item)])) as T;
  }
  return value;
}
