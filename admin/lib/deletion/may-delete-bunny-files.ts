/**
 * مسح الملفّات من بني يجري على الإنتاج وحده (١٦ أكتوبر ٢٠٢٦). قاعدة dev نسخةٌ من الإنتاج
 * وروابط ملفّاتها هي ملفّات الإنتاج نفسها، والتخزين واحد (`BUNNY_STORAGE_ZONE_NAME=modonty-clients`
 * و`BUNNY_STREAM_LIBRARY_ID` في `.env.shared`) — فحذفٌ تجريبي محلي كان سيمسح فيديو عميل حقيقي.
 */
export function mayDeleteBunnyFiles(): boolean {
  return process.env.NODE_ENV === "production";
}
