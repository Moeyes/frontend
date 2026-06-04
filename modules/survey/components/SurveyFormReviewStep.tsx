"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { Event, Organization, Sport } from "../types";

interface SurveyFormReviewStepProps {
  events: Event[];
  organizations: Organization[];
  eventSports: Sport[];
  selectedEventId?: number;
  selectedOrgId?: number;
  selectedSportIds: number[];
}

function summaryBlock(label: string, children: ReactNode) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <h4 className="mb-2 text-xs font-medium leading-relaxed text-muted-foreground">{label}</h4>
      {children}
    </div>
  );
}

export function SurveyFormReviewStep({
  events,
  organizations,
  eventSports,
  selectedEventId,
  selectedOrgId,
  selectedSportIds,
}: SurveyFormReviewStepProps) {
  const t = useTranslations("survey");

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);
  const selectedSports = eventSports.filter((s) =>
    selectedSportIds.includes(s.sports_id),
  );

  return (
    <div className="space-y-4">
      {summaryBlock(
        t("review.event"),
        <p className="font-medium leading-relaxed text-foreground">{selectedEvent?.name_kh}</p>,
      )}
      {summaryBlock(
        t("review.organization"),
        <p className="font-medium leading-relaxed text-foreground">{selectedOrg?.name_kh}</p>,
      )}
      {summaryBlock(
        `${t("review.sports")} (${selectedSports.length})`,
        <div className="flex flex-wrap gap-2">
          {selectedSports.map((sport) => (
            <span
              key={sport.sports_id}
              className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1 text-sm leading-relaxed text-foreground"
            >
              {sport.name_kh}
            </span>
          ))}
        </div>,
      )}
    </div>
  );
}
