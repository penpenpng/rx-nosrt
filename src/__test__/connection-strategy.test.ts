import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createMockRelay, type MockRelay } from "vitest-nostr";

import { createRxForwardReq, createRxNostr, RxNostr } from "../index.js";
import { disposeMockRelay, faker, stateWillBe } from "./helper.js";

describe("keep-lazy strategy", () => {
  const DEFAULT_RELAY = "ws://localhost:1234";
  const ANOTHER_RELAY = "ws://localhost:1235";
  let rxNostr: RxNostr;
  let defaultRelay: MockRelay;
  let anotherRelay: MockRelay;

  beforeEach(async () => {
    defaultRelay = createMockRelay(DEFAULT_RELAY);
    anotherRelay = createMockRelay(ANOTHER_RELAY);

    rxNostr = createRxNostr({
      connectionStrategy: "lazy-keep",
      skipFetchNip11: true,
      skipVerify: true,
    });
    await rxNostr.setDefaultRelays([DEFAULT_RELAY]);
  });

  afterEach(() => {
    rxNostr.dispose();
    disposeMockRelay(defaultRelay);
    disposeMockRelay(anotherRelay);
  });

  test("[forward] ConnectionState of default relays doesn't get dormant when all default subscriptions end.", async () => {
    const req = createRxForwardReq("sub");
    const sub = rxNostr.use(req).subscribe();

    req.emit(faker.filter());
    await defaultRelay.connected;
    await expect(defaultRelay).toReceiveREQ("sub:0");

    sub.unsubscribe();
    await expect(defaultRelay).toReceiveCLOSE("sub:0");

    expect(rxNostr.getRelayStatus(DEFAULT_RELAY)?.connection).toBe("connected");
  });

  test("[forward] ConnectionState of temporary relays gets dormant when all temporary subscriptions end.", async () => {
    const req = createRxForwardReq("sub");
    const sub = rxNostr.use(req, { relays: [ANOTHER_RELAY] }).subscribe();

    req.emit(faker.filter());
    await anotherRelay.connected;
    await expect(anotherRelay).toReceiveREQ("sub:0");

    sub.unsubscribe();
    await expect(anotherRelay).toReceiveCLOSE("sub:0");

    await expect(stateWillBe(rxNostr, ANOTHER_RELAY, "dormant")).resolves.toBe(
      true
    );
  });
});

describe("aggressive strategy", () => {
  const DEFAULT_RELAY = "ws://localhost:1234";
  const ANOTHER_RELAY = "ws://localhost:1235";
  let rxNostr: RxNostr;
  let defaultRelay: MockRelay;
  let anotherRelay: MockRelay;

  beforeEach(async () => {
    defaultRelay = createMockRelay(DEFAULT_RELAY);
    anotherRelay = createMockRelay(ANOTHER_RELAY);

    rxNostr = createRxNostr({
      connectionStrategy: "aggressive",
      skipFetchNip11: true,
      skipVerify: true,
    });
    await rxNostr.setDefaultRelays([DEFAULT_RELAY]);
  });

  afterEach(() => {
    rxNostr.dispose();
    disposeMockRelay(defaultRelay);
    disposeMockRelay(anotherRelay);
  });

  test.only("[forward] Connection establishes immediately", async () => {
    await defaultRelay.connected;
    expect(rxNostr.getRelayStatus(DEFAULT_RELAY)?.connection).toBe("connected");
  });

  test("[forward] Connection get dormant when it gets to non-default", async () => {
    await defaultRelay.connected;

    rxNostr.setDefaultRelays([ANOTHER_RELAY]);
    await anotherRelay.connected;

    expect(rxNostr.getRelayStatus(DEFAULT_RELAY)?.connection).toBe("dormant");
  });

  test("[forward] ConnectionState of default relays doesn't get dormant when all default subscriptions end.", async () => {
    const req = createRxForwardReq("sub");
    const sub = rxNostr.use(req).subscribe();

    await defaultRelay.connected;

    req.emit(faker.filter());
    await expect(defaultRelay).toReceiveREQ("sub:0");

    sub.unsubscribe();
    await expect(defaultRelay).toReceiveCLOSE("sub:0");

    expect(rxNostr.getRelayStatus(DEFAULT_RELAY)?.connection).toBe("connected");
  });

  test("[forward] ConnectionState of temporary relays gets dormant when all temporary subscriptions end.", async () => {
    const req = createRxForwardReq("sub");
    const sub = rxNostr.use(req, { relays: [ANOTHER_RELAY] }).subscribe();

    await anotherRelay.connected;

    req.emit(faker.filter());
    await expect(anotherRelay).toReceiveREQ("sub:0");

    sub.unsubscribe();
    await expect(anotherRelay).toReceiveCLOSE("sub:0");

    await expect(stateWillBe(rxNostr, ANOTHER_RELAY, "dormant")).resolves.toBe(
      true
    );
  });
});
