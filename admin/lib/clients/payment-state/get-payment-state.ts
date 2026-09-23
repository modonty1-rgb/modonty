import { getPaymentStates, NO_PAYMENT_STATE, type ClientPaymentState } from "./get-payment-states";

/** عميلٌ واحد — غلافٌ على الدفعة، فلا يوجد منطقان يفترقان. */
export async function getPaymentState(clientId: string): Promise<ClientPaymentState> {
  const map = await getPaymentStates([clientId]);
  return map.get(clientId) ?? NO_PAYMENT_STATE;
}
