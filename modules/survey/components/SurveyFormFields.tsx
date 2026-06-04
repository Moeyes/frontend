"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import type { SurveyFormData, Event, Organization, Sport } from "../types";
import { SurveyFormSportsStep } from "./SurveyFormSportsStep";
import { SurveyFormReviewStep } from "./SurveyFormReviewStep";

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
    return <SurveyFormSportsStep form={form} eventSports={eventSports} />;
  }

  if (step === "review") {
    return (
      <SurveyFormReviewStep
        events={events}
        organizations={organizations}
        eventSports={eventSports}
        selectedEventId={selectedEventId}
        selectedOrgId={selectedOrgId}
        selectedSportIds={selectedSportIds}
      />
    );
  }

  return null;
}
