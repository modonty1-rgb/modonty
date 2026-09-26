export interface Reciter {
  /** معرّفه عند المصدر — يبقى للمراجعة، ولا يُستعمل في الرابط. */
  id: number;
  name: string;
  /** جذر ملفات مصحفه؛ الرابط = الخادم + رقم السورة بثلاث خانات + `.mp3` */
  server: string;
}

/** الرواية الوحيدة المعروضة — أشهر الروايات في السعودية ومصر. */
export const RIWAYA = "حفص عن عاصم";

/** اسم المصدر ورابطه، معروضان على الصفحة لا مدفونين في الكود. */
export const SOURCE = { name: "mp3quran.net", url: "https://mp3quran.net" } as const;

/**
 * Twenty reciters, frozen into the code — every one measured, none taken on trust.
 *
 * mp3quran.net lists 241 reciters; 202 have a complete mushaf, and 154 of those are in Hafs 'an
 * 'Asim. All 154 were probed on 2026-08-20 and all 154 answered — but a menu of 154 names paralyses
 * the choice, and most of those names nobody is looking for. These twenty are the ones a listener
 * in Saudi Arabia or Egypt actually asks for by name.
 *
 * Frozen rather than fetched, for the same reason as the surahs: a page about the Qur'an must not
 * go blank because someone else's API is down. The only thing that comes from their servers is the
 * recitation itself, at the moment it is pressed.
 *
 * Every entry is a COMPLETE mushaf — all 114 surahs — in the one declared riwaya above. Nobody is
 * added here until his first surah has been requested and has answered.
 *
 * The previous source (islamic.network) was dropped: it never declared a riwaya, and nine of every
 * ten reciters it advertised returned 403.
 */
export const RECITERS: Reciter[] = [
  { id: 123, name: "مشاري العفاسي", server: "https://server8.mp3quran.net/afs/" },
  { id: 102, name: "ماهر المعيقلي", server: "https://server12.mp3quran.net/maher/" },
  { id: 54, name: "عبدالرحمن السديس", server: "https://server11.mp3quran.net/sds/" },
  { id: 31, name: "سعود الشريم", server: "https://server7.mp3quran.net/shur/" },
  { id: 118, name: "محمود خليل الحصري", server: "https://server13.mp3quran.net/husr/" },
  { id: 112, name: "محمد صديق المنشاوي", server: "https://server10.mp3quran.net/minsh/" },
  { id: 51, name: "عبدالباسط عبدالصمد", server: "https://server7.mp3quran.net/basit/" },
  { id: 4, name: "أبو بكر الشاطري", server: "https://server11.mp3quran.net/shatri/" },
  { id: 30, name: "سعد الغامدي", server: "https://server7.mp3quran.net/s_gmd/" },
  { id: 5, name: "أحمد بن علي العجمي", server: "https://server10.mp3quran.net/ajm/" },
  { id: 74, name: "علي بن عبدالرحمن الحذيفي", server: "https://server9.mp3quran.net/hthfi/" },
  { id: 92, name: "ياسر الدوسري", server: "https://server11.mp3quran.net/yasser/" },
  { id: 62, name: "عبدالله عواد الجهني", server: "https://server13.mp3quran.net/jhn/" },
  { id: 86, name: "ناصر القطامي", server: "https://server6.mp3quran.net/qtm/" },
  { id: 20, name: "خالد الجليل", server: "https://server10.mp3quran.net/jleel/" },
  { id: 43, name: "صلاح البدير", server: "https://server6.mp3quran.net/s_bud/" },
  { id: 60, name: "عبدالله بصفر", server: "https://server6.mp3quran.net/bsfr/" },
  { id: 59, name: "عبدالله المطرود", server: "https://server8.mp3quran.net/mtrod/" },
  { id: 111, name: "محمد جبريل", server: "https://server8.mp3quran.net/jbrl/" },
  { id: 109, name: "محمد أيوب", server: "https://server16.mp3quran.net/ayyoub2/Rewayat-Hafs-A-n-Assem/" },
];

export const DEFAULT_RECITER = RECITERS[0].id;

/** «001» … «114» — the file naming every mushaf on this source uses. */
export const surahFile = (server: string, n: number) => `${server}${String(n).padStart(3, "0")}.mp3`;
