import type { AlertTopicId } from "@/lib/users/alert-topics";

/**
 * Where a sector page sends a visitor for its alert: registration with that topic's box shown, and
 * login — both landing back on the page, where «نبّهني» waits for anyone who has not agreed yet.
 */
export function alertLinks(topic: AlertTopicId, path: string): { register: string; login: string } {
  const back = encodeURIComponent(path);
  return {
    register: `/users/register?alert=${topic}&callbackUrl=${back}`,
    login: `/users/login?callbackUrl=${back}`,
  };
}
