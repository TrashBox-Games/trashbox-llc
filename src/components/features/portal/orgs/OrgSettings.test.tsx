import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { OrgSettings } from "./OrgSettings";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portal/acme-co/settings/general/",
}));

const org = {
  orgId: "o1",
  orgName: "Acme Co",
  orgSlug: "acme-co",
  role: "owner" as const,
  tier: "basic" as const,
  active: true,
  hasBilling: false,
  projects: [],
};

describe("OrgSettings", () => {
  it("renders organization settings chrome with general section", () => {
    render(
      <StubAuthProvider value={{ status: "signedIn", configured: true }}>
        <StubPortalProvider value={{ ready: true }}>
          <OrgSettings org={org} />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /organization settings/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
  });
});
