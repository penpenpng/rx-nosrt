import Nostr from "nostr-typedef";

import { fetchRelayInfo } from "./nostr/nip11.js";
import { UrlMap } from "./utils.js";

/**
 * This is used by rx-nostr to access NIP-11 relay information.
 * rx-nostr works adaptively to the [`limitation`](https://github.com/nostr-protocol/nips/blob/master/11.md#server-limitations) defined by NIP-11.
 *
 * If you `set()` or `setDefault()` NIP-11 relay information in advance,
 * rx-nostr will use them instead of fetching even if `skipFetchNip11` is enabled.
 */
export class Nip11Registry {
  private static cache = new UrlMap<Nostr.Nip11.RelayInfo>();
  private static default: Nostr.Nip11.RelayInfo = {};

  static async getValue<T>(
    url: string,
    getter: (data: Nostr.Nip11.RelayInfo) => T,
    options?: {
      skipFetch?: boolean;
      skipCahce?: boolean;
    }
  ): Promise<T> {
    if (!options?.skipCahce) {
      const v = getter(this.get(url) ?? {});
      if (v) {
        return v;
      }
    }
    if (!options?.skipFetch) {
      const v = getter((await this.fetch(url)) ?? {});
      if (v) {
        return v;
      }
    }

    return getter(this.default);
  }

  /**
   * Return cached or `set()`'ed NIP-11 information.
   */
  static get(url: string): Nostr.Nip11.RelayInfo | undefined {
    return this.cache.get(url);
  }

  /**
   * Cache fetched information then return it.
   */
  static async fetch(url: string) {
    const promise = fetchRelayInfo(url);
    promise.then((v) => {
      this.cache.set(url, v);
    });

    return promise;
  }

  /**
   * Return cached or `set()`'ed NIP-11 information,
   * or cache fetched information then return it.
   */
  static async getOrFetch(url: string): Promise<Nostr.Nip11.RelayInfo> {
    return this.cache.get(url) ?? this.fetch(url);
  }

  /**
   * Set NIP-11 information manually for given relay URL.
   */
  static set(url: string, nip11: Nostr.Nip11.RelayInfo) {
    this.cache.set(url, nip11);
  }

  /**
   * Get NIP-11 information for fallback.
   */
  static getDefault(): Nostr.Nip11.RelayInfo {
    return this.default;
  }

  /**
   * Set NIP-11 information for fallback.
   */
  static setDefault(nip11: Nostr.Nip11.RelayInfo) {
    this.default = nip11;
  }

  /**
   * Forget cached NIP-11 information for given relay URL.
   */
  static forget(url: string) {
    this.cache.delete(url);
  }

  /**
   * Forget all cached NIP-11 information.
   *
   * This doesn't erase `setDefault()`'ed value.
   * If you want it, you can `setDefault({})` instead.
   */
  static forgetAll() {
    this.cache.clear();
  }
}
