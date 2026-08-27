/**
 * Re-export so admin code keeps a short local import path. The class itself lives in
 * `shared/` because the shared JSON-LD builders throw it too — see the comment there.
 */
export { SiteUrlMissingError } from "@modonty/shared/lib/seo/site-url-error";
