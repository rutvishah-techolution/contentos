export interface FetchResult {
  ok: boolean;
  status: number;
  finalUrl: string; // after following redirects (resolves Gemini grounding URLs)
  snippet: string; // stripped page text for the validator to judge support
  title?: string; // real page title (undefined if junk/blocked/error page)
  publishedAt?: string; // YYYY-MM-DD if detectable
  dead: boolean; // genuinely dead (404/410 or soft-404) — safe to strip
  error?: string;
}

/**
 * Fetches a URL server-side, following redirects. This is the validator's
 * `fetch_url` tool: it confirms a source resolves and pulls page text so the
 * source-check can judge whether the source actually supports the claim.
 * Following redirects also turns Gemini's grounding-redirect URLs into the
 * real underlying source.
 */
export async function fetchUrl(url: string): Promise<FetchResult> {
  if (!url || !/^https?:\/\//i.test(url)) {
    return { ok: false, status: 0, finalUrl: url, snippet: "", error: "invalid or missing URL" };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AIContentEngine/1.0; source-validation)",
        Accept: "text/html,application/xhtml+xml,application/json,*/*",
      },
    });
    clearTimeout(timer);

    const finalUrl = res.url || url;
    const ct = res.headers.get("content-type") || "";
    let snippet = "";
    let rawTitle: string | undefined;
    let publishedAt: string | undefined;
    if (/text|html|json|xml/i.test(ct)) {
      const html = await res.text();
      // keep a large window so figures deep in the article are searchable
      snippet = stripHtml(html).slice(0, 30000);
      rawTitle = extractTitle(html);
      publishedAt = extractPublishDate(html, finalUrl);
    } else {
      publishedAt = dateFromUrl(finalUrl);
    }

    // Dead = hard 404/410, or a "soft 404" (200 but the title says not-found).
    const dead =
      res.status === 404 || res.status === 410 || isNotFoundTitle(rawTitle);
    // Drop junk/blocked titles ("Just a moment…", "Access denied", 404 pages).
    const title = isJunkTitle(rawTitle) ? undefined : rawTitle;

    return {
      ok: res.ok,
      status: res.status,
      finalUrl,
      snippet,
      title,
      publishedAt,
      dead,
    };
  } catch (e) {
    // Network/timeout error: unreachable, but NOT provably dead — keep it.
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      snippet: "",
      dead: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/** Titles that mean the page is genuinely gone (dead). */
function isNotFoundTitle(t?: string): boolean {
  if (!t) return false;
  return /error 404|404[^0-9]*not found|page not found|not found!!1|410 gone/i.test(
    t,
  );
}

/** Titles from bot-blocks / challenges / errors — not the real article title. */
function isJunkTitle(t?: string): boolean {
  if (!t) return true;
  return /just a moment|attention required|access denied|are you (a )?(human|robot)|verify(ing)? you are human|403 forbidden|forbidden|error 404|404|page not found|not found!!1|cloudflare|please wait|checking your browser/i.test(
    t,
  );
}

function extractTitle(html: string): string | undefined {
  const og = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
  );
  if (og) return decodeEntities(og[1]).trim().slice(0, 200);
  const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (t) return decodeEntities(t[1]).trim().slice(0, 200);
  return undefined;
}

/** Detects a publish date from meta tags, JSON-LD, <time>, or the URL path. */
function extractPublishDate(html: string, url: string): string | undefined {
  const patterns = [
    /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["'](?:date|pubdate|publishdate|dc\.date)["'][^>]+content=["']([^"']+)["']/i,
    /"datePublished"\s*:\s*"([^"]+)"/i,
    /<time[^>]+datetime=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    const d = m && normalizeDate(m[1]);
    if (d) return d;
  }
  return dateFromUrl(url);
}

/** Many news URLs embed the date, e.g. /2026/07/19/... */
function dateFromUrl(url: string): string | undefined {
  const m = url.match(/\/(20\d{2})[/-](\d{1,2})[/-](\d{1,2})(?:\/|$)/);
  if (!m) return undefined;
  return normalizeDate(`${m[1]}-${m[2]}-${m[3]}`);
}

function normalizeDate(raw: string): string | undefined {
  const m = raw.match(/(20\d{2})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!m) return undefined;
  const [, y, mo, d] = m;
  const mm = mo.padStart(2, "0");
  const dd = d.padStart(2, "0");
  if (+mm < 1 || +mm > 12 || +dd < 1 || +dd > 31) return undefined;
  return `${y}-${mm}-${dd}`;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
