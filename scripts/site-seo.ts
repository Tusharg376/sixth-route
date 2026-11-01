import { readdirSync, readFileSync, existsSync, realpathSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import type { Plugin } from "vite";

export const SITE_ORIGIN = "https://www.sixthroute.com";
const ignored = new Set(["node_modules", "dist", "dist-ssr", "src", "public", "scripts", "worker", "coverage"]);
const tagPattern = /<(?:meta|link)\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi;
const escapeXml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);
const noindex = (value: string) => /(?:^|[\s,;:])(?:noindex|none)(?:$|[\s,;])/i.test(value);

function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4];
  }
  return result;
}

export function discoverPages(root: string, directory = root): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".") || ignored.has(entry.name)) return [];
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return discoverPages(root, file);
    return entry.isFile() && entry.name.endsWith(".html") ? [relative(root, file).split(sep).join("/")] : [];
  }).sort();
}

export function routeForPage(file: string): string {
  return `/${file}`.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
}

function matchesRoute(pattern: string, route: string): boolean {
  if (pattern.startsWith("https://") || pattern.startsWith("http://")) {
    const source = new URL(pattern);
    if (source.origin !== SITE_ORIGIN) return false;
    pattern = source.pathname;
  }
  const expression = pattern.split(/(\*|:[A-Za-z_][\w]*)/).map((part) =>
    part === "*" ? ".*" : part.startsWith(":") ? "[^/]+" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  ).join("");
  return new RegExp(`^${expression}$`).test(route);
}

export function isExcludedByRules(route: string, redirects: string, headers: string): boolean {
  for (const line of redirects.split(/\r?\n/)) {
    const [source, , status = "302"] = line.trim().split(/\s+/);
    if (source && !source.startsWith("#") && /^30[12378]!?$/.test(status) && matchesRoute(source, route)) return true;
  }
  let pattern = "";
  for (const line of headers.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (!/^\s/.test(line)) pattern = line.trim();
    else if (pattern && matchesRoute(pattern, route) && /^\s+x-robots-tag\s*:/i.test(line) && noindex(line)) return true;
  }
  return false;
}

export function pageMetadata(file: string, html: string, redirects = "", headers = "") {
  const route = routeForPage(file);
  const ownUrl = new URL(route, SITE_ORIGIN).href;
  const head = (html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? "").replace(/<!--[\s\S]*?-->/g, "");
  const tags = [...head.matchAll(tagPattern)].map((match) => ({ tag: match[0], attrs: attributes(match[0]) }));
  const canonicalTags = tags.filter(({ tag, attrs }) => /^<link/i.test(tag) && attrs.rel?.toLowerCase().split(/\s+/).includes("canonical"));
  if (canonicalTags.length > 1) throw new Error(`Multiple canonical URLs in ${file}`);
  const canonical = new URL(canonicalTags[0]?.attrs.href ?? ownUrl, ownUrl);
  if (canonical.search || canonical.hash || canonical.protocol !== "https:") throw new Error(`Invalid canonical URL in ${file}`);
  const excluded = basename(file) === "404.html" || tags.some(({ tag, attrs }) => /^<meta/i.test(tag) && (
    (["robots", "googlebot"].includes(attrs.name?.toLowerCase()) && noindex(attrs.content ?? "")) || attrs["http-equiv"]?.toLowerCase() === "refresh"
  )) || isExcludedByRules(route, redirects, headers);
  return { file, route, canonical: canonical.href, canonicalTags, excluded, indexable: !excluded && canonical.href === ownUrl };
}

export function renderSitemap(urls: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(urls)].sort().map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join("\n")}\n</urlset>\n`;
}

export function siteSeo(root: string): { input: string[]; plugin: Plugin } {
  const files = discoverPages(root);
  const readRules = (name: string) => existsSync(join(root, "public", name)) ? readFileSync(join(root, "public", name), "utf8") : "";
  const redirects = readRules("_redirects");
  const headers = readRules("_headers");
  const pages = files.map((file) => ({ ...pageMetadata(file, readFileSync(join(root, file), "utf8"), redirects, headers), source: realpathSync(join(root, file)) }));
  return {
    input: files.map((file) => resolve(root, file)),
    plugin: {
      name: "sixth-route-seo",
      transformIndexHtml: {
        order: "pre",
        handler(html, context) {
          const page = pages.find((entry) => entry.source === realpathSync(context.filename));
          if (!page || page.excluded) return html;
          for (const { tag } of page.canonicalTags) html = html.replace(tag, "");
          return { html, tags: [{ tag: "link", attrs: { rel: "canonical", href: page.canonical }, injectTo: "head" }] };
        },
      },
      generateBundle() {
        this.emitFile({ type: "asset", fileName: "sitemap.xml", source: renderSitemap(pages.filter((page) => page.indexable).map((page) => page.canonical)) });
        this.emitFile({ type: "asset", fileName: "robots.txt", source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n` });
      },
    },
  };
}
