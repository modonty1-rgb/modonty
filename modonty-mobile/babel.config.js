// babel-preset-expo (SDK 54) يضيف إضافة react-native-worklets لـReanimated 4 تلقائياً.
// NativeWind أُزيل (١٠ أكتوبر): jsxImportSource كان يمرّر كل عنصر في التطبيق عبر css-interop لأجل بطاقة واحدة.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
