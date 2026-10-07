"use client";

/**
 * **نغمةُ الجرس** (خالد ٢٣ سبتمبر ٢٠٢٦: «لمّا التاسك بيروح المفروض يكون فيه تون»).
 *
 * ── تُولَّد لا تُحمَّل ──
 * نغمتان قصيرتان من Web Audio (`OscillatorNode`) — لا ملفَّ صوتٍ يُطلب من الشبكة ولا
 * يُخزَّن في الحزمة، ولا رابطَ يموت.
 *
 * ── والمتصفّحُ يشترط لمسةً أولى ──
 * لا يسمح أيُّ متصفّحٍ بالصوت قبل أن يتفاعل المستخدمُ مع الصفحة (autoplay policy)، و
 * `AudioContext` المُنشأ قبلها يولد `suspended`. فيُهيّأ عند أوّل ضغطةٍ أو زرّ
 * (`primeChime`)، وبعدها تعمل النغمةُ مع كلّ إشعار. وقبلها تُتجاهل بصمت — الإشعارُ نفسُه
 * يصل في الجرس كما كان.
 */

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

/** تُنادى من أوّل تفاعلٍ للمستخدم — تفتح الصوتَ لما بعده. */
export function primeChime(): void {
  const c = context();
  if (c && c.state === "suspended") void c.resume().catch(() => {});
}

function tone(c: AudioContext, freq: number, start: number, length: number): void {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, start);
  // صعودٌ وهبوطٌ سريعان: بلا نقرةٍ في أوّلها ولا ذيلٍ مزعج في آخرها.
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + length + 0.02);
}

/** نغمتان صاعدتان (A5 ثمّ E6) — تُسمع وتُفهم «وصل شيء» بلا أن تُفزع. */
export function playChime(): void {
  const c = context();
  if (!c || c.state !== "running") return;
  const t = c.currentTime;
  tone(c, 880, t, 0.16);
  tone(c, 1318.5, t + 0.13, 0.22);
}
