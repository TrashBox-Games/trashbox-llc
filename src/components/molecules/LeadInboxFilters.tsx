"use client";

import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_TAGS,
  LEAD_TAG_LABELS,
  type LeadStatus,
  type LeadTag,
  type TeamMember,
} from "@/lib/api";

const selectClass =
  "border-0 border-b border-outline-variant bg-transparent py-2 text-sm text-white focus:border-primary focus:outline-none";
const inputClass =
  "w-full border-0 border-b border-outline-variant bg-transparent py-2 text-sm text-white placeholder:text-outline-variant/50 focus:border-primary focus:outline-none";
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
      className="grid grid-cols-1 gap-4 border-b border-outline-variant/10 pb-6 md:grid-cols-4"
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
          className={inputClass}
          placeholder="Name, email, or message"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="lead-status">
          Status
        </label>
        <select
          id="lead-status"
          className={`${selectClass} w-full`}
          value={value.status}
          onChange={(e) =>
            onChange({
              ...value,
              status: e.target.value as LeadStatus | "",
            })
          }
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {LEAD_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="lead-tag">
          Tag
        </label>
        <select
          id="lead-tag"
          className={`${selectClass} w-full`}
          value={value.tag}
          onChange={(e) =>
            onChange({ ...value, tag: e.target.value as LeadTag | "" })
          }
        >
          <option value="">All tags</option>
          {LEAD_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {LEAD_TAG_LABELS[tag]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="lead-assignee">
          Assigned to
        </label>
        <select
          id="lead-assignee"
          className={`${selectClass} w-full`}
          value={value.assignedTo}
          onChange={(e) => onChange({ ...value, assignedTo: e.target.value })}
        >
          <option value="">Anyone</option>
          {members.map((member) => (
            <option key={member.email} value={member.email}>
              {member.email}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-4">
        <button
          type="submit"
          className="bg-primary px-5 py-3 font-headline text-xs font-bold uppercase tracking-widest text-on-primary"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}
