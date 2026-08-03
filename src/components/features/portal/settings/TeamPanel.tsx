"use client";

import { type FormEvent, useState } from "react";
import type {
  ClientRole,
  CreateTeamInviteInput,
  FromIdentity,
  TeamInvite,
  TeamMember,
  TeamRole,
  UpdateTeamMemberInput,
} from "@/lib/api";
import { hasPermission, teamMemberDisplayName } from "@/lib/api";
import { settingsSectionPath } from "@/lib/portal-settings";
import { PortalLink } from "@/components/features/portal/PortalLink";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_NONE = "__none__";

export interface TeamPanelProps {
  role: TeamRole;
  currentUserEmail?: string;
  members: TeamMember[];
  invites: TeamInvite[];
  roles?: ClientRole[];
  canManageTeamMembers?: boolean;
  senderDisplayNames?: FromIdentity[];
  memberLimit: number;
  memberCount: number;
  tier?: "free" | "solo" | "team";
  busy?: boolean;
  error?: string | null;
  notice?: string | null;
  onInvite: (input: CreateTeamInviteInput) => Promise<void>;
  onRevokeInvite: (email: string) => Promise<void>;
  onRemoveMember: (email: string) => Promise<void>;
  onUpdateMember: (
    email: string,
    patch: UpdateTeamMemberInput,
  ) => Promise<void>;
}

function resolveMemberRoleId(member: TeamMember): string | null {
  if (member.role === "owner") return null;
  if (member.roleId?.trim()) return member.roleId.trim();
  if (member.role === "admin" || member.role === "member") return member.role;
  return "member";
}

function roleLabel(
  member: TeamMember,
  roles: ClientRole[],
): string {
  if (member.role === "owner") return "Owner";
  const roleId = resolveMemberRoleId(member);
  const found = roleId ? roles.find((r) => r.id === roleId) : undefined;
  return found?.name ?? member.role;
}

function memberAllowsAllSenderNames(
  member: TeamMember,
  roles: ClientRole[],
): boolean {
  if (member.role === "owner") return true;
  const roleId = resolveMemberRoleId(member);
  if (!roleId) return false;
  const found = roles.find((r) => r.id === roleId);
  if (!found) return roleId === "admin";
  return hasPermission(found.permissions, "allow_all_sender_display_names");
}

export function TeamPanel({
  role,
  currentUserEmail,
  members,
  invites,
  roles = [],
  canManageTeamMembers,
  senderDisplayNames = [],
  memberLimit,
  memberCount,
  tier,
  busy = false,
  error,
  notice,
  onInvite,
  onRevokeInvite,
  onRemoveMember,
  onUpdateMember,
}: TeamPanelProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inviteRoleId, setInviteRoleId] = useState(
    () => roles.find((r) => r.id === "member")?.id ?? roles[0]?.id ?? "member",
  );
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editAllowedIds, setEditAllowedIds] = useState<string[]>([]);
  const [editDefaultId, setEditDefaultId] = useState("");
  const isOwner = role === "owner";
  const canManage =
    canManageTeamMembers ?? (role === "owner" || role === "admin");
  const atCap = memberCount >= memberLimit;
  const selfEmail = currentUserEmail?.toLowerCase();
  const assignableRoles = roles.filter((r) => r.id !== "owner");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = email.trim();
    if (!next || atCap) return;
    await onInvite({
      email: next,
      ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
      ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
      emailNotifications,
      ...(inviteRoleId ? { roleId: inviteRoleId } : {}),
    });
    setEmail("");
    setFirstName("");
    setLastName("");
    setEmailNotifications(true);
    setInviteRoleId(
      roles.find((r) => r.id === "member")?.id ?? roles[0]?.id ?? "member",
    );
  }

  function canRemove(member: TeamMember): boolean {
    if (!canManage) return false;
    if (member.role === "owner") return false;
    if (
      (member.role === "admin" || member.roleId === "admin") &&
      !isOwner
    ) {
      return false;
    }
    return true;
  }

  function canEditProfile(member: TeamMember): boolean {
    const isSelf = selfEmail === member.email.toLowerCase();
    if (isSelf) return true;
    if (!canManage) return false;
    if (
      (member.role === "admin" || member.roleId === "admin") &&
      !isOwner
    ) {
      return false;
    }
    return true;
  }

  function canAssignRole(member: TeamMember): boolean {
    if (!canManage) return false;
    if (member.role === "owner") return false;
    if (
      (member.role === "admin" || member.roleId === "admin") &&
      !isOwner
    ) {
      return false;
    }
    return true;
  }

  function canAssignSenderNames(member: TeamMember): boolean {
    if (!canManage) return false;
    if (
      (member.role === "admin" || member.roleId === "admin") &&
      !isOwner
    ) {
      return false;
    }
    return true;
  }

  function canToggleNotifications(member: TeamMember): boolean {
    return canEditProfile(member);
  }

  function startEdit(member: TeamMember) {
    setEditingEmail(member.email);
    setEditFirst(member.firstName ?? "");
    setEditLast(member.lastName ?? "");
    const allowed = member.allowedFromIdentityIds ?? [];
    setEditAllowedIds(allowed);
    setEditDefaultId(member.defaultFromIdentityId ?? allowed[0] ?? "");
  }

  function toggleAllowed(id: string) {
    setEditAllowedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      if (!next.includes(editDefaultId)) {
        setEditDefaultId(next[0] ?? "");
      }
      return next;
    });
  }

  async function saveEdit(member: TeamMember) {
    const patch: UpdateTeamMemberInput = {
      firstName: editFirst.trim() || null,
      lastName: editLast.trim() || null,
    };
    if (
      canAssignSenderNames(member) &&
      !memberAllowsAllSenderNames(member, roles)
    ) {
      patch.allowedFromIdentityIds = editAllowedIds;
      patch.defaultFromIdentityId =
        editDefaultId && editAllowedIds.includes(editDefaultId)
          ? editDefaultId
          : editAllowedIds[0] ?? null;
    }
    await onUpdateMember(member.email, patch);
    setEditingEmail(null);
  }

  function defaultLabel(member: TeamMember): string | null {
    const id = member.defaultFromIdentityId;
    if (!id) return null;
    return senderDisplayNames.find((item) => item.id === id)?.name ?? null;
  }

  return (
    <div className="space-y-10">
      {notice && (
        <p className="border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface-variant">
          {notice}
        </p>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}

      <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
            Members
          </p>
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">
            Seats {memberCount} / {memberLimit}
            {tier === "free"
              ? " · Free"
              : tier === "solo"
                ? " · Solo"
                : tier === "team"
                  ? " · Team"
                  : ""}
          </p>
        </div>
        <ul className="mt-6 space-y-6">
          {members.map((member) => {
            const isSelf = selfEmail === member.email.toLowerCase();
            const editing = editingEmail === member.email;
            const defaultName = defaultLabel(member);
            const allowsAll = memberAllowsAllSenderNames(member, roles);
            const memberRoleId = resolveMemberRoleId(member) ?? "";
            return (
              <li
                key={member.email}
                className="border-b border-outline-variant/10 pb-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-white">{teamMemberDisplayName(member)}</p>
                    {teamMemberDisplayName(member) !== member.email && (
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {member.email}
                      </p>
                    )}
                    <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-outline">
                      {member.role === "owner" ? (
                        <span className="text-primary">Owner</span>
                      ) : (
                        roleLabel(member, roles)
                      )}
                      {member.emailNotifications ? " · emails on" : " · emails off"}
                      {defaultName ? ` · default: ${defaultName}` : ""}
                      {allowsAll && member.role !== "owner"
                        ? " · all sender names"
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {canToggleNotifications(member) && (
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <Checkbox
                          id={`alerts-${member.email}`}
                          checked={member.emailNotifications}
                          disabled={busy}
                          onCheckedChange={(checked) =>
                            void onUpdateMember(member.email, {
                              emailNotifications: checked === true,
                            })
                          }
                        />
                        <Label
                          htmlFor={`alerts-${member.email}`}
                          className="mb-0 text-xs font-body tracking-normal text-on-surface-variant normal-case"
                        >
                          Email alerts
                        </Label>
                      </div>
                    )}
                    {canEditProfile(member) && !editing && (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => startEdit(member)}
                      >
                        Edit profile
                      </Button>
                    )}
                    {canAssignRole(member) && assignableRoles.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span className="sr-only">Role</span>
                        <Select
                          value={memberRoleId}
                          disabled={busy}
                          onValueChange={(value) =>
                            void onUpdateMember(member.email, {
                              roleId: value,
                            })
                          }
                        >
                          <SelectTrigger
                            size="sm"
                            aria-label={`Role for ${teamMemberDisplayName(member)}`}
                            className="w-auto min-w-[6rem]"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {assignableRoles.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {canRemove(member) && !isSelf && (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => void onRemoveMember(member.email)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {editing && (
                  <form
                    className="mt-4 grid max-w-xl gap-4 md:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void saveEdit(member);
                    }}
                  >
                    <div>
                      <Label htmlFor={`first-${member.email}`}>First Name</Label>
                      <Input
                        id={`first-${member.email}`}
                        value={editFirst}
                        onChange={(e) => setEditFirst(e.target.value)}
                        disabled={busy}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`last-${member.email}`}>Last Name</Label>
                      <Input
                        id={`last-${member.email}`}
                        value={editLast}
                        onChange={(e) => setEditLast(e.target.value)}
                        disabled={busy}
                      />
                    </div>
                    {canAssignSenderNames(member) && (
                      <div className="md:col-span-2 space-y-4">
                        {allowsAll ? (
                          <p className="text-sm text-on-surface-variant">
                            This member&apos;s role allows all Sender Display
                            Names. No allow-list is needed.
                          </p>
                        ) : (
                          <>
                            <div>
                              <Label>Allowed Sender Display Names</Label>
                              {senderDisplayNames.length === 0 ? (
                                <p className="text-sm text-on-surface-variant">
                                  Create names in{" "}
                                  <a
                                    href={settingsSectionPath("sending-preferences")}
                                    className="text-white underline"
                                  >
                                    Sending Preferences
                                  </a>{" "}
                                  first.
                                </p>
                              ) : (
                                <ul className="mt-2 space-y-2">
                                  {senderDisplayNames.map((identity) => (
                                    <li key={identity.id}>
                                      <div className="flex cursor-pointer items-center gap-3 text-sm text-white">
                                        <Checkbox
                                          id={`allowed-${member.email}-${identity.id}`}
                                          checked={editAllowedIds.includes(
                                            identity.id,
                                          )}
                                          disabled={busy}
                                          onCheckedChange={() =>
                                            toggleAllowed(identity.id)
                                          }
                                        />
                                        <Label
                                          htmlFor={`allowed-${member.email}-${identity.id}`}
                                          className="mb-0 cursor-pointer text-sm font-body tracking-normal text-white normal-case"
                                        >
                                          {identity.name}
                                        </Label>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div>
                              <Label htmlFor={`default-${member.email}`}>
                                Default Sender Display Name
                              </Label>
                              <Select
                                value={editDefaultId || DEFAULT_NONE}
                                disabled={busy || editAllowedIds.length === 0}
                                onValueChange={(value) =>
                                  setEditDefaultId(
                                    value === DEFAULT_NONE ? "" : value,
                                  )
                                }
                              >
                                <SelectTrigger id={`default-${member.email}`}>
                                  <SelectValue placeholder="None Assigned" />
                                </SelectTrigger>
                                <SelectContent>
                                  {editAllowedIds.length === 0 && (
                                    <SelectItem value={DEFAULT_NONE}>
                                      None Assigned
                                    </SelectItem>
                                  )}
                                  {editAllowedIds.map((id) => {
                                    const name =
                                      senderDisplayNames.find(
                                        (item) => item.id === id,
                                      )?.name ?? id;
                                    return (
                                      <SelectItem key={id} value={id}>
                                        {name}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <div className="flex gap-3 md:col-span-2">
                      <Button type="submit" disabled={busy}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="link"
                        disabled={busy}
                        onClick={() => setEditingEmail(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {canManage && (
        <>
          <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">
              Invite Teammate
            </p>
            {atCap ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-on-surface-variant">
                  {tier === "free" || tier === "solo"
                    ? `${tier === "free" ? "Free" : "Solo"} includes only the owner.`
                    : `Team is at the ${memberLimit}-seat limit. Remove someone before inviting.`}
                </p>
                {tier === "free" || tier === "solo" ? (
                  <Button asChild type="button" size="sm">
                    <PortalLink href={settingsSectionPath("current-plan")}>
                      View plans
                    </PortalLink>
                  </Button>
                ) : null}
              </div>
            ) : (
              <form
                className="mt-6 max-w-md space-y-6"
                onSubmit={(e) => void onSubmit(e)}
              >
                <div>
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    disabled={busy}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="invite-first">First Name</Label>
                    <Input
                      id="invite-first"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ada"
                      disabled={busy}
                    />
                  </div>
                  <div>
                    <Label htmlFor="invite-last">Last Name</Label>
                    <Input
                      id="invite-last"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Lovelace"
                      disabled={busy}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Checkbox
                    id="invite-email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={(checked) =>
                      setEmailNotifications(checked === true)
                    }
                    disabled={busy}
                  />
                  <Label
                    htmlFor="invite-email-notifications"
                    className="mb-0 text-sm font-body tracking-normal text-on-surface-variant normal-case"
                  >
                    Receive form email notifications
                  </Label>
                </div>
                {assignableRoles.length > 0 && (
                  <div>
                    <Label htmlFor="invite-role">Role</Label>
                    <Select
                      value={inviteRoleId}
                      onValueChange={setInviteRoleId}
                      disabled={busy}
                    >
                      <SelectTrigger id="invite-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRoles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button type="submit" disabled={busy || !email.trim()}>
                  {busy ? "Sending…" : "Send Invite"}
                </Button>
              </form>
            )}
          </section>

          <section className="border border-outline-variant/10 bg-surface-container-low p-6 md:p-8">
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">
              Pending Invites
            </p>
            {invites.length === 0 ? (
              <p className="mt-4 text-sm text-on-surface-variant">
                No pending invites.
              </p>
            ) : (
              <ul className="mt-6 space-y-4">
                {invites.map((invite) => (
                  <li
                    key={invite.email}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/10 pb-4"
                  >
                    <div>
                      <p className="text-white">{teamMemberDisplayName(invite)}</p>
                      {teamMemberDisplayName(invite) !== invite.email && (
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {invite.email}
                        </p>
                      )}
                      <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-outline">
                        {invite.roleId
                          ? roles.find((r) => r.id === invite.roleId)?.name ??
                            invite.role
                          : invite.role}{" "}
                        · invited by {invite.invitedBy}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => void onRevokeInvite(invite.email)}
                    >
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
