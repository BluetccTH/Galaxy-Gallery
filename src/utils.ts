/// <reference types="vite/client" />

export function getAssetUrl(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // Remove leading slash if present
  const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
  const base = import.meta.env.BASE_URL || "/";
  // Ensure correct formatting of base and asset URL
  const baseSlash = base.endsWith("/") ? base : `${base}/`;
  return `${baseSlash}${cleanUrl}`;
}
