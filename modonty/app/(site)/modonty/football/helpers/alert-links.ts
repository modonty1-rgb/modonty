const back = encodeURIComponent("/modonty/football");

/** Registration with the football box shown, landing back on this page. */
export const REGISTER_FOR_ALERT = `/users/register?alert=football&callbackUrl=${back}`;

/** Login, landing back on this page — where «نبّهني» waits if they have not agreed yet. */
export const LOGIN_FOR_ALERT = `/users/login?callbackUrl=${back}`;
