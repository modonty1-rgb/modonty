import type { ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext) => ({
  ...config,
  extra: {
    ...config.extra,
    mobileApiBaseUrl: process.env.EXPO_PUBLIC_MOBILE_API_BASE_URL,
  },
  plugins: [...(config.plugins ?? []), ['expo-notifications', { icon: './assets/brand/notification-icon.png', color: '#0E065A', defaultChannel: 'default' }]],
});
