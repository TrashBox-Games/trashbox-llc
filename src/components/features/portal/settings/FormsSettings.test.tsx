import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StubPortalProvider } from "@/lib/portal";
import { FormsSettings } from "./FormsSettings";

const listForms = vi.fn();
const createForm = vi.fn();
const updateForm = vi.fn();

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    listForms: (...args: unknown[]) => listForms(...args),
    createForm: (...args: unknown[]) => createForm(...args),
    updateForm: (...args: unknown[]) => updateForm(...args),
  };
});

const defaultForm = {
  formId: "f1",
  clientId: "c1",
  name: "Default",
  slug: "default",
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  submissionCount: 3,
};

describe("FormsSettings", () => {
  beforeEach(() => {
    listForms.mockReset();
    createForm.mockReset();
    updateForm.mockReset();
  });

  it("shows form cards with submission counts and creates a new form", async () => {
    const user = userEvent.setup();
    createForm.mockResolvedValue({
      form: {
        ...defaultForm,
        formId: "f2",
        name: "Contact",
        slug: "contact",
        submissionCount: 0,
      },
    });

    render(
      <StubPortalProvider
        value={{
          ready: true,
          account: {
            linked: true,
            projectId: "c1",
            projectName: "Site",
            projectSlug: "site",
          },
          orgs: [
            {
              orgId: "o1",
              orgName: "Acme",
              orgSlug: "acme",
              role: "owner",
              tier: "free",
              active: true,
              hasBilling: false,
              projects: [
                {
                  projectId: "c1",
                  projectName: "Site",
                  projectSlug: "site",
                },
              ],
            },
          ],
        }}
      >
        <FormsSettings
          initialState={{ forms: [defaultForm], canManage: true }}
        />
      </StubPortalProvider>,
    );

    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText("3 submissions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view leads/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /create form/i }));
    await user.type(screen.getByLabelText(/form name/i), "Contact");
    await user.click(screen.getByRole("button", { name: /^create form$/i }));

    expect(createForm).toHaveBeenCalledWith({ name: "Contact" });
    expect(await screen.findByText("Contact")).toBeInTheDocument();
  });

  it("hides create card when the user cannot manage", () => {
    render(
      <StubPortalProvider value={{ ready: true }}>
        <FormsSettings
          initialState={{ forms: [defaultForm], canManage: false }}
        />
      </StubPortalProvider>,
    );

    expect(
      screen.queryByRole("button", { name: /create form/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/only owners and members with api key permission/i),
    ).toBeInTheDocument();
  });
});
