"use client";

import { Select } from "@/components/atoms/Select";
import {
  LEAD_STATUSES,
  LEAD_STATUS_DOT_CLASS,
  LEAD_STATUS_LABELS,
  LEAD_TAGS,
  LEAD_TAG_LABELS,
  teamMemberDisplayName,
  type LeadStatus,
  type LeadTag,
  type TeamMember,
} from "@/lib/api";

const inputClass =
  "w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm text-white placeholder:text-outline focus:border-primary focus:outline-none";
const labelClass =
  "mb-1 block font-label text-[10px] uppercase tracking-widest text-outline";

export interface LeadInboxFiltersValue {
  q: string;
  status: LeadStatus | "";
  tag: LeadTag | "";
  assignedTo: string;
}

interface LeadInboxFiltersProps {
  value: LeadInboxFiltersValue;
  members: TeamMember[];
  onChange: (next: LeadInboxFiltersValue) => void;
  onApply: () => void;
}

export function LeadInboxFilters({
  value,
  members,
  onChange,
  onApply,
}: LeadInboxFiltersProps) {
  return (
    <form
      className="grid grid-cols-1 gap-6 rounded bg-surface-container-low p-6 shadow-sm md:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <div className="md:col-span-2">
        <label className={labelClass} htmlFor="lead-search">
          Search
        </label>
        <input
          id="lead-search"
          type="search"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          className={`${inputClass} search-clear-muted`}
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
      <div className="md:col-span-4">
        <button
          type="submit"
          className="rounded bg-surface-container-highest px-6 py-3 font-label text-xs uppercase tracking-widest text-white shadow-sm transition-colors hover:bg-surface-variant"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}
