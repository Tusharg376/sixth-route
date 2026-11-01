import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { build } from "vite";
import { discoverPages, pageMetadata, renderSitemap, routeForPage, siteSeo } from "./site-seo.ts";

const html = (head = "") => `<!doctype html><html><head>${head}</head><body>Page</body></html>`;

test("canonical routes match Cloudflare's extension-free page URLs", () => {
  assert.equal(routeForPage("index.html"), "/");
  assert.equal(routeForPage("contact/index.html"), "/contact/");
  assert.equal(routeForPage("work/project.html"), "/work/project");
  assert.equal(pageMetadata("contact/index.html", html()).canonical, "https://www.sixthroute.com/contact/");
});

test("error pages, noindex directives, meta redirects and duplicate canonical URLs stay out", () => {
  const excluded = [
    pageMetadata("404.html", html()),
    pageMetadata("private.html", html('<meta content="follow, NOINDEX" name="robots">')),
    pageMetadata("private.html", html("<meta name='googlebot' content='none'>")),
    pageMetadata("old.html", html('<meta content="0;url=/contact/" http-equiv="refresh">')),
    pageMetadata("alias.html", html('<link href="/contact/" rel="canonical">')),
    pageMetadata("alias.html", html('<link rel="canonical" href="https://elsewhere.example/">')),
  ];
  assert.ok(excluded.every((page) => !page.indexable));
  assert.equal(pageMetadata("index.html", html('<!-- <meta name="robots" content="noindex"> -->')).indexable, true);
  assert.throws(() => pageMetadata("index.html", html('<link rel="canonical" href="https://www.sixthroute.com/?duplicate">')));
});

test("redirect and noindex response-header rules exclude their matching pages", () => {
  assert.equal(pageMetadata("old/index.html", html(), "/old/* /contact/ 301").indexable, false);
  assert.equal(pageMetadata("team/alex.html", html(), "/team/:name /contact/ 302").indexable, false);
  assert.equal(pageMetadata("contact/index.html", html(), "", "/*\n  X-Robots-Tag: googlebot: noindex").indexable, false);
  assert.equal(pageMetadata("contact/index.html", html(), "/contact/ /other/ 200").indexable, true);
  assert.equal(pageMetadata("contact/index.html", html(), "/old/* /contact/ 301", "/private/*\n  X-Robots-Tag: noindex").indexable, true);
});

test("new HTML pages automatically join the next build while implementation folders are ignored", () => {
  const root = mkdtempSync(join(tmpdir(), "sixth-route-seo-"));
  try {
    writeFileSync(join(root, "index.html"), html());
    for (const folder of ["new-page", "public", "dist", "node_modules", ".private"]) {
      mkdirSync(join(root, folder));
      writeFileSync(join(root, folder, "index.html"), html());
    }
    assert.deepEqual(discoverPages(root), ["index.html", "new-page/index.html"]);
    assert.deepEqual(siteSeo(root).input, [join(root, "index.html"), join(root, "new-page/index.html")]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("XML is escaped, canonical URLs are deduplicated, and dates are not fabricated", () => {
  const xml = renderSitemap(["https://www.sixthroute.com/a&b", "https://www.sixthroute.com/", "https://www.sixthroute.com/"]);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  assert.match(xml, /a&amp;b/);
  assert.equal((xml.match(/<url>/g) ?? []).length, 2);
  assert.doesNotMatch(xml, /lastmod/);
});

test("a real rebuild adds a new page to the XML and injects its canonical tag", async () => {
  const root = mkdtempSync(join(tmpdir(), "sixth-route-seo-build-"));
  const rebuild = async () => {
    const seo = siteSeo(root);
    await build({ root, configFile: false, plugins: [seo.plugin], logLevel: "silent", build: { rolldownOptions: { input: seo.input } } });
  };
  try {
    writeFileSync(join(root, "index.html"), html());
    writeFileSync(join(root, "404.html"), html('<meta name="robots" content="noindex">'));
    await rebuild();
    assert.equal((readFileSync(join(root, "dist/sitemap.xml"), "utf8").match(/<url>/g) ?? []).length, 1);
    mkdirSync(join(root, "new-page"));
    writeFileSync(join(root, "new-page/index.html"), html());
    writeFileSync(join(root, "private.html"), html('<meta name="robots" content="noindex">'));
    await rebuild();
    const xml = readFileSync(join(root, "dist/sitemap.xml"), "utf8");
    assert.match(xml, /<loc>https:\/\/www.sixthroute.com\/new-page\/<\/loc>/);
    assert.equal((xml.match(/<url>/g) ?? []).length, 2);
    assert.doesNotMatch(xml, /404|private/);
    assert.match(readFileSync(join(root, "dist/new-page/index.html"), "utf8"), /rel="canonical" href="https:\/\/www.sixthroute.com\/new-page\/"/);
    assert.match(readFileSync(join(root, "dist/robots.txt"), "utf8"), /Sitemap: https:\/\/www.sixthroute.com\/sitemap.xml/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
