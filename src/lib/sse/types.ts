// ──────────────────────────────────────────────
// SSE Event Types — 360 Flatmates real-time events
// ──────────────────────────────────────────────

/** All possible SSE event type strings sent by the backend */
export type SSEEventType =
  | "notification"
  | "message"
  | "visit_update"
  | "swipe"
  | "property_update"
  | "profile_update"
  | "system"
  | "ping"
  | "new_match"
  | "new_message"
  | "conversation_updated"
  | "listing_status_changed";

/** Connection lifecycle states for the SSE manager */
export enum SSEConnectionState {
  Connecting = "connecting",
  Connected = "connected",
  Disconnected = "disconnected",
  Reconnecting = "reconnecting",
}

// ── Per-event data payloads ──────────────────

export interface SSENotificationData {
  id: string;
  type: string;
  title: string;
  description?: string;
  created_at?: string;
}

export interface SSEMessageData {
  conversation_id: number;
  message_id: number;
  sender_id: number;
  body?: string;
  message_type?: string;
  created_at?: string;
}

export interface SSEVisitData {
  visit_id: number;
  property_id: number;
  status: string;
  scheduled_date?: string;
}

export interface SSESwipeData {
  target_user_id: number;
  action: string;
  target_type: string;
  did_match?: boolean;
  conversation_id?: number;
}

export interface SSEPropertyData {
  property_id: number;
  change_type: string;
}

export interface SSEProfileData {
  field?: string;
  updated_at?: string;
}

export interface SSESystemData {
  code: string;
  message: string;
}

export interface SSEPingData {
  timestamp?: number;
}

export interface SSENewMatchData {
  match_id: number;
  conversation_id?: number;
}

export interface SSENewMessageData {
  conversation_id: number;
  message_id: number;
  sender_id: number;
}

export interface SSEConversationUpdatedData {
  conversation_id: number;
}

export interface SSEListingStatusChangedData {
  property_id: number;
  change_type: string;
}

// ── Typed event interfaces ───────────────────

export interface SSENotificationEvent {
  type: "notification";
  data: SSENotificationData;
}

export interface SSEMessageEvent {
  type: "message";
  data: SSEMessageData;
}

export interface SSEVisitEvent {
  type: "visit_update";
  data: SSEVisitData;
}

export interface SSESwipeEvent {
  type: "swipe";
  data: SSESwipeData;
}

export interface SSEPropertyEvent {
  type: "property_update";
  data: SSEPropertyData;
}

export interface SSEProfileEvent {
  type: "profile_update";
  data: SSEProfileData;
}

export interface SSESystemEvent {
  type: "system";
  data: SSESystemData;
}

export interface SSEPingEvent {
  type: "ping";
  data: SSEPingData;
}

export interface SSENewMatchEvent {
  type: "new_match";
  data: SSENewMatchData;
}

export interface SSENewMessageEvent {
  type: "new_message";
  data: SSENewMessageData;
}

export interface SSEConversationUpdatedEvent {
  type: "conversation_updated";
  data: SSEConversationUpdatedData;
}

export interface SSEListingStatusChangedEvent {
  type: "listing_status_changed";
  data: SSEListingStatusChangedData;
}

/** Discriminated union of all SSE event types */
export type SSEEvent =
  | SSENotificationEvent
  | SSEMessageEvent
  | SSEVisitEvent
  | SSESwipeEvent
  | SSEPropertyEvent
  | SSEProfileEvent
  | SSESystemEvent
  | SSEPingEvent
  | SSENewMatchEvent
  | SSENewMessageEvent
  | SSEConversationUpdatedEvent
  | SSEListingStatusChangedEvent;
