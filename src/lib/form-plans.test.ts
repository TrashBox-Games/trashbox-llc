import { describe, expect, it } from "vitest";
import {
  FORM_PLANS,
  normalizePlanTier,
  planDisplayName,
} from "./form-plans";

describe("form-plans", () => {
  it("defines Free, Solo, and Team with submission caps", () => {
    expect(FORM_PLANS.map((p) => p.id)).toEqual(["free", "solo", "team"]);
    expect(FORM_PLANS[0]?.submissionsPerMonth).toBe(10);
    expect(FORM_PLANS[1]?.price).toBe(10);
    expect(FORM_PLANS[2]?.price).toBe(20);
    expect(FORM_PLANS[2]?.submissionsPerMonth).toBe(5000);
  });

  it("normalizes legacy tiers", () => {
    expect(normalizePlanTier("basic")).toBe("solo");
    expect(normalizePlanTier("premium")).toBe("team");
    expect(planDisplayName("team")).toBe("Team");
  });
});
