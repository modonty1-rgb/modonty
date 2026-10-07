import { request } from './http';

export type DeviceRegisterBody = {
  expoPushToken: string;
  platform: 'ios' | 'android';
  deviceId: string;
  deviceName?: string;
  appVersion?: string;
};

/** N3 — `POST /api/mobile/v1/devices/register` (Bearer). */
export const pushApi = {
  register: (body: DeviceRegisterBody) => request<unknown>('/devices/register', { method: 'POST', auth: 'required', body }),
};
