// نسخة React واحدة في الحزمة.
//
// `@expo-google-fonts/tajawal` يستورد `react` بلا أن يعلنه في dependencies ولا peerDependencies،
// فيحلّه pnpm من المجلّد المرفوع `node_modules/.pnpm/node_modules/react` = 19.2.8 (تطبيقات الويب)،
// بينما التطبيق وreact-native على 19.1.0 — نسختان في حزمة واحدة = «Invalid hook call» عند الإقلاع.
// الحلّ: كل طلب لـ`react` أو `react/*` يُحلّ من مجلّد هذا التطبيق، أيّاً كان الملف الطالب.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const appRoot = path.join(__dirname, 'node_modules');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react' || moduleName.startsWith('react/')) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(appRoot, '_app_root_.js') },
      moduleName,
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

// بناء الإصدار المحلي على ويندوز: إضافة react-native تمرّر ملف الدخول نسبياً (`index.js`) وإكسبو
// يحلّه من جذر المستودع، فيُشغَّل بـ EXPO_NO_METRO_WORKSPACE_ROOT=1 (توثيق Expo CLI). عندها لا يضيف
// إكسبو جذر المستودع للمراقبة، فلا تُرى حزم pnpm المشتركة — فيُضاف هنا. لا أثر له في التطوير ولا في EAS.
if (process.env.EXPO_NO_METRO_WORKSPACE_ROOT) {
  config.watchFolders = [...new Set([...(config.watchFolders ?? []), path.resolve(__dirname, '..')])];
}

module.exports = config;
