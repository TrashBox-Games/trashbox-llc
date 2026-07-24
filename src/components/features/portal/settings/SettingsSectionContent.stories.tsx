import type { Decorator, Meta, StoryObj } from "@storybook/react";
import type { ClientRole, TeamMember } from "@/lib/api";
import { StubAuthProvider } from "@/lib/auth";
import { StubPortalProvider } from "@/lib/portal";
import { SettingsSectionContent } from "./SettingsSectionContent";

const systemRoles: ClientRole[] = [
  {
    id: "admin",
    name: "Admin",
    system: true,
    permissions: [
      "manage_sender_display_names",
      "allow_all_sender_display_names",
      "manage_team_members",
      "manage_roles_and_permissions",
      "manage_api_keys",
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "member",
    name: "Member",
    system: true,
    permissions: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const owner: TeamMember = {
  email: "owner@example.com",
  role: "owner",
  joinedAt: "2026-01-01T00:00:00.000Z",
  emailNotifications: true,
};

const signedInDecorator: Decorator = (Story) => (
  <StubAuthProvider
    value={{
      configured: true,
      status: "signedIn",
      email: "owner@example.com",
    }}
  >
    <StubPortalProvider
      value={{
        ready: true,
        account: {
          linked: true,
          email: "owner@example.com",
          clientName: "Acme",
          tier: "premium",
          active: true,
          hasBilling: true,
          hasApiKey: true,
          role: "owner",
        },
        isOwner: true,
        hasPermission: () => true,
        mailbox: {
          connected: true,
          email: "inbox@acme.example",
          provider: "gmail",
          fromIdentities: [
            {
              id: "s1",
              name: "Acme Support",
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        },
      }}
    >
      <div className="mx-auto max-w-2xl bg-background px-8 py-16">
        <Story />
      </div>
    </StubPortalProvider>
  </StubAuthProvider>
);

const meta = {
  title: "Features/Portal/Settings/SettingsSectionContent",
  component: SettingsSectionContent,
  tags: ["autodocs"],
  decorators: [signedInDecorator],
  args: {
    sectionId: "email-accounts",
  },
} satisfies Meta<typeof SettingsSectionContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmailAccounts: Story = {
  args: {
    sectionId: "email-accounts",
  },
};

export const Members: Story = {
  args: {
    sectionId: "members",
    teamMembersInitialState: {
      role: "owner",
      canManageTeamMembers: true,
      members: [owner],
      invites: [],
      roles: systemRoles,
      memberLimit: 5,
      memberCount: 1,
      senderDisplayNames: [],
    },
  },
};

export const ApiKeys: Story = {
  args: {
    sectionId: "api-keys",
    apiKeysInitialState: {
      canManage: true,
      account: {
        linked: true,
        email: "owner@example.com",
        clientName: "Acme",
        tier: "premium",
        active: true,
        hasBilling: true,
        hasApiKey: false,
        role: "owner",
      },
    },
  },
};

export const BrandingPlaceholder: Story = {
  args: {
    sectionId: "branding",
  },
};

export const Loading: Story = {
  decorators: [
    (Story) => (
      <StubAuthProvider value={{ configured: true, status: "loading" }}>
        <StubPortalProvider>
          <div className="mx-auto max-w-2xl bg-background px-8 py-16">
            <Story />
          </div>
        </StubPortalProvider>
      </StubAuthProvider>
    ),
  ],
};

export const AccountUnlinked: Story = {
  decorators: [
    (Story) => (
      <StubAuthProvider
        value={{
          configured: true,
          status: "signedIn",
          email: "owner@example.com",
        }}
      >
        <StubPortalProvider
          value={{
            ready: true,
            account: {
              linked: false,
              email: "owner@example.com",
            },
          }}
        >
          <div className="mx-auto max-w-2xl bg-background px-8 py-16">
            <Story />
          </div>
        </StubPortalProvider>
      </StubAuthProvider>
    ),
  ],
};
