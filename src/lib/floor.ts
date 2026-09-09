export const FLOOR_LOGIN = "https://sable-floor.vercel.app/login";

/** Preview stays on the shop /login (iframe). Live opens the floor itself. */
export function staffLoginHref() {
  return import.meta.env.PROD ? FLOOR_LOGIN : "/login";
}
