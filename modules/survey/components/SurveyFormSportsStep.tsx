"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import type { SurveyFormData, Sport } from "../types";

interface SurveyFormSportsStepProps {
  form: UseFormReturn<SurveyFormData>;
  eventSports: Sport[];
}

export function SurveyFormSportsStep({ form, eventSports }: SurveyFormSportsStepProps) {
  const { watch, setValue, trigger, formState } = form;
  const t = useTranslations("survey");

  const selectedSportIds = watch("sportIds") || [];

  if (eventSports.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-sm leading-relaxed text-muted-foreground">
        {t("noSports")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">{t("selectSportsHint")}</p>

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

      {formState.errors.sportIds && (
        <p className="text-sm leading-relaxed text-destructive">
          {formState.errors.sportIds.message}
        </p>
      )}
    </div>
  );
}
