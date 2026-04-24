/**
 * RegisterFormFields Component
 * 
 * Renders registration form fields organized by steps
 */

'use client';

import { UseFormReturn } from 'react-hook-form';
import { RegisterFormData, RegisterFormInput } from '../services/schema';
import {
  TextInputField,
  SelectField,
  FileUploadField,
  SelectOption,
} from '@/shared/form';
import { uploadPhoto, uploadDocument } from '@/core/lib/upload/cloudinary';
import {
  type CascadingDataLoaded,
  type CategoryReference as Category,
} from '@/core/lib/reference-data';
import {
  GENDER_OPTIONS,
  ID_DOCUMENT_OPTIONS,
  ROLE_OPTIONS,
  LEADER_ROLE_OPTIONS,
} from '@/core/config/constants';
import {
  Calendar,
  User,
  Trophy,
  Building2,
  CheckCircle2,
  Camera,
  Users,
} from 'lucide-react';
import { useAuth, UserRole } from '@/core/auth';

type FormStep = 'event' | 'category' | 'personal' | 'documents' | 'review';

interface RegisterFormFieldsProps {
  form: UseFormReturn<RegisterFormInput, unknown, RegisterFormData>;
  cascadingData: CascadingDataLoaded | null;
  categories: Category[];
  step: FormStep;
}

// Helper component for review fields
const ReviewField = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex flex-col">
    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{label}</p>
    <p className="text-sm font-semibold text-foreground">{value || 'Not provided'}</p>
  </div>
);

/**
 * Renders form fields organized by step
 */
export function RegisterFormFields({
  form,
  cascadingData,
  categories,
  step,
}: RegisterFormFieldsProps) {
  const { user } = useAuth();
  const { control, formState, watch } = form;
  const selectedRole = watch('role');
  const selectedEventType = watch('eventType');

  const isAdmin = user?.role === UserRole.ADMIN;

  // Event Type options
  const eventTypeOptions: SelectOption[] = cascadingData?.eventTypes.map((type) => ({
    value: type,
    label: type,
  })) || [];

  // Filter events by selected event type
  const filteredEvents = selectedEventType
    ? cascadingData?.events.filter((e) => e.type === selectedEventType) || []
    : [];

  const eventOptions: SelectOption[] = filteredEvents.map((e) => ({
    value: String(e.id),
    label: e.name_kh || e.name_en || `Event ${e.id}`,
  })) || [];

  const orgOptions: SelectOption[] = cascadingData?.organizations.map((o) => ({
    value: String(o.id),
    label: o.name_kh || o.name_en || `Org ${o.id}`,
  })) || [];

  const sportOptions: SelectOption[] = cascadingData?.sports.map((s) => ({
    value: String(s.id),
    label: s.name_kh || s.name_en || `Sport ${s.id}`,
  })) || [];

  const categoryOptions: SelectOption[] = categories.map((c) => ({
    value: String(c.id),
    label: c.category,
  })) || [];

  // ─── STEP 1: EVENT & SPORT ──────────────────────────────────────────

  if (step === 'event') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
              <Trophy className="w-4 h-4 text-primary" />
              Event Type <span className="text-error">*</span>
            </label>
            <SelectField
              control={control}
              name="eventType"
              label=""
              placeholder="Select an event type"
              options={eventTypeOptions}
              required
              error={formState.errors.eventType?.message}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              Event <span className="text-error">*</span>
            </label>
            <SelectField
              control={control}
              name="eventId"
              label=""
              placeholder="Select an event"
              options={eventOptions}
              required
              error={formState.errors.eventId?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
              <Building2 className="w-4 h-4 text-primary" />
              Organization <span className="text-error">*</span>
            </label>
            <SelectField
              control={control}
              name="organizationId"
              label=""
              placeholder="Select an organization"
              options={orgOptions}
              required
              disabled={!isAdmin} // Disabled for Province (user1)
              error={formState.errors.organizationId?.message}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
              <Trophy className="w-4 h-4 text-primary" />
              Sport <span className="text-error">*</span>
            </label>
            <SelectField
              control={control}
              name="sportId"
              label=""
              placeholder="Select a sport"
              options={sportOptions}
              required
              error={formState.errors.sportId?.message}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 2: CATEGORY ───────────────────────────────────────────────

  if (step === 'category') {
    return (
      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
            <Users className="w-4 h-4 text-primary" />
            Category <span className="text-error">*</span>
          </label>
          <SelectField
            control={control}
            name="categoryId"
            label=""
            placeholder={categoryOptions.length === 0 ? 'No categories available' : 'Select a category'}
            options={categoryOptions}
            required
            error={formState.errors.categoryId?.message}
          />
        </div>
      </div>
    );
  }

  // ─── STEP 3: PERSONAL INFO ──────────────────────────────────────────

  if (step === 'personal') {
    return (
      <div className="space-y-8">
        {/* Names */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Full Name (Khmer)</h3>
            <div className="grid grid-cols-2 gap-4">
              <TextInputField control={control} name="khFamilyName" label="Family Name *" placeholder="គ្រាម" required lang="km" />
              <TextInputField control={control} name="khGivenName" label="Given Name *" placeholder="នាម" required lang="km" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Full Name (English)</h3>
            <div className="grid grid-cols-2 gap-4">
              <TextInputField control={control} name="enFamilyName" label="Family Name *" placeholder="Last Name" required />
              <TextInputField control={control} name="enGivenName" label="Given Name *" placeholder="First Name" required />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <SelectField control={control} name="gender" label="Gender *" options={[...GENDER_OPTIONS]} required />
          <TextInputField control={control} name="dateOfBirth" label="Date of Birth *" type="date" required />
          <TextInputField control={control} name="phone" label="Phone Number *" placeholder="012345678" required />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextInputField control={control} name="nationality" label="Nationality *" placeholder="Cambodian" required />
          <SelectField control={control} name="idDocumentType" label="ID Type *" options={[...ID_DOCUMENT_OPTIONS]} required />
        </div>

        <TextInputField control={control} name="address" label="Address (Optional)" placeholder="Street address" />

        {/* Role */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <SelectField control={control} name="role" label="Role *" options={[...ROLE_OPTIONS]} required />
            {selectedRole === 'leader' && (
              <SelectField control={control} name="leaderRole" label="Leader Role *" options={[...LEADER_ROLE_OPTIONS]} required />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 4: PHOTO UPLOAD ───────────────────────────────────────────

  if (step === 'documents') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-secondary/20">
          <Camera className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">Profile Photo</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Upload a clear passport-style photo. Max 2MB.
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FileUploadField
            control={control}
            name="nationalIdPath"
            label="ID Document"
            accept="image/*,.pdf"
            maxSize={5}
            onUpload={uploadDocument}
          />
          <FileUploadField
            control={control}
            name="birthCertificatePath"
            label="Birth Certificate"
            accept="image/*,.pdf"
            maxSize={5}
            onUpload={uploadDocument}
          />
        </div>
      </div>
    );
  }

  // ─── STEP 5: REVIEW ─────────────────────────────────────────────────

  if (step === 'review') {
    const formData = form.getValues();

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Event Details
            </h3>
            <div className="bg-secondary/30 p-4 rounded-xl space-y-3">
              <ReviewField label="Event" value={eventOptions.find(o => o.value === String(formData.eventId))?.label} />
              <ReviewField label="Organization" value={orgOptions.find(o => o.value === String(formData.organizationId))?.label} />
              <ReviewField label="Sport" value={sportOptions.find(o => o.value === String(formData.sportId))?.label} />
              <ReviewField label="Category" value={categoryOptions.find(o => o.value === String(formData.categoryId))?.label} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Info
            </h3>
            <div className="bg-secondary/30 p-4 rounded-xl space-y-3">
              <ReviewField label="Khmer Name" value={`${formData.khFamilyName} ${formData.khGivenName}`} />
              <ReviewField label="English Name" value={`${formData.enFamilyName} ${formData.enGivenName}`} />
              <ReviewField label="Gender" value={formData.gender} />
              <ReviewField label="Phone" value={formData.phone} />
              <ReviewField label="Role" value={formData.role === 'leader' ? `Leader (${formData.leaderRole})` : 'Athlete'} />
            </div>
          </div>
        </div>

        {formData.photoPath && (
          <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-bold text-success">Profile photo uploaded successfully</span>
          </div>
        )}
      </div>
    );
  }

  return null;
}
