import "server-only";

const SINGLETON_KEY = "global" as const;

export const SETTINGS_SINGLETON_WHERE = { singletonKey: SINGLETON_KEY };
