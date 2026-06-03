"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import type {
  ByNumberFormInput,
  ByNumberFormData,
  Event,
  Organization,
} from "../types";

interface ByNumberFormFieldsProps {
  form: UseFormReturn<ByNumberFormInput, unknown, ByNumberFormData>;
  events: Event[];
  organizations: Organization[];
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

// Shared classes for the compact, right-aligned number inputs.
const countInput =
  "w-20 rounded-md border border-input px-2 py-1.5 text-right text-sm tabular-nums focus:border-primary focus:ring-1 focus:ring-ring";

export function ByNumberFormFields({
  form,
  events,
  organizations,
  step,
  eventTypes = [],
  selectedEventType,
  onSelectEventType,
}: ByNumberFormFieldsProps) {
  const { watch, setValue, trigger } = form;
  const t = useTranslations("bynumber");

  const selectedEventId = watch("eventId");
  const selectedOrgId = watch("organizationId");
  const sports = watch("sports") || [];

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
    if (sports.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <p className="font-medium leading-relaxed text-foreground">{t("noSportsTitle")}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("noSportsHint")}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted text-xs font-medium leading-relaxed text-muted-foreground">
                <th className="sticky left-0 z-20 border-r border-border bg-muted px-3 py-3 text-left">{t("table.sport")}</th>
                <th className="border-l border-border px-3 py-3 text-right">{t("table.athleteM")}</th>
                <th className="px-3 py-3 text-right">{t("table.athleteF")}</th>
                <th className="border-l border-border px-3 py-3 text-right">{t("table.leaderM")}</th>
                <th className="px-3 py-3 text-right">{t("table.leaderF")}</th>
                <th className="border-l border-border bg-accent/60 px-3 py-3 text-right">{t("table.subtotal")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {sports.map((sport, index) => {
                const subtotal =
                  (sport.athlete_male_count || 0) +
                  (sport.athlete_female_count || 0) +
                  (sport.leader_male_count || 0) +
                  (sport.leader_female_count || 0);
                const filled = subtotal > 0;
                return (
                  <tr
                    key={sport.sport_id}
                    className={cn("transition-colors", filled ? "bg-accent/30" : "hover:bg-accent/20")}
                  >
                    <td className="sticky left-0 z-10 border-r border-border bg-card px-3 py-2.5 text-sm font-medium leading-relaxed text-foreground">
                      {sport.sport_name_kh}
                    </td>
                    <td className="border-l border-border px-3 py-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={sport.athlete_male_count}
                        onChange={(e) => {
                          const updated = [...sports];
                          updated[index] = {
                            ...updated[index],
                            athlete_male_count: parseInt(e.target.value) || 0,
                          };
                          setValue("sports", updated);
                        }}
                        className={countInput}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={sport.athlete_female_count}
                        onChange={(e) => {
                          const updated = [...sports];
                          updated[index] = {
                            ...updated[index],
                            athlete_female_count: parseInt(e.target.value) || 0,
                          };
                          setValue("sports", updated);
                        }}
                        className={countInput}
                      />
                    </td>
                    <td className="border-l border-border px-3 py-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={sport.leader_male_count}
                        onChange={(e) => {
                          const updated = [...sports];
                          updated[index] = {
                            ...updated[index],
                            leader_male_count: parseInt(e.target.value) || 0,
                          };
                          setValue("sports", updated);
                        }}
                        className={countInput}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={sport.leader_female_count}
                        onChange={(e) => {
                          const updated = [...sports];
                          updated[index] = {
                            ...updated[index],
                            leader_female_count: parseInt(e.target.value) || 0,
                          };
                          setValue("sports", updated);
                        }}
                        className={countInput}
                      />
                    </td>
                    <td className="border-l border-border bg-muted/50 px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-foreground">
                      {subtotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted text-sm font-semibold tabular-nums text-foreground">
                <td className="sticky left-0 z-10 border-r border-border bg-muted px-3 py-3">{t("table.totals")}</td>
                <td className="border-l border-border px-3 py-3 text-right">
                  {sports.reduce((s, sp) => s + (sp.athlete_male_count || 0), 0)}
                </td>
                <td className="px-3 py-3 text-right">
                  {sports.reduce((s, sp) => s + (sp.athlete_female_count || 0), 0)}
                </td>
                <td className="border-l border-border px-3 py-3 text-right">
                  {sports.reduce((s, sp) => s + (sp.leader_male_count || 0), 0)}
                </td>
                <td className="px-3 py-3 text-right">
                  {sports.reduce((s, sp) => s + (sp.leader_female_count || 0), 0)}
                </td>
                <td className="border-l border-border bg-accent/60 px-3 py-3 text-right text-primary">
                  {sports.reduce(
                    (s, sp) =>
                      s +
                      ((sp.athlete_male_count || 0) +
                        (sp.athlete_female_count || 0) +
                        (sp.leader_male_count || 0) +
                        (sp.leader_female_count || 0)),
                    0,
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {form.formState.errors.sports && (
          <p className="text-sm leading-relaxed text-destructive">
            {form.formState.errors.sports.message}
          </p>
        )}
      </div>
    );
  }

  if (step === "review") {
    const selectedEvent = events.find((e) => e.id === selectedEventId);
    const selectedOrg = organizations.find((o) => o.id === selectedOrgId);

    const totalAthletes = sports.reduce(
      (sum, s) => sum + s.athlete_male_count + s.athlete_female_count,
      0,
    );
    const totalLeaders = sports.reduce(
      (sum, s) => sum + s.leader_male_count + s.leader_female_count,
      0,
    );

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <h4 className="mb-2 text-xs font-medium leading-relaxed text-muted-foreground">{t("review.event")}</h4>
            <p className="font-medium leading-relaxed text-foreground">{selectedEvent?.name_kh}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <h4 className="mb-2 text-xs font-medium leading-relaxed text-muted-foreground">{t("review.organization")}</h4>
            <p className="font-medium leading-relaxed text-foreground">{selectedOrg?.name_kh}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">{t("review.totalAthletes")}</p>
            <p className="text-2xl font-semibold text-primary">{totalAthletes}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">{t("review.totalLeaders")}</p>
            <p className="text-2xl font-semibold text-primary">{totalLeaders}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium leading-relaxed text-muted-foreground">{t("review.breakdown")}</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted text-xs font-medium leading-relaxed text-muted-foreground">
                  <th className="px-3 py-2.5 text-left">{t("table.sport")}</th>
                  <th className="px-3 py-2.5 text-right">{t("review.athletes")}</th>
                  <th className="px-3 py-2.5 text-right">{t("review.leaders")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {sports.map((sport) => (
                  <tr key={sport.sport_id}>
                    <td className="px-3 py-2.5 font-medium leading-relaxed text-foreground">{sport.sport_name_kh}</td>
                    <td className="px-3 py-2.5 text-right leading-relaxed text-foreground">
                      {sport.athlete_male_count + sport.athlete_female_count}
                      <span className="ml-1 text-xs text-muted-foreground">
                        (M:{sport.athlete_male_count} F:{sport.athlete_female_count})
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right leading-relaxed text-foreground">
                      {sport.leader_male_count + sport.leader_female_count}
                      <span className="ml-1 text-xs text-muted-foreground">
                        (M:{sport.leader_male_count} F:{sport.leader_female_count})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
