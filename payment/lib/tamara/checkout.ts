import "server-only";
import { tamaraRequest } from "./client";

/**
 * Creating the session a customer is redirected into.
 *
 * Tamara's model is a redirect, not an embedded form: we describe the order, it answers
 * with a `checkout_url`, and the customer finishes on Tamara's own pages. Nothing here
 * ever touches a card number, which is the whole reason this file is short.
 */

export interface TamaraMoney {
  amount: number;
  currency: string;
}

export interface CreateCheckoutSessionPayload {
  order_reference_id: string;
  total_amount: TamaraMoney;
  description: string;
  country_code: string;
  payment_type: "PAY_BY_INSTALMENTS" | "PAY_NOW";
  instalments?: number | null;
  locale?: string;
  items: {
    reference_id: string;
    type: string;
    name: string;
    sku: string;
    quantity: number;
    total_amount: TamaraMoney;
  }[];
  consumer: {
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
  };
  shipping_address: {
    first_name: string;
    last_name: string;
    line1: string;
    city: string;
    country_code: string;
    phone_number?: string;
  };
  tax_amount: TamaraMoney;
  shipping_amount: TamaraMoney;
  merchant_url: {
    success: string;
    failure: string;
    cancel: string;
    notification?: string;
  };
}

export interface CreateCheckoutSessionResponse {
  order_id: string;
  checkout_id: string;
  checkout_url: string;
  status: string;
}

export async function createCheckoutSession(
  payload: CreateCheckoutSessionPayload,
): Promise<CreateCheckoutSessionResponse> {
  return tamaraRequest<CreateCheckoutSessionResponse>("/checkout", {
    method: "POST",
    body: payload,
  });
}

/**
 * What Tamara will and will not accept for a given market, straight from our own account.
 *
 * Read-only, and the only honest source for the limits: the published ranges are the
 * product's, while these are what this merchant is actually enabled for. Egypt answers
 * `400 not_supported_delivery_country` here, which is why the checkout never offers
 * Tamara outside Saudi Arabia.
 */
export interface TamaraPaymentType {
  name: string;
  description: string;
  description_ar: string;
  min_limit: TamaraMoney;
  max_limit: TamaraMoney;
  supported_instalments?: { instalments: number }[];
}

/**
 * Asks Tamara whether it wants this customer at all, before we send them anywhere.
 *
 * Tamara holds decline records per person. Without this call a customer they have already
 * refused fills in our form, is handed to their pages, and is turned away there — and
 * usually leaves rather than coming back to pay by card. The decision is entirely
 * Tamara's; this only asks.
 *
 * Their documented placement is exact: "before creating the order to determine whether
 * Tamara should be available as a payment option."
 *
 * The 200ms timeout and the fail-open are theirs too: "If Tamara API does not respond
 * within 200ms, default to showing Tamara as normal — this prevents any eligibility check
 * latency from impacting the checkout experience." So every failure here — timeout,
 * network, a bad response — answers `true`. A slow gateway must never cost us a customer
 * Tamara would have accepted.
 */
export async function isCustomerEligible(input: {
  amount: number;
  currency: string;
  email: string;
  phoneNumber?: string;
}): Promise<boolean> {
  try {
    const res = await tamaraRequest<{ is_eligible?: boolean }>("/pre-checkout/v1/eligibility", {
      method: "POST",
      timeoutMs: 200,
      body: {
        order: { amount: input.amount, currency: input.currency },
        customer: { email: input.email, ...(input.phoneNumber ? { phone_number: input.phoneNumber } : {}) },
      },
    });
    return res.is_eligible !== false;
  } catch {
    return true;
  }
}

export async function getPaymentTypes(
  countryCode: string,
  currency: string,
): Promise<TamaraPaymentType[]> {
  return tamaraRequest<TamaraPaymentType[]>(
    `/checkout/payment-types?country=${countryCode}&currency=${currency}`,
    { method: "GET" },
  );
}

/**
 * A subscription has nothing to ship, but Tamara requires an address.
 *
 * Rather than invent a street, we send the buyer's own name with the city Tamara needs to
 * price the order and nothing more. `shipping_amount` is zero for the same reason: there
 * is no delivery, and a fabricated fee would be a lie on the customer's payment plan.
 */
export function digitalShippingAddress(
  firstName: string,
  lastName: string,
  countryCode: string,
  phone: string,
) {
  return {
    first_name: firstName,
    last_name: lastName,
    line1: "خدمة رقمية — لا يوجد شحن",
    city: countryCode === "SA" ? "الرياض" : "-",
    country_code: countryCode,
    phone_number: phone,
  };
}

/**
 * Tamara wants a first and last name; our form asks for one name, as Arabic forms do.
 *
 * Splitting on the first space is the least-wrong answer: it keeps the full name intact
 * across the two fields, and a single-word name still passes because `last_name` falls
 * back to the same word rather than to an empty string Tamara would reject.
 */
export function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] ?? fullName;
  const last = parts.length > 1 ? parts.slice(1).join(" ") : first;
  return { first, last };
}
