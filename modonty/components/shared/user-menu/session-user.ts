import type { Session } from "next-auth";

export type SessionUser = NonNullable<Session["user"]>;
