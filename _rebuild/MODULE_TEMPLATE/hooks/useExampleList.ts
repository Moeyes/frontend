import { useQuery } from '@tanstack/react-query'
import { listExamples } from '../services/example.service'
import { exampleKeys } from '../services/keys'

export function useExampleList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: exampleKeys.list(params ?? {}),
    queryFn: () => listExamples(params),
  })
}
