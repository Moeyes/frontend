"use client";

import { UseFormReturn } from "react-hook-form";
import { RegisterFormData, RegisterFormInput } from "../services/schema";
import {
  TextInputField,
  SelectField,
  FileUploadField,
  SelectOption,
} from "@/shared/form";
import { uploadPhoto, uploadDocument } from "@/core/lib/upload/cloudinary";
import {
  type CascadingDataLoaded,
  type CategoryReference as Category,
} from "@/core/lib/reference-data";
import {
  GENDER_OPTIONS,
  ID_DOCUMENT_OPTIONS,
  ROLE_OPTIONS,
  LEADER_ROLE_OPTIONS,
} from "@/core/config/constants";
import {
  Calendar,
  User,
  Trophy,
  Building2,
  CheckCircle2,
  Camera,
  Users,
  AlertCircle,
} from "lucide-react";
import { useAuth, UserRole } from "@/core/auth";
import { useTranslations } from "next-intl";
import { eventsService } from "@/modules/events/services";
import { useEffect, useState } from "react";

type FormStep = "event" | "category" | "personal" | "documents" | "review";

interface RegisterFormFieldsProps {
  form: UseFormReturn<RegisterFormInput, unknown, RegisterFormData>;
  cascadingData: CascadingDataLoaded | null;
  categories: Category[];
  step: FormStep;
  mode?: "athlete" | "leader";
}

const ReviewField = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <div className="flex flex-col">
    <p className="mb-1 text-xs font-medium leading-relaxed text-muted-foreground">
      {label}
    </p>
    <p className="text-sm font-medium leading-relaxed text-foreground">{value || "—"}</p>
  </div>
);

export function RegisterFormFields({
  form,
  cascadingData,
  categories,
  step,
  mode = "athlete",
}: RegisterFormFieldsProps) {
  const isLeader = mode === "leader";
  const { user } = useAuth();
  const { control, formState, watch } = form;
  const t = useTranslations("registration.fields");
  const tReview = useTranslations("registration.review");
  const selectedRole = watch("role");
  const selectedEventType = watch("eventType");
  // Staff who may register on behalf of any organization (and thus pick the org).
  // Plain organization users have their org auto-filled and locked.
  const isAdmin =
    user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

  const eventTypeOptions: SelectOption[] =
    cascadingData?.eventTypes.map((type) => ({ value: type, label: type })) ||
    [];
  const filteredEvents = selectedEventType
    ? cascadingData?.events.filter((e) => e.type === selectedEventType) || []
    : [];
  const eventOptions: SelectOption[] = filteredEvents.map((e) => ({
    value: String(e.id),
    label: e.name_kh || e.name_en || 'Event',
  }));
  const orgOptions: SelectOption[] =
    cascadingData?.organizations.map((o) => ({
      value: String(o.id),
      label: o.name_kh || o.name_en || 'Organization',
    })) || [];
  const sportOptions: SelectOption[] =
    cascadingData?.sports.map((s) => ({
      value: String(s.id),
      label: s.name_kh || s.name_en || 'Sport',
    })) || [];
  const categoryOptions: SelectOption[] = categories.map((c) => ({
    value: String(c.id),
    label: c.category,
  }));

  if (step === "event") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Trophy className="w-4 h-4 text-primary" />
              {t("eventType")} <span className="text-destructive">*</span>
            </label>
            <SelectField
              control={control}
              name="eventType"
              label=""
              placeholder={t("selectEventType")}
              options={eventTypeOptions}
              required
              error={formState.errors.eventType?.message}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              {t("event")} <span className="text-destructive">*</span>
            </label>
            <SelectField
              control={control}
              name="eventId"
              label=""
              placeholder={t("selectEvent")}
              options={eventOptions}
              required
              error={formState.errors.eventId?.message}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Building2 className="w-4 h-4 text-primary" />
              {t("organization")} <span className="text-destructive">*</span>
            </label>
            <SelectField
              control={control}
              name="organizationId"
              label=""
              placeholder={t("selectOrganization")}
              options={orgOptions}
              required
              disabled={!isAdmin}
              error={formState.errors.organizationId?.message}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Trophy className="w-4 h-4 text-primary" />
              {t("sport")} <span className="text-destructive">*</span>
            </label>
            <SelectField
              control={control}
              name="sportId"
              label=""
              placeholder={t("selectSport")}
              options={sportOptions}
              required
              error={formState.errors.sportId?.message}
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === "category") {
    return (
      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
            <Users className="w-4 h-4 text-primary" />
            {t("category")} <span className="text-destructive">*</span>
          </label>
          <SelectField
            control={control}
            name="categoryId"
            label=""
            placeholder={
              categoryOptions.length === 0
                ? t("noCategories")
                : t("selectCategory")
            }
            options={categoryOptions}
            required
            error={formState.errors.categoryId?.message}
          />
        </div>
      </div>
    );
  }

  if (step === "personal") {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-snug text-foreground">
              {t("fullNameKhmer")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <TextInputField
                control={control}
                name="khFamilyName"
                label={t("familyName")}
                placeholder="គ្រាម"
                required
                lang="km"
              />
              <TextInputField
                control={control}
                name="khGivenName"
                label={t("givenName")}
                placeholder="នាម"
                required
                lang="km"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-snug text-foreground">
              {t("fullNameEnglish")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <TextInputField
                control={control}
                name="enFamilyName"
                label={t("familyName")}
                placeholder="Last Name"
                required
              />
              <TextInputField
                control={control}
                name="enGivenName"
                label={t("givenName")}
                placeholder="First Name"
                required
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <SelectField
            control={control}
            name="gender"
            label={t("gender")}
            options={[...GENDER_OPTIONS]}
            required
          />
          <TextInputField
            control={control}
            name="dateOfBirth"
            label={t("dateOfBirth")}
            type="date"
            required
          />
          <TextInputField
            control={control}
            name="phone"
            label={t("phone")}
            placeholder="012345678"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextInputField
            control={control}
            name="nationality"
            label={t("nationality")}
            placeholder={t("nationalityPlaceholder")}
            required
          />
          <SelectField
            control={control}
            name="idDocumentType"
            label={t("idType")}
            options={[...ID_DOCUMENT_OPTIONS]}
            required
          />
        </div>
        <TextInputField
          control={control}
          name="address"
          label={t("address")}
          placeholder={t("addressPlaceholder")}
        />
        <div className="pt-4 border-t border-border">
          {isLeader ? (
            // Leader registration: role is fixed to "leader", so only the
            // specific leader role (coach, manager, …) needs to be chosen.
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-relaxed text-foreground">
                  {t("role")}
                </label>
                <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  {ROLE_OPTIONS.find((o) => o.value === "leader")?.label ??
                    "Leader"}
                </div>
              </div>
              <SelectField
                control={control}
                name="leaderRole"
                label={t("leaderRole")}
                options={[...LEADER_ROLE_OPTIONS]}
                required
                error={formState.errors.leaderRole?.message}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <SelectField
                control={control}
                name="role"
                label={t("role")}
                options={[...ROLE_OPTIONS]}
                required
              />
              {selectedRole === "leader" && (
                <SelectField
                  control={control}
                  name="leaderRole"
                  label={t("leaderRole")}
                  options={[...LEADER_ROLE_OPTIONS]}
                  required
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "documents") {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 p-8">
          <Camera className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-base font-semibold leading-snug text-foreground">
            {t("profilePhoto")}
          </h3>
          <p className="mb-6 text-center text-sm leading-relaxed text-muted-foreground">
            {t("photoUploadDesc")}
          </p>
          <div className="w-full max-w-sm">
            <FileUploadField
              control={control}
              name="photoPath"
              label=""
              accept="image/*"
              maxSize={2}
              onUpload={uploadPhoto}
              required
              error={formState.errors.photoPath?.message}
            />
          </div>
        </div>
        <div>
          {/* Display required document message if athlete is under 18 at event date */}
          <Under18Note form={form} />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FileUploadField
              control={control}
              name="nationalIdPath"
              label={t("idDocument")}
              accept="image/*,.pdf"
              maxSize={5}
              onUpload={uploadDocument}
            />
            <FileUploadField
              control={control}
              name="birthCertificatePath"
              label={t("birthCertificate")}
              accept="image/*,.pdf"
              maxSize={5}
              onUpload={uploadDocument}
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === "review") {
    const formData = form.getValues();
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold leading-snug text-foreground">
              <Trophy className="h-4 w-4 text-primary" />
              {tReview("eventDetails")}
            </h3>
            <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
              <ReviewField
                label={t("event")}
                value={
                  eventOptions.find((o) => o.value === String(formData.eventId))
                    ?.label
                }
              />
              <ReviewField
                label={t("organization")}
                value={
                  orgOptions.find(
                    (o) => o.value === String(formData.organizationId),
                  )?.label
                }
              />
              <ReviewField
                label={t("sport")}
                value={
                  sportOptions.find((o) => o.value === String(formData.sportId))
                    ?.label
                }
              />
              {!isLeader && (
                <ReviewField
                  label={t("category")}
                  value={
                    categoryOptions.find(
                      (o) => o.value === String(formData.categoryId),
                    )?.label
                  }
                />
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold leading-snug text-foreground">
              <User className="h-4 w-4 text-primary" />
              {tReview("personalInfo")}
            </h3>
            <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
              <ReviewField
                label={tReview("khmerName")}
                value={`${formData.khFamilyName} ${formData.khGivenName}`}
              />
              <ReviewField
                label={tReview("englishName")}
                value={`${formData.enFamilyName} ${formData.enGivenName}`}
              />
              <ReviewField label={tReview("gender")} value={formData.gender} />
              <ReviewField label={tReview("phone")} value={formData.phone} />
              <ReviewField
                label={tReview("role")}
                value={
                  formData.role === "leader"
                    ? tReview("leader", {
                        leaderRole: formData.leaderRole || "",
                      })
                    : tReview("athlete")
                }
              />
            </div>
          </div>
        </div>
        {formData.photoPath && (
          <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/10 p-4">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="text-sm font-medium leading-relaxed text-success">
              {t("photoUploaded")}
            </span>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function Under18Note({
  form,
}: {
  form: UseFormReturn<RegisterFormInput, unknown, RegisterFormData>;
}) {
  const [ageAtEvent, setAgeAtEvent] = useState<number | null>(null);
  const eventId = form.watch("eventId");
  const dob = form.watch("dateOfBirth");
  const t = useTranslations("registration.fields");

  useEffect(() => {
    let active = true;
    if (!dob || !eventId) return;
    (async () => {
      try {
        const event = await eventsService.getEventById(Number(eventId));
        if (!active) return;
        const evDateStr =
          (event as { start_date?: string }).start_date ||
          new Date().toISOString();
        const birth = new Date(dob);
        const evDate = new Date(evDateStr);
        let age = evDate.getFullYear() - birth.getFullYear();
        if (
          evDate.getMonth() < birth.getMonth() ||
          (evDate.getMonth() === birth.getMonth() &&
            evDate.getDate() < birth.getDate())
        )
          age--;
        setAgeAtEvent(age);
      } catch {
        // ignore errors silently
      }
    })();
    return () => {
      active = false;
    };
  }, [dob, eventId, form]);

  if (ageAtEvent === null) return null;
  if (ageAtEvent < 18) {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p className="text-sm font-medium leading-relaxed text-foreground">
          {t("under18BirthCert")}
        </p>
      </div>
    );
  }
  return null;
}
