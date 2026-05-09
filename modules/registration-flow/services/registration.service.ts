import { api } from '@/core/api/client';
import type { components } from '@/_contract/api.types';

// Backend returns `unknown` for registration responses (contract gap #8).
// We use ParticipantUpdateRequest as the canonical shape and augment with id/role.
export type ParticipantUpdateRequest = components['schemas']['ParticipantUpdateRequest'];
export type ParticipantUpdateBody    = components['schemas']['ParticipantUpdateBody'];
export type ParticipantDeleteBody    = components['schemas']['ParticipantDeleteBody'];
export type PresignUrlResponse       = components['schemas']['PresignUrlResponse'];
export type RoleEnum                 = components['schemas']['RoleEnum'];
export type LeaderRole               = components['schemas']['LeaderRole'];
export type GenderEnum               = components['schemas']['genderEnum'];

// Canonical request body type — now properly documented in OpenAPI
export type ParticipantCreateBody = components['schemas']['ParticipantCreateRequest'];

// Frontend-only participant record shape (response is `unknown` in contract).
export interface ParticipantRecord extends ParticipantUpdateRequest {
  id: number;
  enroll_id?: number;
  role: RoleEnum;
  created_at?: string;
}

export const LEADER_ROLES: LeaderRole[] = [ 'coach', 'manager', 'delegate', 'team_lead', 'coach_trainer', 'teacher_assistant'];

export interface ListRegistrationsParams {
  role:            RoleEnum;
  organization_id?: number | null;
  event_id?:       number | null;
  sport_id?:       number | null;
  search?:         string | null;
  limit?:          number;
  offset?:         number;
}

export async function listRegistrations(
  params: ListRegistrationsParams
): Promise<ParticipantRecord[]> {
  const { data, error } = await api.GET('/api/registration/', { params: { query: params } });
  if (error) throw error;
  // Response is unknown — cast to array; server returns list
  return (data as { data?: ParticipantRecord[] } | ParticipantRecord[] | null)
    ? Array.isArray(data) ? data : ((data as { data?: ParticipantRecord[] }).data ?? [])
    : [];
}

export async function getRegistration(
  enrollId: number,
  role: RoleEnum
): Promise<ParticipantRecord> {
  const { data, error } = await api.GET('/api/registration/{enroll_id}', {
    params: { path: { enroll_id: enrollId }, query: { role } },
  });
  if (error) throw error;
  return data as ParticipantRecord;
}

export async function createRegistration(
  body: ParticipantCreateBody
): Promise<ParticipantRecord> {
  const { data, error } = await api.POST('/api/registration/', { body });
  if (error) throw error;
  return data as ParticipantRecord;
}

export async function updateRegistration(
  body: ParticipantUpdateBody
): Promise<ParticipantRecord> {
  const { data, error } = await api.PATCH('/api/registration/update', { body });
  if (error) throw error;
  return data as ParticipantRecord;
}

export async function deleteRegistration(enrollId: number): Promise<void> {
  const { error } = await api.DELETE('/api/registration/delete', {
    body: { enroll_id: enrollId },
  });
  if (error) throw error;
}

export async function getPresignUrl(): Promise<PresignUrlResponse> {
  const { data, error } = await api.GET('/api/cloudinary/presign-url');
  if (error) throw error;
  return data;
}

// Upload a file directly to Cloudinary using a presigned URL.
// Returns the Cloudinary secure_url.
export async function uploadToCloudinary(
  file: File,
  presign: PresignUrlResponse
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', presign.api_key);
  formData.append('timestamp', String(presign.timestamp));
  formData.append('signature', presign.signature);
  formData.append('folder', presign.folder);
  formData.append('public_id', presign.public_id);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${presign.cloud_name}/image/upload`,
    { method: 'POST', body: formData }
  );
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const json = await res.json() as { secure_url: string };
  return json.secure_url;
}
