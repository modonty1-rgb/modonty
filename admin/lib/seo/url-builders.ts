import "server-only";
import { loadSiteUrl } from "./site-url";

/**
 * Centralized URL builders for the public Modonty site.
 *
 * Source of truth: `Settings.siteUrl` (DB) via `loadSiteUrl()`.
 *
 * Why centralized:
 *  - Single place that knows the URL pattern for each entity.
 *  - Impossible to hardcode `https://modonty.com` or forget `www`.
 *  - One DB hit per call — for multi-URL flows, use *FromBase variants.
 *
 * Naming convention:
 *  - `build*Url(slug)`           — async, fetches `Settings.siteUrl` once
 *  - `build*UrlFromBase(slug, baseUrl)` — sync, when caller already has baseUrl
 */

// ─────────────────────────────────────────────────────────────────
// Path constants — single source of truth for URL patterns
// ─────────────────────────────────────────────────────────────────

const PATHS = {
  articles: "/articles",
  clients: "/clients",
  categories: "/categories",
  tags: "/tags",
  industries: "/industries",
  authors: "/authors",
  sitemap: "/sitemap.xml",
  imageSitemap: "/image-sitemap.xml",
  robots: "/robots.txt",
} as const;

// ─────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

// ─────────────────────────────────────────────────────────────────
// Async builders — default, fetches Settings.siteUrl from DB
// ─────────────────────────────────────────────────────────────────

/** Article public URL: {siteUrl}/articles/{slug} */
export async function buildArticleUrl(slug: string): Promise<string> {
  const base = await loadSiteUrl();
  return buildArticleUrlFromBase(slug, base);
}

/** Client (publisher) public URL: {siteUrl}/clients/{slug} */
export async function buildClientUrl(slug: string): Promise<string> {
  const base = await loadSiteUrl();
  return buildClientUrlFromBase(slug, base);
}

/** Category listing URL: {siteUrl}/categories/{slug} */
export async function buildCategoryUrl(slug: string): Promise<string> {
  const base = await loadSiteUrl();
  return buildCategoryUrlFromBase(slug, base);
}

/** Tag listing URL: {siteUrl}/tags/{slug} */
export async function buildTagUrl(slug: string): Promise<string> {
  const base = await loadSiteUrl();
  return buildTagUrlFromBase(slug, base);
}

/** Industry listing URL: {siteUrl}/industries/{slug} */
export async function buildIndustryUrl(slug: string): Promise<string> {
  const base = await loadSiteUrl();
  return buildIndustryUrlFromBase(slug, base);
}

/** Author profile URL: {siteUrl}/authors/{slug} */
export async function buildAuthorUrl(slug: string): Promise<string> {
  const base = await loadSiteUrl();
  return buildAuthorUrlFromBase(slug, base);
}

/** Homepage URL: {siteUrl} (no trailing slash) */
export async function buildHomeUrl(): Promise<string> {
  const base = await loadSiteUrl();
  return trimTrailingSlash(base);
}

/** Sitemap URL: {siteUrl}/sitemap.xml */
export async function buildSitemapUrl(): Promise<string> {
  const base = await loadSiteUrl();
  return `${trimTrailingSlash(base)}${PATHS.sitemap}`;
}

/** Image sitemap URL: {siteUrl}/image-sitemap.xml */
export async function buildImageSitemapUrl(): Promise<string> {
  const base = await loadSiteUrl();
  return `${trimTrailingSlash(base)}${PATHS.imageSitemap}`;
}

/** Robots.txt URL: {siteUrl}/robots.txt */
export async function buildRobotsUrl(): Promise<string> {
  const base = await loadSiteUrl();
  return `${trimTrailingSlash(base)}${PATHS.robots}`;
}

/**
 * Generic absolute URL builder for arbitrary paths.
 * Use ONLY when no specific entity builder fits (e.g. /story, /about, /legal/*).
 */
export async function buildAbsoluteUrl(path: string): Promise<string> {
  const base = await loadSiteUrl();
  return buildAbsoluteUrlFromBase(path, base);
}

// ─────────────────────────────────────────────────────────────────
// Sync builders — use when caller already has baseUrl loaded
// (avoids extra DB hit in tight loops or batched operations)
// ─────────────────────────────────────────────────────────────────

export function buildArticleUrlFromBase(slug: string, baseUrl: string): string {
  return `${trimTrailingSlash(baseUrl)}${PATHS.articles}/${slug}`;
}

export function buildClientUrlFromBase(slug: string, baseUrl: string): string {
  return `${trimTrailingSlash(baseUrl)}${PATHS.clients}/${slug}`;
}

export function buildCategoryUrlFromBase(slug: string, baseUrl: string): string {
  return `${trimTrailingSlash(baseUrl)}${PATHS.categories}/${slug}`;
}

export function buildTagUrlFromBase(slug: string, baseUrl: string): string {
  return `${trimTrailingSlash(baseUrl)}${PATHS.tags}/${slug}`;
}

export function buildIndustryUrlFromBase(slug: string, baseUrl: string): string {
  return `${trimTrailingSlash(baseUrl)}${PATHS.industries}/${slug}`;
}

export function buildAuthorUrlFromBase(slug: string, baseUrl: string): string {
  return `${trimTrailingSlash(baseUrl)}${PATHS.authors}/${slug}`;
}

export function buildHomeUrlFromBase(baseUrl: string): string {
  return trimTrailingSlash(baseUrl);
}

export function buildSitemapUrlFromBase(baseUrl: string): string {
  return `${trimTrailingSlash(baseUrl)}${PATHS.sitemap}`;
}

export function buildImageSitemapUrlFromBase(baseUrl: string): string {
  return `${trimTrailingSlash(baseUrl)}${PATHS.imageSitemap}`;
}

export function buildRobotsUrlFromBase(baseUrl: string): string {
  return `${trimTrailingSlash(baseUrl)}${PATHS.robots}`;
}

export function buildAbsoluteUrlFromBase(path: string, baseUrl: string): string {
  return `${trimTrailingSlash(baseUrl)}${normalizePath(path)}`;
}
