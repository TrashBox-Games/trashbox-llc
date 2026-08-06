import { describe, expect, it } from "vitest";
import {
  getForceHideSiteHeader,
  setForceHideSiteHeader,
  subscribeForceHideSiteHeader,
} from "./site-header-visibility";

describe("site-header-visibility", () => {
  it("notifies subscribers when force-hide changes", () => {
    setForceHideSiteHeader(false);
    const seen: boolean[] = [];
    const unsubscribe = subscribeForceHideSiteHeader(() => {
      seen.push(getForceHideSiteHeader());
    });

    setForceHideSiteHeader(true);
    setForceHideSiteHeader(true);
    setForceHideSiteHeader(false);
    unsubscribe();
    setForceHideSiteHeader(true);

    expect(seen).toEqual([true, false]);
    setForceHideSiteHeader(false);
  });
});
