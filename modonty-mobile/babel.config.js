// NativeWind v4 (توثيق nativewind.dev — Expo): jsxImportSource + preset. babel-preset-expo (SDK 54)
// يضيف إضافة react-native-worklets لـReanimated 4 تلقائياً.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
