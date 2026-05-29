interface AcceptEntry {
  type: string;
  subtype: string;
  q: number;
}

const CHARS_PER_TOKEN = 4;

function parseAccept(header: string): AcceptEntry[] {
  return header.split(",").flatMap((part) => {
    let segments = part.trim().split(";");
    let media = segments.shift()?.trim().toLowerCase();
    if (!media) return [];
    let [type = "*", subtype = "*"] = media.split("/");
    let q = 1;
    for (let segment of segments) {
      let [key, value] = segment.split("=").map((s) => s.trim());
      if (key.toLowerCase() === "q") {
        let parsed = Number.parseFloat(value);
        if (!Number.isNaN(parsed)) q = Math.min(Math.max(parsed, 0), 1);
      }
    }
    return [{ type, subtype, q }];
  });
}

function qualityFor(
  entries: AcceptEntry[],
  type: string,
  subtype: string,
): number {
  let bestScore = -1;
  let bestQ = 0;

  for (let entry of entries) {
    let score: number;
    if (entry.type === type && entry.subtype === subtype) score = 3;
    else if (entry.type === type && entry.subtype === "*") score = 2;
    else if (entry.type === "*" && entry.subtype === "*") score = 1;
    else continue;

    if (score > bestScore || (score === bestScore && entry.q > bestQ)) {
      bestScore = score;
      bestQ = entry.q;
    }
  }

  return bestQ;
}

export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;

  let entries = parseAccept(accept);
  let markdown = Math.max(
    qualityFor(entries, "text", "markdown"),
    qualityFor(entries, "text", "x-markdown"),
  );
  let html = Math.max(
    qualityFor(entries, "text", "html"),
    qualityFor(entries, "application", "xhtml+xml"),
  );

  return markdown > 0 && markdown > html;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}
