import { apiClient } from '@/core/api/client'
import type { ExampleCreateForm } from './schema'

// Replace these with real paths from _contract/api.types.ts
// type ExampleListResponse = paths['/api/MODULE/']['get']['responses']['200']['content']['application/json']
// type ExamplePublic = ExampleListResponse['data'][number]

export async function listExamples(params?: { page?: number; limit?: number }) {
  return apiClient<{ data: unknown[]; count: number }>(
    'GET', '/api/MODULE/', { params: params as Record<string, string> }
  )
}

export async function getExample(id: number) {
  return apiClient<unknown>('GET', `/api/MODULE/${id}`)
}

export async function createExample(body: ExampleCreateForm) {
  return apiClient<unknown>('POST', '/api/MODULE/', { body })
}

export async function updateExample(id: number, body: Partial<ExampleCreateForm>) {
  return apiClient<unknown>('PATCH', `/api/MODULE/${id}`, { body })
}

export async function deleteExample(id: number) {
  return apiClient<void>('DELETE', '/api/MODULE/delete', { body: { id } })
}
