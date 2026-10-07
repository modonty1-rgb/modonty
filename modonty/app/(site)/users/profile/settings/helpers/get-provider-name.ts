export const getProviderName = (provider: string) => {
  const names: Record<string, string> = {
    google: "Google",
    facebook: "Facebook",
  };
  return names[provider] || provider;
};
