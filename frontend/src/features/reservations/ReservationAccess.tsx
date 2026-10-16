import { Link } from 'react-router-dom'
import type { useReservations } from './useReservations'
import { isUnauthorized, reservationError } from './api'

export function ReservationAccess({ state }: { state: ReturnType<typeof useReservations> }) {
  const { auth, query } = state
  if (auth.isPending) return <p role="status">로그인을 확인하고 있습니다.</p>
  if (auth.isError)
    return (
      <div role="alert">
        <p>서버에 연결하지 못했습니다.</p>
        <button className="button" onClick={() => void auth.refetch()}>
          다시 시도
        </button>
      </div>
    )
  if (!auth.data || isUnauthorized(query.error))
    return (
      <div className="empty">
        <p>예약을 확인하려면 로그인해 주세요.</p>
        <Link className="button" to="/login">
          로그인
        </Link>
      </div>
    )
  if (query.isError)
    return (
      <div role="alert">
        <p>{reservationError(query.error)}</p>
        <button className="button" onClick={() => void query.refetch()}>
          다시 시도
        </button>
      </div>
    )
  return <p role="status">예약을 불러오는 중입니다.</p>
}
