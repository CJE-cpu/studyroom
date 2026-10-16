import { useQuery } from '@tanstack/react-query'
import { currentMember } from '../auth/api'
import { getReservations } from './api'

export function useReservations() {
  const auth = useQuery({ queryKey: ['auth', 'me'], queryFn: currentMember, retry: false })
  const query = useQuery({
    queryKey: ['reservations', auth.data?.id],
    queryFn: ({ signal }) => getReservations(signal),
    enabled: !!auth.data && !auth.isError,
    retry: false,
    refetchInterval: 30000,
  })
  return { auth, query }
}

export function reservationsReady(state: ReturnType<typeof useReservations>) {
  return !!state.auth.data && !state.auth.isError && state.query.isSuccess
}
