/**
 * The wheel's slices — one list read by the page (to draw them) and the API (to pick one).
 *
 * The order IS the contract: the API answers with an index into this array and the wheel
 * spins to that index. Reordering here moves both sides together; a second copy would let
 * the wheel land on one slice while the server recorded another.
 */
export const LUCKY_WHEEL_CAMPAIGN = "TECHNE_2026";

/**
 * كم لفّةً للرقم الواحد في الحملة (خالد ٢٣ سبتمبر ٢٠٢٦: «ممكن اديه اكثر من فرصه»).
 * سقفٌ لا لفّةٌ واحدة: بلا سقفٍ يلفّ الزائرُ حتى تخرج «خصم 20%». والرقمُ هنا وحده —
 * السيرفرُ يعدّ عليه، والصفحةُ تعرضه.
 */
export const SPINS_PER_PHONE = 3;

export const LUCKY_WHEEL_PRIZES = [
  { code: "TECHNE5", label: "خصم 5%", backgroundColor: "#183451", labelColor: "#ffffff" },
  { code: "TECHNE10", label: "خصم 10%", backgroundColor: "#00d8d8", labelColor: "#ffffff" },
  { code: "TECHNE15", label: "خصم 15%", backgroundColor: "#3030ff", labelColor: "#ffffff" },
  { code: "MODONTY35PLUS30", label: "هدية مدونتي", backgroundColor: "#ffcc66", labelColor: "#0e065a" },
  { code: "TECHNE20", label: "خصم 20%", backgroundColor: "#7838c7", labelColor: "#ffffff" },
  { code: null, label: "حظ أوفر", backgroundColor: "#244b6d", labelColor: "#ffffff" },
] as const;

/** Index of «هدية مدونتي» — it gets the bigger celebration and its own offer copy. */
export const MODONTY_GIFT_INDEX = 3;
