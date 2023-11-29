import Nostr from "nostr-typedef";

// Packet is data treated by rx-nostr Observables.

/**
 * Packets flowing through the Observable stream sent from RxReq towards RxNostr.
 * When null is sent, the subscription is suspended.
 */
export type ReqPacket = LazyFilter[] | null;

/**
 * Filter object, but allows parameters since/until to be function.
 * If so, values will be evaluated just before submission.
 */
export type LazyFilter = Omit<Nostr.Filter, "since" | "until"> & {
  since?: number | (() => number);
  until?: number | (() => number);
};

export type LazyREQ = ["REQ", string, ...LazyFilter[]];

/**
 * Packets from websocket that represents an EVENT.
 */
export interface EventPacket {
  from: string;
  subId: string;
  event: Nostr.Event;
}

/**
 * Packets from websocket that represents an error.
 */
export interface ErrorPacket {
  from: string;
  reason: unknown;
}

/**
 * Packets from websocket that represents all raw incoming messages.
 */
export interface MessagePacket<
  M extends Nostr.ToClientMessage.Any = Nostr.ToClientMessage.Any
> {
  from: string;
  message: M;
}

/**
 * Packets emitted when WebSocket connection state is changed.
 */
export interface ConnectionStatePacket {
  from: string;
  state: ConnectionState;
}

/**
 * WebSocket connection state.
 *
 * - `initialized`: Initialized.
 * - `connecting`: Attempting to connect (or reconnect for error recovery).
 * - `connected`: Connected.
 * - `closed`: Closed as idling, or desired by user.
 * - `reconnecting`: Reconnecting for error recovery
 * - `error`: Closed because of an unexpected error. You can try to recover by reconnect()
 * - `rejected`: Closed because of closing code 4000. You can try to reconnect, but should not do.
 * - `terminated`: Closed, and no longer available because of dispose()
 */
export type ConnectionState =
  | "initialized"
  | "connecting"
  | "connected"
  | "closed"
  | "waiting-for-reconnection"
  | "reconnecting"
  | "error"
  | "rejected"
  | "terminated";

/**
 * Packets represents OK messages associated with an EVENT submission.
 */
export interface OkPacket {
  from: string;
  id: string;
  ok: boolean;
}
