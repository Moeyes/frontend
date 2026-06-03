"use client";

import { Badge } from "@/shared";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/ui/select";
import { useTranslations } from "next-intl";
import { Event, EVENT_PHASES, PhaseStatus } from "../types";

/**
 * Compact read-only badges showing each phase's current open/closed state.
 * Used in the event list and detail header.
 */
export function EventPhaseBadges({
  event,
  compact = false,
}: {
  event: Event;
  compact?: boolean;
}) {
  const t = useTranslations("events");
  return (
    <div className="flex flex-wrap gap-1.5">
      {EVENT_PHASES.map((phase) => {
        const open = event[`${phase}_is_open`] ?? false;
        return (
          <Badge
            key={phase}
            variant={open ? "success" : "secondary"}
            className="gap-1 whitespace-nowrap text-[10px]"
          >
            {t(compact ? `phases.${phase}Short` : `phases.${phase}`)}:{" "}
            {open ? t("phases.open") : t("phases.closed")}
          </Badge>
        );
      })}
    </div>
  );
}

/**
 * Full per-phase panel. Shows the computed open/closed state plus, for admins,
 * an inline status selector wired to PATCH /events/{id}/phase.
 */
export function EventPhaseControl({
  event,
  canManage,
  onChange,
}: {
  event: Event;
  canManage: boolean;
  onChange: (phase: (typeof EVENT_PHASES)[number], status: PhaseStatus) => void;
  isPending?: boolean;
}) {
  const t = useTranslations("events");
  return (
    <div className="space-y-2">
      {EVENT_PHASES.map((phase) => {
        const open = event[`${phase}_is_open`] ?? false;
        const status = event[`${phase}_status`] ?? PhaseStatus.AUTO;
        return (
          <div
            key={phase}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-3"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {t(`phases.${phase}`)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("phases.statusLabel")}: {t(`phaseStatus.${status}`)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={open ? "success" : "secondary"}>
                {open ? t("phases.open") : t("phases.closed")}
              </Badge>
              {canManage && (
                <Select
                  value={status}
                  onValueChange={(v) => onChange(phase, v as PhaseStatus)}
                >
                  <SelectTrigger size="sm" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PhaseStatus.AUTO}>
                      {t("phaseStatus.AUTO")}
                    </SelectItem>
                    <SelectItem value={PhaseStatus.OPEN}>
                      {t("phaseStatus.OPEN")}
                    </SelectItem>
                    <SelectItem value={PhaseStatus.CLOSED}>
                      {t("phaseStatus.CLOSED")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
