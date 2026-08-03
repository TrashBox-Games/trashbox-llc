"use client";

import { Fragment, type FormEvent, useState } from "react";
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
import { PortalUserAvatar } from "@/components/features/portal/PortalUserMenu";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function defaultInviteRoleId(roles: ClientRole[]): string {
  return roles.find((r) => r.id === "member")?.id ?? roles[0]?.id ?? "member";
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
  onInvite,
  onRevokeInvite,
  onRemoveMember,
  onUpdateMember,
}: TeamPanelProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inviteRoleId, setInviteRoleId] = useState(() =>
    defaultInviteRoleId(roles),
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

  function openInviteDialog() {
    setEmail("");
    setEmailNotifications(true);
    setInviteRoleId(defaultInviteRoleId(roles));
    setInviteOpen(true);
  }

  function closeInviteDialog() {
    setInviteOpen(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = email.trim();
    if (!next || atCap) return;
    await onInvite({
      email: next,
      emailNotifications,
      ...(inviteRoleId ? { roleId: inviteRoleId } : {}),
    });
    setEmail("");
    setEmailNotifications(true);
    setInviteRoleId(defaultInviteRoleId(roles));
    setInviteOpen(false);
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
      {error && <p className="text-sm text-red-300">{error}</p>}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div className="flex flex-wrap items-end gap-3">
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
          {canManage ? (
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={openInviteDialog}
            >
              Invite member
            </Button>
          ) : null}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Alerts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const isSelf = selfEmail === member.email.toLowerCase();
              const editing = editingEmail === member.email;
              const displayName = teamMemberDisplayName(member);
              const allowsAll = memberAllowsAllSenderNames(member, roles);
              const memberRoleId = resolveMemberRoleId(member) ?? "";
              const defaultName = defaultLabel(member);
              return (
                <Fragment key={member.email}>
                  <TableRow>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <PortalUserAvatar label={displayName} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">
                            {displayName}
                            {isSelf ? (
                              <span className="text-outline ml-2 text-xs font-normal">
                                you
                              </span>
                            ) : null}
                          </p>
                          {displayName !== member.email ? (
                            <p className="text-on-surface-variant truncate text-xs">
                              {member.email}
                            </p>
                          ) : null}
                          {defaultName ||
                          (allowsAll && member.role !== "owner") ? (
                            <p className="font-label text-outline mt-1 text-[10px] tracking-widest uppercase">
                              {defaultName ? `default: ${defaultName}` : ""}
                              {defaultName &&
                              allowsAll &&
                              member.role !== "owner"
                                ? " · "
                                : ""}
                              {allowsAll && member.role !== "owner"
                                ? "all sender names"
                                : ""}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {canAssignRole(member) && assignableRoles.length > 0 ? (
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
                            aria-label={`Role for ${displayName}`}
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
                      ) : member.role === "owner" ? (
                        <span className="text-primary text-sm">Owner</span>
                      ) : (
                        <span className="text-sm">
                          {roleLabel(member, roles)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {canToggleNotifications(member) ? (
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
                      ) : (
                        <span className="text-on-surface-variant text-xs">
                          {member.emailNotifications ? "On" : "Off"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {canEditProfile(member) && !editing ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => startEdit(member)}
                          >
                            Edit
                          </Button>
                        ) : null}
                        {canRemove(member) && !isSelf ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => void onRemoveMember(member.email)}
                          >
                            Remove
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                  {editing ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={4} className="bg-surface-container-low/50 whitespace-normal">
                        <form
                          className="grid max-w-xl gap-4 md:grid-cols-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            void saveEdit(member);
                          }}
                        >
                          <div>
                            <Label htmlFor={`first-${member.email}`}>
                              First Name
                            </Label>
                            <Input
                              id={`first-${member.email}`}
                              value={editFirst}
                              onChange={(e) => setEditFirst(e.target.value)}
                              disabled={busy}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`last-${member.email}`}>
                              Last Name
                            </Label>
                            <Input
                              id={`last-${member.email}`}
                              value={editLast}
                              onChange={(e) => setEditLast(e.target.value)}
                              disabled={busy}
                            />
                          </div>
                          {canAssignSenderNames(member) ? (
                            <div className="space-y-4 md:col-span-2">
                              {allowsAll ? (
                                <p className="text-on-surface-variant text-sm">
                                  This member&apos;s role allows all Sender
                                  Display Names. No allow-list is needed.
                                </p>
                              ) : (
                                <>
                                  <div>
                                    <Label>Allowed Sender Display Names</Label>
                                    {senderDisplayNames.length === 0 ? (
                                      <p className="text-on-surface-variant text-sm">
                                        Create names in{" "}
                                        <a
                                          href={settingsSectionPath(
                                            "sending-preferences",
                                          )}
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
                                      disabled={
                                        busy || editAllowedIds.length === 0
                                      }
                                      onValueChange={(value) =>
                                        setEditDefaultId(
                                          value === DEFAULT_NONE ? "" : value,
                                        )
                                      }
                                    >
                                      <SelectTrigger
                                        id={`default-${member.email}`}
                                      >
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
                          ) : null}
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
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </section>

      {canManage && (
        <section className="space-y-4">
          <p className="font-label px-1 text-[10px] uppercase tracking-widest text-outline">
            Pending Invites
          </p>
          {invites.length === 0 ? (
            <p className="text-on-surface-variant px-1 text-sm">
              No pending invites.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Invite</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited by</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => {
                  const displayName = teamMemberDisplayName(invite);
                  return (
                    <TableRow key={invite.email}>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <PortalUserAvatar label={displayName} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">
                              {displayName}
                            </p>
                            {displayName !== invite.email ? (
                              <p className="text-on-surface-variant truncate text-xs">
                                {invite.email}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {invite.roleId
                          ? roles.find((r) => r.id === invite.roleId)?.name ??
                            invite.role
                          : invite.role}
                      </TableCell>
                      <TableCell className="text-on-surface-variant text-sm">
                        {invite.invitedBy}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() => void onRevokeInvite(invite.email)}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </section>
      )}

      {inviteOpen ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={closeInviteDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-member-title"
            className="border-outline-variant/25 bg-background w-full max-w-md space-y-5 border p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              id="invite-member-title"
              className="font-headline text-xl font-bold text-white"
            >
              Invite member
            </p>
            {atCap ? (
              <div className="space-y-4">
                <p className="text-sm text-on-surface-variant">
                  {memberLimit <= 1
                    ? `${tier === "solo" ? "Solo" : "Free"} includes only the owner.`
                    : `Team is at the ${memberLimit}-seat limit. Remove someone before inviting.`}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  {memberLimit <= 1 ? (
                    <Button asChild type="button">
                      <PortalLink href={settingsSectionPath("current-plan")}>
                        View plans
                      </PortalLink>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    className="font-headline text-xs font-bold uppercase tracking-widest"
                    disabled={busy}
                    onClick={closeInviteDialog}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={(e) => void onSubmit(e)}>
                <div>
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    disabled={busy}
                  />
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
                {assignableRoles.length > 0 ? (
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
                ) : null}
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="font-headline text-xs font-bold uppercase tracking-widest"
                    disabled={busy}
                    onClick={closeInviteDialog}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={busy || !email.trim()}>
                    {busy ? "Sending…" : "Send Invite"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
