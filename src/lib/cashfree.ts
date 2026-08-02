/**
 * Cashfree Payment Gateway — server-side wrapper.
 * Uses cashfree-pg v6 (class-based, not static API).
 */
import { Cashfree, CFEnvironment } from "cashfree-pg";

function createClient() {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const env = process.env.CASHFREE_ENV ?? "sandbox";

  if (!clientId || !clientSecret) {
    throw new Error(
      "CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET must be set in environment"
    );
  }

  return new Cashfree(
    env === "production" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    clientId,
    clientSecret
  );
}

export interface CashfreeOrderInput {
  /** Our internal order ID, e.g. VMX-ABCDEF */
  orderId: string;
  /** Amount in INR (exact, with paise) */
  amount: number;
  /** Attendee full name */
  customerName: string;
  /** 10-digit mobile */
  customerPhone: string;
  /** Email */
  customerEmail: string;
  /** Return URL after payment — browser is redirected here */
  returnUrl: string;
}

export interface CashfreeOrderResult {
  /** Cashfree's internal order id (cf_order_id) */
  cfOrderId: string;
  /** Passed to frontend to open Cashfree checkout */
  paymentSessionId: string;
}

/** Create an order on Cashfree and return the payment_session_id. */
export async function createCashfreeOrder(
  input: CashfreeOrderInput
): Promise<CashfreeOrderResult> {
  const client = createClient();

  const request = {
    order_id: input.orderId,
    order_amount: parseFloat(input.amount.toFixed(2)),
    order_currency: "INR",
    customer_details: {
      customer_id: input.orderId,
      customer_name: input.customerName,
      customer_phone: input.customerPhone.replace(/\D/g, "").slice(-10),
      customer_email: input.customerEmail,
    },
    order_meta: {
      return_url: input.returnUrl,
    },
  };

  const response = await client.PGCreateOrder(request);
  const data = response.data;

  if (!data.payment_session_id || !data.cf_order_id) {
    throw new Error("Cashfree did not return a valid payment session");
  }

  return {
    cfOrderId: String(data.cf_order_id),
    paymentSessionId: data.payment_session_id,
  };
}

/**
 * Verify an incoming Cashfree webhook signature.
 * rawBody must be the raw request body string (not parsed JSON).
 * Uses the instance method PGVerifyWebhookSignature.
 */
export function verifyCashfreeWebhook(
  signature: string,
  rawBody: string,
  timestamp: string
): boolean {
  try {
    const client = createClient();
    // PGVerifyWebhookSignature throws on failure
    client.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    return true;
  } catch {
    return false;
  }
}

/** Whether Cashfree gateway is enabled (set CASHFREE_ENABLED=true in env). */
export function isCashfreeEnabled(): boolean {
  return process.env.CASHFREE_ENABLED === "true";
}
