"use client";

import { useState } from "react";
import { Event, EventType } from "../types";
import { useEvents, useDeleteEvent } from "../hooks";
import { EventForm } from "./EventForm";
import { EventPhaseBadges } from "./EventPhases";
import { Modal, DataTable, Badge, PageHeader, PageEmptyState, PageErrorState, useConfirm } from "@/shared";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/ui/select";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/core/auth";
import { Edit2, Trash2, Plus, Calendar, MapPin, Tag, Eye } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function EventList() {
  const { data: events, isLoading, error } = useEvents();
  const { mutate: deleteEvent } = useDeleteEvent();
  const { role } = useAuth();
  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  const t = useTranslations("events");
  const tCommon = useTranslations("common");
  const confirm = useConfirm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(
    undefined,
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "upcoming" | "ongoing" | "completed"
  >("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  const handleCreate = () => {
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };
  const handleDelete = async (eventId: number) => {
    if (await confirm()) deleteEvent(eventId);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(undefined);
  };

  if (error)
    return (
      <PageErrorState
        title={t("failedToLoad")}
        description={tCommon("connectionError")}
      />
    );

  const getStatus = (event: Event) => {
    const now = new Date();
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "ongoing";
    return "completed";
  };

  const filtered = !events
    ? ([] as Event[])
    : events.filter((ev) => {
        const matchesQuery =
          query.trim() === "" ||
          `${ev.name} ${ev.description ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase());
        const status = getStatus(ev);
        const matchesStatus = statusFilter === "all" || statusFilter === status;
        return matchesQuery && matchesStatus;
      });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={Calendar}
        action={
          isAdmin && (
            <Button onClick={handleCreate} className="h-11 gap-2 px-6">
              <Plus className="w-4 h-4" />
              {t("createEvent")}
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder={t("search") as string}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(
                v as "all" | "upcoming" | "ongoing" | "completed",
              );
              setPage(1);
            }}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue>{t(`statusFilter.${statusFilter}`)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("statusFilter.all")}</SelectItem>
              <SelectItem value="upcoming">
                {t("statusFilter.upcoming")}
              </SelectItem>
              <SelectItem value="ongoing">
                {t("statusFilter.ongoing")}
              </SelectItem>
              <SelectItem value="completed">
                {t("statusFilter.completed")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isLoading && total === 0 ? (
        <PageEmptyState
          icon={Calendar}
          title={t("title")}
          description={t("description")}
          action={
            isAdmin && (
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("createEvent")}
              </Button>
            )
          }
        />
      ) : (
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <DataTable
          isLoading={isLoading}
          data={pageData || []}
          onRowClick={(item: Event) => router.push(`/events/${item.id}`)}
          columns={[
            {
              header: t("columns.eventName"),
              accessor: (event) => (
                <div className="flex flex-col">
                  <span className="font-medium leading-relaxed text-foreground">
                    {event.name}
                  </span>
                  {event.description && (
                    <span className="line-clamp-1 text-xs leading-relaxed text-muted-foreground">
                      {event.description}
                    </span>
                  )}
                </div>
              ),
            },
            {
              header: t("columns.type"),
              accessor: (event) => <TypeBadge type={event.event_type} />,
            },
            {
              header: t("columns.status"),
              accessor: (event) => (
                <Badge
                  variant={
                    getStatus(event) === "upcoming"
                      ? "info"
                      : getStatus(event) === "ongoing"
                        ? "success"
                        : "secondary"
                  }
                  className="whitespace-nowrap"
                >
                  {t(`statusFilter.${getStatus(event)}`)}
                </Badge>
              ),
            },
            {
              header: t("columns.dates"),
              accessor: (event) => (
                <div className="flex flex-col text-xs leading-relaxed text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {event.start_date}
                  </span>
                  <span className="mt-0.5">
                    {tCommon("to")} {event.end_date}
                  </span>
                </div>
              ),
            },
            {
              header: t("phases.title"),
              accessor: (event) => <EventPhaseBadges event={event} compact />,
            },
            {
              header: t("columns.location"),
              accessor: (event) => (
                <div className="flex items-center gap-1.5 text-sm leading-relaxed text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary/60" />
                  {event.location || "N/A"}
                </div>
              ),
            },
            {
              header: tCommon("actions"),
              align: "right",
              accessor: (event) => (
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/events/${event.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  {isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(event.id)}
                        className="text-error hover:text-error hover:bg-error/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
      )}

      {!(!isLoading && total === 0) && (
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm leading-relaxed text-muted-foreground">
            {t("pagination", { page, totalPages, total })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              variant="outline"
              size="sm"
            >
              {tCommon("previous")}
            </Button>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              variant="outline"
              size="sm"
            >
              {tCommon("next")}
            </Button>
          </div>
        </div>
      )}

      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingEvent ? t("editEvent") : t("createNewEvent")}
        >
          <EventForm
            event={editingEvent}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: EventType }) {
  const t = useTranslations("events.types");
  const config: Record<
    string,
    {
      label: string;
      variant: "default" | "info" | "warning" | "success" | "secondary";
    }
  > = {
    [EventType.NATIONAL]: { label: t("NATIONAL"), variant: "default" },
    [EventType.UNIVERSITY]: { label: t("UNIVERSITY"), variant: "info" },
    [EventType.HIGH_SCHOOL]: { label: t("HIGH_SCHOOL"), variant: "warning" },
    [EventType.PRIMARY_SCHOOL]: {
      label: t("PRIMARY_SCHOOL"),
      variant: "success",
    },
  };
  const matched = config[type];
  const label = matched ? matched.label : (type ?? "Unknown");
  const variant = matched ? matched.variant : "secondary";
  return (
    <Badge variant={variant} className="gap-1.5 whitespace-nowrap">
      <Tag className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  );
}
