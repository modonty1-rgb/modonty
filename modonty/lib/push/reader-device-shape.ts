/** The fields of a `ReaderDevice` the app sees — the push token itself is never echoed back. */
export const READER_DEVICE_SELECT = {
  id: true,
  deviceId: true,
  platform: true,
  deviceName: true,
  appVersion: true,
  enabled: true,
  lastSeenAt: true,
  createdAt: true,
} as const;
