import type { CursorPage } from "./common.types";

/** Request body for creating a Razorpay order for a booking. */
export interface RazorpayOrderRequest {
  booking_id: number;
}

/** Response payload returned by the backend when a Razorpay order is created. */
export interface RazorpayOrderResponse {
  order_id: string;
  /** Amount in INR (rupees, client-facing). Convert to paise for Razorpay SDK. */
  amount: number;
  currency: string;
  key_id: string | null;
  booking_id: number;
  notes: Record<string, string>;
}

/** Request body for verifying a completed Razorpay payment. */
export interface RazorpayVerifyRequest {
  booking_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/** Persisted payment method record owned by the current user. */
export interface PaymentMethod {
  id: number;
  /** Method type: card, upi, or netbanking. */
  method_type: string;
  /** Brand label (e.g. "Visa", "Mastercard", "UPI"). */
  brand: string | null;
  /** Last four digits, when applicable (cards). */
  last4: string | null;
  /** Optional nickname supplied by the user. */
  nickname: string | null;
  /** True when the method is the default for new charges. */
  is_default: boolean;
  created_at: string;
}

/** Payload for creating a new payment method. */
export interface PaymentMethodCreate {
  /** Method type: card, upi, or netbanking. */
  method_type: string;
  brand?: string | null;
  last4?: string | null;
  /** Razorpay token id from the checkout flow. */
  razorpay_token?: string | null;
  /** Razorpay payment id from a successful charge. */
  razorpay_payment_id?: string | null;
  is_default?: boolean;
  nickname?: string | null;
}

/** Payload for updating an existing payment method (PATCH-friendly). */
export interface PaymentMethodUpdate {
  nickname?: string | null;
  is_default?: boolean | null;
}

/** Envelope of saved payment methods returned by `GET /payments/methods`. */
export type PaymentMethodList = CursorPage<PaymentMethod>;

/** Re-export alias used in code paths that expect a fully-qualified name. */
export type PaymentMethodCursorPage = PaymentMethodList;

/** A generic API acknowledgement envelope (matches the backend `MessageResponse`). */
export interface MessageResponse {
  message: string;
}
