"use client";

import { useState } from "react";
import { Event, EventType } from "../types";
import { useEvents, useDeleteEvent } from "../hooks";
import { EventForm } from "./EventForm";
import { Modal, DataTable, Badge, PageHeader } from "@/shared";
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
  const isAdmin = role === UserRole.ADMIN;
  const t = useTranslations("events");
  const tCommon = useTranslations("common");

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
  const handleDelete = (eventId: number) => {
    if (window.confirm(tCommon("confirm"))) deleteEvent(eventId);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(undefined);
  };

  if (error)
    return (
      <div className="rounded-2xl border border-error/20 bg-error/5 p-12 text-center">
        <p className="font-black text-error">{t("failedToLoad")}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {tCommon("connectionError")}
        </p>
      </div>
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

      <div className="flex items-center gap-3">
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
        <div className="w-48">
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
              <SelectValue>{t("statusFilter.all")}</SelectValue>
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

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <DataTable
          isLoading={isLoading}
          data={pageData || []}
          onRowClick={(item: Event) => router.push(`/events/${item.id}`)}
          columns={[
            {
              header: t("columns.eventName"),
              accessor: (event) => (
                <div className="flex flex-col">
                  <span className="font-black text-foreground">
                    {event.name}
                  </span>
                  {event.description && (
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
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
                  className="gap-1.5 whitespace-nowrap"
                >
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {t(`statusFilter.${getStatus(event)}`)}
                  </span>
                </Badge>
              ),
            },
            {
              header: t("columns.dates"),
              accessor: (event) => (
                <div className="flex flex-col text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Calendar className="w-3 h-3 text-primary" />
                    {event.start_date}
                  </span>
                  <span className="mt-0.5 opacity-60">
                    {tCommon("to")} {event.end_date}
                  </span>
                </div>
              ),
            },
            {
              header: t("registerWindow"),
              accessor: (event) => (
                <div className="flex flex-col text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {event.open_register_date || event.close_register_date ? (
                    <>
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Calendar className="w-3 h-3 text-success" />
                        {event.open_register_date ?? "—"}
                      </span>
                      <span className="mt-0.5 opacity-60">
                        {tCommon("to")} {event.close_register_date ?? "—"}
                      </span>
                    </>
                  ) : (
                    <span className="opacity-40">{t("notSet")}</span>
                  )}
                </div>
              ),
            },
            {
              header: t("columns.location"),
              accessor: (event) => (
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <MapPin className="w-3 h-3 text-primary/50" />
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

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {t("pagination", { page, totalPages, total })}
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            variant="outline"
          >
            Prev
          </Button>
          <Button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

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
      <Tag className="w-3 h-3" />
      <span className="text-[10px] font-black uppercase tracking-tight">
        {label}
      </span>
    </Badge>
  );
}
