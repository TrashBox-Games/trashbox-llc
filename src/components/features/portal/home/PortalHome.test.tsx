import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { PortalHome } from "./PortalHome";

describe("PortalHome", () => {
  it("shows create-organization empty state when unlinked", async () => {
    const user = userEvent.setup();
    const onProvisionAccount = vi.fn().mockResolvedValue(undefined);

    function Harness() {
      const [businessName, setBusinessName] = useState("");
      return (
        <StubAuthProvider value={{ status: "signedIn", configured: true }}>
          <StubPortalProvider
            value={{
              ready: true,
              account: {
                linked: false,
                email: "owner@example.com",
              },
              businessName,
              setBusinessName,
              billingBusy: false,
              billingError: null,
              onProvisionAccount,
            }}
          >
            <PortalHome />
          </StubPortalProvider>
        </StubAuthProvider>
      );
    }

    render(<Harness />);

    expect(
      screen.getByRole("heading", { name: /create an organization/i }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText(/organization name/i), "Acme Co");
    await user.click(
      screen.getByRole("button", { name: /create organization/i }),
    );
    expect(onProvisionAccount).toHaveBeenCalled();
  });

  it("shows workspace summary when linked", () => {
    render(
      <StubAuthProvider value={{ status: "signedIn", configured: true }}>
        <StubPortalProvider
          value={{
            ready: true,
            clientName: "Acme Co",
            account: {
              linked: true,
              email: "owner@example.com",
              clientName: "Acme Co",
              clientId: "c1",
              tier: "basic",
              active: true,
              hasApiKey: true,
              hasBilling: false,
              role: "owner",
              emailsUsed: 0,
              emailLimit: 1000,
            },
          }}
        >
          <PortalHome />
        </StubPortalProvider>
      </StubAuthProvider>,
    );

    expect(screen.getByText("Acme Co")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /open inbox/i }).getAttribute("href"),
    ).toMatch(/\/portal\/inbox\/?$/);
  });
});
