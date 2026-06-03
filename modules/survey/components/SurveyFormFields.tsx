"use client";

import type { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import type { SurveyFormData, Event, Organization, Sport } from "../types";

interface SurveyFormFieldsProps {
  form: UseFormReturn<SurveyFormData>;
  events: Event[];
  organizations: Organization[];
  eventSports: Sport[];
  step: "event_type" | "event" | "organization" | "sports" | "review";
  eventTypes?: { id: string; name_kh: string }[];
  selectedEventType?: string | null;
  onSelectEventType?: (id: string) => void;
}

const selectableCard = (selected: boolean) =>
  cn(
    "rounded-lg border p-4 text-left leading-relaxed transition-all",
    selected
      ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
      : "border-border hover:border-primary/40 hover:bg-accent/40",
  );

export function SurveyFormFields({
  form,
  events,
  organizations,
  eventSports,
  step,
  eventTypes = [],
  selectedEventType,
  onSelectEventType,
}: SurveyFormFieldsProps) {
  const { watch, setValue, trigger } = form;
  const t = useTranslations("survey");

  const selectedEventId = watch("eventId");
  const selectedOrgId = watch("organizationId");
  const selectedSportIds = watch("sportIds") || [];

  const emptyState = (message: string) => (
    <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-sm leading-relaxed text-muted-foreground">
      {message}
    </div>
  );

  if (step === "event_type") {
    return (
      <div className="grid gap-3">
        {eventTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelectEventType?.(type.id)}
            className={selectableCard(selectedEventType === type.id)}
          >
            <h4 className="font-medium leading-relaxed text-foreground">{type.name_kh}</h4>
          </button>
        ))}
      </div>
    );
  }

  if (step === "event") {
    return events.length === 0 ? (
      emptyState(t("noEvents"))
    ) : (
      <div className="grid gap-3">
        {events.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => {
              setValue("eventId", event.id);
              trigger("eventId");
            }}
            className={selectableCard(selectedEventId === event.id)}
          >
            <h4 className="font-medium leading-relaxed text-foreground">{event.name_kh}</h4>
          </button>
        ))}
      </div>
    );
  }

  if (step === "organization") {
    return organizations.length === 0 ? (
      emptyState(t("noOrgs"))
    ) : (
      <div className="grid max-h-[400px] gap-3 overflow-y-auto pr-2">
        {organizations.map((org) => (
          <button
            key={org.id}
            type="button"
            onClick={() => {
              setValue("organizationId", org.id);
              trigger("organizationId");
            }}
            className={selectableCard(selectedOrgId === org.id)}
          >
            <h4 className="font-medium leading-relaxed text-foreground">{org.name_kh}</h4>
            {org.type && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{org.type}</p>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (step === "sports") {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{t("selectSportsHint")}</p>

        {eventSports.length === 0 ? (
          emptyState(t("noSports"))
        ) : (
          <>
            <div className="grid max-h-[520px] grid-cols-1 gap-3 overflow-y-auto pr-2 md:grid-cols-2">
              {eventSports.map((sport) => {
                const checked = selectedSportIds.includes(sport.sports_id);
                return (
                  <label
                    key={`${sport.sports_id}-${sport.id}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-4 leading-relaxed transition-colors",
                      checked
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/40 hover:bg-accent/40",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...selectedSportIds, sport.sports_id]
                          : selectedSportIds.filter((id) => id !== sport.sports_id);
                        setValue("sportIds", newIds);
                        trigger("sportIds");
                      }}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <h4 className="font-medium leading-relaxed text-foreground">{sport.name_kh}</h4>
                      {sport.sport_type && (
                        <p className="text-sm leading-relaxed text-muted-foreground">{sport.sport_type}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
              {t("selectedCount", { count: selectedSportIds.length })}
            </div>
          </>
        )}

        {form.formState.errors.sportIds && (
          <p className="text-sm leading-relaxed text-destructive">
            {form.formState.errors.sportIds.message}
          </p>
        )}
      </div>
    );
  }

  if (step === "review") {
    const selectedEvent = events.find((e) => e.id === selectedEventId);
    const selectedOrg = organizations.find((o) => o.id === selectedOrgId);
    const selectedSports = eventSports.filter((s) =>
      selectedSportIds.includes(s.sports_id),
    );

    const summaryBlock = (label: string, children: ReactNode) => (
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <h4 className="mb-2 text-xs font-medium leading-relaxed text-muted-foreground">{label}</h4>
        {children}
      </div>
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

  return null;
}
