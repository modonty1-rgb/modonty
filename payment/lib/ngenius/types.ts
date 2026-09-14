/**
 * N-Genius API response shapes — a MINIMAL subset of the fields we consume.
 * The real payloads have ~80 fields; we type only what our flow reads to keep
 * this file honest and short. Full shape at
 * https://docs.ksa.ngenius-payments.com/reference/the-order-object-in-full
 */

export type NGeniusPaymentState =
  | "STARTED"
  | "AUTHORISED"
  | "CAPTURED"
  | "PURCHASED"
  | "PARTIALLY_CAPTURED"
  | "CANCELLED"
  | "DECLINED"
  | "FAILED"
  | "EXPIRED";

export type NGeniusAuthResponse = {
  authorizationCode?: string;
  success?: boolean;
  resultCode?: string; // ISO 8583 code, e.g. "00" success, "05" decline
  resultMessage?: string;
  rrn?: string;
};

export type NGeniusPayment = {
  _id?: string;
  reference?: string;
  state: NGeniusPaymentState;
  amount?: { currencyCode: string; value: number };
  orderReference?: string;
  merchantOrderReference?: string;
  authResponse?: NGeniusAuthResponse;
  "3ds"?: { status?: string; acsUrl?: string; acsPaReq?: string; acsMd?: string };
  savedCard?: {
    maskedPan: string;
    expiry: string;
    cardholderName: string;
    scheme: string;
    cardToken: string;
  };
  cancellable?: boolean;
  capturable?: boolean;
  is3dsRequired?: boolean;
};

export type NGeniusOrderResponse = {
  _id: string;                    // "urn:order:{uuid}"
  reference: string;              // N-Genius' internal reference — used in find-order URL
  /**
   * مرجعُ **الطلب** — وهو غير `reference` أعلاه الذي هو مرجع الدفعة.
   *
   * قيس حيّاً على الساندبوكس (١٣ سبتمبر ٢٠٢٦): بحفظ `reference` ردّ المزوّد
   * `404 invalidOrderReference`، فبقي طلبٌ **مدفوع فعلاً** عالقاً على «بانتظار الدفع»
   * ولا الاستعلام ولا الويبهوك يجد ما يسأل عنه. والحقل كان غائباً عن هذا النوع، فكشفه
   * البناء (١٤ سبتمبر): `Property 'orderReference' does not exist`.
   */
  orderReference?: string;
  merchantOrderReference?: string; // echoed back from our request; = CheckoutOrder.id عندنا
  action: "PURCHASE" | "AUTH" | "VERIFY";
  amount: { currencyCode: string; value: number };
  outletId: string;
  createDateTime?: string;
  emailAddress?: string;
  _embedded?: { payment?: NGeniusPayment[] };
  _links?: Record<string, { href: string }>;
};

export type NGeniusHostedSessionPaymentResponse = NGeniusOrderResponse;

export type CreateOrderPayload = {
  action: "PURCHASE" | "AUTH" | "VERIFY";
  amount: { currencyCode: string; value: number }; // value in MINOR units (halalas for SAR)
  merchantOrderReference?: string;                 // idempotency key (max 40 alphanum + hyphens)
  merchantDefinedData?: Record<string, string>;    // up to 100 KV pairs, echoed in webhook
  emailAddress: string;
  merchantAttributes?: {
    redirectUrl?: string;
    cancelUrl?: string;
    skipConfirmationPage?: boolean;
    skip3DS?: boolean;
  };
  billingAddress?: {
    firstName?: string;
    lastName?: string;
  };
};
