import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StubPortalProvider } from "@/lib/portal";
import { FormsPage } from "./FormsPage";

const forms = [
  {
    formId: "f1",
    clientId: "c1",
    name: "Default",
    slug: "default",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    submissionCount: 1,
  },
];

describe("FormsPage", () => {
  it("renders forms chrome and cards", () => {
    render(
      <StubPortalProvider
        value={{
          ready: true,
          account: { linked: true, projectName: "Marketing site" },
        }}
      >
        <FormsPage initialState={{ forms, canManage: true }} />
      </StubPortalProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /forms/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText("1 submission")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create form/i }),
    ).toBeInTheDocument();
  });
});
