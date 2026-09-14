import "server-only";
import { tamaraRequest } from "./client";
import type { TamaraMoney } from "./checkout";

/**
 * The order lifecycle after the customer leaves Tamara's pages.
 *
 * Nothing here is triggered by a browser. Every function is called from the webhook, and
 * the order they run in is the one Tamara defines: approved → authorise → capture. Skip
 * the last step and the customer has a payment plan while we have no money — Tamara does
 * auto-capture after 21 days, but a subscription that starts today cannot wait three
 * weeks to know whether it was paid.
 */

export interface TamaraOrderDetails {
  order_id: string;
  order_reference_id: string;
  status: string;
  total_amount: TamaraMoney;
  captured_amount?: TamaraMoney;
}

/**
 * The truth about an order, asked of Tamara rather than read from a webhook body.
 *
 * The signature on a notification proves who sent it; this proves what is actually true
 * now. They are different questions, and the money only follows the second one.
 */
export async function getOrder(orderId: string): Promise<TamaraOrderDetails> {
  return tamaraRequest<TamaraOrderDetails>(`/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
  });
}

export interface TamaraAuthoriseResponse {
  order_id: string;
  status: string;
  payment_type: string;
  auto_captured: boolean;
  capture_id?: string;
}

/** Called on the `order_approved` event; moves approved → authorised. Takes no body. */
export async function authoriseOrder(orderId: string): Promise<TamaraAuthoriseResponse> {
  return tamaraRequest<TamaraAuthoriseResponse>(
    `/orders/${encodeURIComponent(orderId)}/authorise`,
    { method: "POST" },
  );
}

/**
 * There is deliberately no `cancelOrder` or `refundOrder` here.
 *
 * Both exist in Tamara's API (`POST /orders/{id}/cancel` while authorised, and
 * `POST /payments/simplified-refund/{id}` once captured), and both are already available
 * as buttons in the Tamara Partners Portal. Refunds are issued from there.
 *
 * Wrapping them in code nothing calls would leave two functions that look like a working
 * refund path and are not — the same trap as a webhook handler with no registered URL.
 * If refunds ever need to start from our own admin, the endpoints above are the whole
 * job; until then the portal is the honest answer.
 */

export interface TamaraCaptureResponse {
  capture_id: string;
  order_id: string;
  status: string;
  captured_amount: TamaraMoney;
}

/**
 * Takes the money.
 *
 * `shipping_info` is required by the endpoint even though a subscription ships nothing,
 * so it carries the truth instead of a fiction: the moment access begins, named as what
 * it is. An invented courier and tracking number would end up on a real customer's
 * Tamara invoice.
 */
export async function captureOrder(
  orderId: string,
  total: TamaraMoney,
  capturedAt: Date,
): Promise<TamaraCaptureResponse> {
  return tamaraRequest<TamaraCaptureResponse>("/payments/capture", {
    method: "POST",
    body: {
      order_id: orderId,
      total_amount: total,
      shipping_info: {
        shipped_at: capturedAt.toISOString(),
        shipping_company: "خدمة رقمية — تفعيل فوري",
      },
    },
  });
}
