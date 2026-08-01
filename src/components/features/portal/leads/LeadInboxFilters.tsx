"use client";

import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LEAD_STATUSES,
  LEAD_STATUS_DOT_CLASS,
  LEAD_STATUS_LABELS,
  LEAD_TAGS,
  LEAD_TAG_LABELS,
  teamMemberDisplayName,
  type LeadStatus,
  type LeadTag,
  type ProjectForm,
  type TeamMember,
} from "@/lib/api";

const labelClass =
  "mb-1 block font-label text-[10px] uppercase tracking-widest text-outline";

export interface LeadInboxFiltersValue {
  q: string;
  status: LeadStatus | "";
  tag: LeadTag | "";
  assignedTo: string;
  formId: string;
}

interface LeadInboxFiltersProps {
  value: LeadInboxFiltersValue;
  members: TeamMember[];
  forms?: ProjectForm[];
  onChange: (next: LeadInboxFiltersValue) => void;
  onApply: () => void;
}

export function LeadInboxFilters({
  value,
  members,
  forms = [],
  onChange,
  onApply,
}: LeadInboxFiltersProps) {
  return (
    <form
      className="grid grid-cols-1 gap-4 rounded bg-surface-container-low p-4 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <div>
        <label className={labelClass} htmlFor="lead-search">
          Search
        </label>
        <Input
          id="lead-search"
          type="search"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          className="search-clear-muted py-2 placeholder:text-outline"
          placeholder="Name, email, or message"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="lead-status">
          Status
        </label>
        <Select
          id="lead-status"
          value={value.status}
          onChange={(status) =>
            onChange({ ...value, status: status as LeadStatus | "" })
          }
          options={[
            { value: "", label: "All statuses" },
            ...LEAD_STATUSES.map((status) => ({
              value: status,
              label: LEAD_STATUS_LABELS[status],
              indicatorClassName: LEAD_STATUS_DOT_CLASS[status],
            })),
          ]}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="lead-tag">
          Tag
        </label>
        <Select
          id="lead-tag"
          value={value.tag}
          onChange={(tag) =>
            onChange({ ...value, tag: tag as LeadTag | "" })
          }
          options={[
            { value: "", label: "All tags" },
            ...LEAD_TAGS.map((tag) => ({
              value: tag,
              label: LEAD_TAG_LABELS[tag],
            })),
          ]}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="lead-assignee">
          Assigned to
        </label>
        <Select
          id="lead-assignee"
          value={value.assignedTo}
          onChange={(assignedTo) => onChange({ ...value, assignedTo })}
          options={[
            { value: "", label: "Anyone" },
            ...members.map((member) => {
              const label = teamMemberDisplayName(member);
              return {
                value: member.email,
                label:
                  label === member.email
                    ? member.email
                    : `${label} (${member.email})`,
              };
            }),
          ]}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="lead-form">
          Form
        </label>
        <Select
          id="lead-form"
          value={value.formId}
          onChange={(formId) => onChange({ ...value, formId })}
          options={[
            { value: "", label: "All forms" },
            ...forms.map((form) => ({
              value: form.formId,
              label: form.active ? form.name : `${form.name} (inactive)`,
            })),
          ]}
        />
      </div>
      <div>
        <Button
          type="submit"
          variant="secondary"
          className="w-full rounded bg-white font-label font-medium text-background shadow-sm hover:bg-white/90 hover:text-background"
        >
          Apply filters
        </Button>
      </div>
    </form>
  );
}
