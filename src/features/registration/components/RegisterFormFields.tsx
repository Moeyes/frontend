/**
 * RegisterFormFields Component
 * 
 * Renders registration form fields organized by steps
 * Applies 10 UX Principles with enhanced visual design and icons
 */

'use client';

import { UseFormReturn } from 'react-hook-form';
import { RegisterFormData } from '@/lib/validators/register.schema';
import {
  TextInputField,
  SelectField,
  FileUploadField,
  SelectOption,
} from '@/shared/components/form';
import { uploadPhoto, uploadDocument } from '@/lib/upload/cloudinary';
import {
  CascadingDataLoaded,
  Category,
} from '@/features/registration/services/registration-data.service';
import {
  GENDER_OPTIONS,
  ID_DOCUMENT_OPTIONS,
  ROLE_OPTIONS,
  LEADER_ROLE_OPTIONS,
} from '@/config/constants';
import {
  Calendar,
  Phone,
  Globe,
  MapPin,
  User,
  Trophy,
  Building2,
  Info,
  CheckCircle2,
  Camera,
  FileText,
  Users,
} from 'lucide-react';

type FormStep = 'event' | 'personal' | 'documents' | 'review';

interface RegisterFormFieldsProps {
  form: UseFormReturn<RegisterFormData>;
  cascadingData: CascadingDataLoaded | null;
  categories: Category[];
  step: FormStep;
}

// Helper component for review fields
const ReviewField = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex flex-col">
    <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">{label}</p>
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
  const { control, formState, watch } = form;
  const selectedRole = watch('role');
  const selectedEventType = watch('eventType');
  const selectedEventId = watch('eventId');
  const selectedOrgId = watch('organizationId');
  const selectedSportId = watch('sportId');

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
    label: c.category_name,
  })) || [];

  // ─── STEP 1: EVENT SELECTION ───────────────────────────────────────

  if (step === 'event') {
    return (
      <div className="space-y-6">
        {/* Required fields legend */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-lg border border-border">
          <span className="font-medium">Required fields are marked with</span>
          <span className="text-error font-bold">*</span>
        </div>

        {/* Event Type */}
        <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Event Selection</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Trophy className="w-4 h-4 text-primary" />
              Event Type <span className="text-error font-bold">*</span>
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

          {selectedEventType && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                Event <span className="text-error font-bold">*</span>
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
          )}
        </div>

        {/* Organization & Sport */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {selectedEventId && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Building2 className="w-4 h-4 text-primary" />
                Organization <span className="text-error font-bold">*</span>
              </label>
              <SelectField
                control={control}
                name="organizationId"
                label=""
                placeholder="Select an organization"
                options={orgOptions}
                required
                error={formState.errors.organizationId?.message}
              />
            </div>
          )}

          {selectedOrgId && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Trophy className="w-4 h-4 text-primary" />
                Sport <span className="text-error font-bold">*</span>
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
          )}
        </div>

        {/* Category */}
        {selectedSportId && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Users className="w-4 h-4 text-primary" />
              Category
            </label>
            <SelectField
              control={control}
              name="categoryId"
              label=""
              placeholder={categoryOptions.length === 0 ? 'No categories available' : 'Select a category'}
              options={categoryOptions}
              required={false}
              error={formState.errors.categoryId?.message}
            />
          </div>
        )}
      </div>
    );
  }

  // ─── STEP 2: PERSONAL INFORMATION ────────────────────────────────────

  if (step === 'personal') {
    return (
      <div className="space-y-7">
        {/* Required fields legend */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-lg border border-border">
          <span className="font-medium">Required fields are marked with</span>
          <span className="text-error font-bold">*</span>
        </div>

        {/* Khmer Name Section */}
        <div>
          <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Full Name (Khmer)</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <User className="w-4 h-4 text-primary" />
                Family Name <span className="text-error font-bold">*</span>
              </label>
              <TextInputField
                control={control}
                name="khFamilyName"
                label=""
                placeholder="គ្រាម"
                required
                lang="km"
                error={formState.errors.khFamilyName?.message}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <User className="w-4 h-4 text-primary" />
                Given Name <span className="text-error font-bold">*</span>
              </label>
              <TextInputField
                control={control}
                name="khGivenName"
                label=""
                placeholder="នាម"
                required
                lang="km"
                error={formState.errors.khGivenName?.message}
              />
            </div>
          </div>
        </div>

        {/* English Name Section */}
        <div>
          <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Full Name (English)</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <User className="w-4 h-4 text-primary" />
                Family Name <span className="text-error font-bold">*</span>
              </label>
              <TextInputField
                control={control}
                name="enFamilyName"
                label=""
                placeholder="Last Name"
                required
                error={formState.errors.enFamilyName?.message}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <User className="w-4 h-4 text-primary" />
                Given Name <span className="text-error font-bold">*</span>
              </label>
              <TextInputField
                control={control}
                name="enGivenName"
                label=""
                placeholder="First Name"
                required
                error={formState.errors.enGivenName?.message}
              />
            </div>
          </div>
        </div>

        {/* Personal Details Section */}
        <div>
          <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Personal Details</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Users className="w-4 h-4 text-primary" />
                Gender <span className="text-error font-bold">*</span>
              </label>
              <SelectField
                control={control}
                name="gender"
                label=""
                placeholder="Select gender"
                options={GENDER_OPTIONS as unknown as SelectOption[]}
                required
                error={formState.errors.gender?.message}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                Date of Birth <span className="text-error font-bold">*</span>
              </label>
              <TextInputField
                control={control}
                name="dateOfBirth"
                label=""
                type="date"
                required
                error={formState.errors.dateOfBirth?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Phone className="w-4 h-4 text-primary" />
                Phone Number <span className="text-error font-bold">*</span>
              </label>
              <TextInputField
                control={control}
                name="phone"
                label=""
                type="tel"
                placeholder="012345678"
                required
                error={formState.errors.phone?.message}
              />
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>7–15 digits required</span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Globe className="w-4 h-4 text-primary" />
                Nationality <span className="text-error font-bold">*</span>
              </label>
              <TextInputField
                control={control}
                name="nationality"
                label=""
                placeholder="Cambodian"
                required
                error={formState.errors.nationality?.message}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              Address (Optional)
            </label>
            <TextInputField
              control={control}
              name="address"
              label=""
              placeholder="Street address"
              error={formState.errors.address?.message}
            />
          </div>

          {/* Role Section */}
          <div className="mt-8">
            <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary flex items-center gap-2">
                <Users className="w-4 h-4" /> Role Information
              </h3>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Users className="w-4 h-4 text-primary" />
                Role <span className="text-error font-bold">*</span>
              </label>
              <SelectField
                control={control}
                name="role"
                label=""
                placeholder="Select role"
                options={ROLE_OPTIONS as unknown as SelectOption[]}
                required
                error={formState.errors.role?.message}
              />
            </div>

            {selectedRole === 'Leader' && (
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  Leader Role <span className="text-error font-bold">*</span>
                </label>
                <SelectField
                  control={control}
                  name="leaderRole"
                  label=""
                  placeholder="Select your role"
                  options={LEADER_ROLE_OPTIONS as unknown as SelectOption[]}
                  required
                  error={formState.errors.leaderRole?.message}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 3: DOCUMENTS ───────────────────────────────────────────────

  if (step === 'documents') {
    const idDocType = form.watch('idDocumentType');
    const uploadPhotoFlag = form.watch('_uploadPhoto') || false;
    const uploadIdFlag = form.watch('_uploadId') || false;
    const uploadBirthFlag = form.watch('_uploadBirth') || false;
    const uploadPassportFlag = form.watch('_uploadPassport') || false;

    return (
      <div className="space-y-7">
        {/* Required fields legend */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-lg border border-border">
          <span className="font-medium">Required fields are marked with</span>
          <span className="text-error font-bold">*</span>
        </div>

        {/* Profile Photo Section */}
        <div>
          <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary flex items-center gap-2">
              <Camera className="w-4 h-4" /> Profile Photo
            </h3>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-primary/5 transition-colors">
            <input
              type="checkbox"
              checked={uploadPhotoFlag}
              onChange={(e) => form.setValue('_uploadPhoto', e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-primary"
            />
            <span className="text-sm font-medium text-foreground">Upload Profile Photo (JPG, PNG, WebP • Max 2MB)</span>
          </label>

          {uploadPhotoFlag && (
            <div className="mt-4">
              <FileUploadField
                control={control}
                name="photoPath"
                label="Profile Photo"
                accept="image/jpeg,image/png,image/webp"
                maxSize={2}
                error={formState.errors.photoPath?.message}
                onUpload={uploadPhoto}
              />
            </div>
          )}
        </div>

        {/* Identification Document Section */}
        <div>
          <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary flex items-center gap-2">
              <FileText className="w-4 h-4" /> Identification Document
            </h3>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <FileText className="w-4 h-4 text-primary" />
              Document Type <span className="text-error font-bold">*</span>
            </label>
            <SelectField
              control={control}
              name="idDocumentType"
              label=""
              placeholder="Select document type"
              options={ID_DOCUMENT_OPTIONS as unknown as SelectOption[]}
              required
              error={formState.errors.idDocumentType?.message}
            />
          </div>

          {idDocType && (
            <>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-primary/5 transition-colors">
                <input
                  type="checkbox"
                  checked={uploadIdFlag}
                  onChange={(e) => form.setValue('_uploadId', e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-primary"
                />
                <span className="text-sm font-medium text-foreground">
                  Upload {idDocType === 'IDCard' ? 'ID Card' : idDocType === 'BirthCertificate' ? 'Birth Certificate' : idDocType === 'Passport' ? 'Passport' : 'Family Book'} (JPG, PNG, PDF • Max 5MB)
                </span>
              </label>

              {uploadIdFlag && (
                <div className="mt-4">
                  <FileUploadField
                    control={control}
                    name="nationalIdPath"
                    label={`${idDocType} Document`}
                    accept="image/jpeg,image/png,.pdf"
                    maxSize={5}
                    error={formState.errors.nationalIdPath?.message}
                    onUpload={uploadDocument}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Additional Documents Section */}
        <div>
          <div className="border-l-4 border-primary pl-3 py-2 bg-primary/10 rounded-r-lg mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary flex items-center gap-2">
              <FileText className="w-4 h-4" /> Additional Documents (Optional)
            </h3>
          </div>

          <div className="space-y-3">
            {/* Birth Certificate */}
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ pointerEvents: idDocType === 'BirthCertificate' ? 'none' : 'auto', opacity: idDocType === 'BirthCertificate' ? 0.5 : 1 }}>
              <input
                type="checkbox"
                checked={uploadBirthFlag}
                onChange={(e) => form.setValue('_uploadBirth', e.target.checked)}
                disabled={idDocType === 'BirthCertificate'}
                className="w-4 h-4 rounded cursor-pointer accent-primary"
              />
              <span className="text-sm font-medium text-foreground">
                Birth Certificate {idDocType === 'BirthCertificate' ? '(Already selected)' : '(JPG, PNG, PDF • Max 5MB)'}
              </span>
            </label>

            {uploadBirthFlag && idDocType !== 'BirthCertificate' && (
              <div className="ml-7 mt-2">
                <FileUploadField
                  control={control}
                  name="birthCertificatePath"
                  label="Birth Certificate"
                  accept="image/jpeg,image/png,.pdf"
                  maxSize={5}
                  error={formState.errors.birthCertificatePath?.message}
                  onUpload={uploadDocument}
                />
              </div>
            )}

            {/* Passport */}
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-primary/5 transition-colors" style={{ pointerEvents: idDocType === 'Passport' ? 'none' : 'auto', opacity: idDocType === 'Passport' ? 0.5 : 1 }}>
              <input
                type="checkbox"
                checked={uploadPassportFlag}
                onChange={(e) => form.setValue('_uploadPassport', e.target.checked)}
                disabled={idDocType === 'Passport'}
                className="w-4 h-4 rounded cursor-pointer accent-primary"
              />
              <span className="text-sm font-medium text-foreground">
                Passport {idDocType === 'Passport' ? '(Already selected)' : '(JPG, PNG, PDF • Max 5MB)'}
              </span>
            </label>

            {uploadPassportFlag && idDocType !== 'Passport' && (
              <div className="ml-7 mt-2">
                <FileUploadField
                  control={control}
                  name="passportPath"
                  label="Passport"
                  accept="image/jpeg,image/png,.pdf"
                  maxSize={5}
                  error={formState.errors.passportPath?.message}
                  onUpload={uploadDocument}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    );
  }

  // ─── STEP 4: REVIEW ─────────────────────────────────────────────────

  if (step === 'review') {
    const formData = form.getValues();

    return (
      <div className="space-y-6">
        {/* Event Details Card */}
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-white" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Event Details</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ReviewField
                label="Event Type"
                value={formData.eventType}
              />
              <ReviewField
                label="Event"
                value={eventOptions.find((o) => o.value === String(formData.eventId))?.label}
              />
              <ReviewField
                label="Organization"
                value={orgOptions.find((o) => o.value === String(formData.organizationId))?.label}
              />
              <ReviewField
                label="Sport"
                value={sportOptions.find((o) => o.value === String(formData.sportId))?.label}
              />
              {formData.categoryId && (
                <ReviewField
                  label="Category"
                  value={categoryOptions.find((o) => o.value === String(formData.categoryId))?.label}
                />
              )}
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center gap-3">
            <User className="w-5 h-5 text-white" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Personal Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ReviewField
                label="Khmer Name"
                value={`${formData.khFamilyName} ${formData.khGivenName}`}
              />
              <ReviewField
                label="English Name"
                value={`${formData.enFamilyName} ${formData.enGivenName}`}
              />
              <ReviewField
                label="Gender"
                value={formData.gender}
              />
              <ReviewField
                label="Date of Birth"
                value={formData.dateOfBirth}
              />
              <ReviewField
                label="Phone"
                value={formData.phone}
              />
              <ReviewField
                label="Nationality"
                value={formData.nationality}
              />
              {formData.address && (
                <div className="sm:col-span-2">
                  <ReviewField
                    label="Address"
                    value={formData.address}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Role & Documents Card */}
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-white" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Role & Documents</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ReviewField
                label="Role"
                value={formData.role}
              />
              {formData.role === 'Leader' && (
                <ReviewField
                  label="Leader Role"
                  value={formData.leaderRole}
                />
              )}
              <ReviewField
                label="ID Document Type"
                value={formData.idDocumentType}
              />

              {/* Uploaded Documents Status */}
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">Uploaded Documents</p>
                <div className="flex flex-wrap gap-2">
                  {formData.photoPath && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/30 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">Profile Photo</span>
                    </div>
                  )}
                  {formData.nationalIdPath && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/30 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">{formData.idDocumentType}</span>
                    </div>
                  )}
                  {formData.birthCertificatePath && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/30 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">Birth Certificate</span>
                    </div>
                  )}
                  {formData.passportPath && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/30 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">Passport</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
