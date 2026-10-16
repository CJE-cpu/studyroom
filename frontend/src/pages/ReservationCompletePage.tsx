import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useReservations, reservationsReady } from '../features/reservations/useReservations'
import { ReservationAccess } from '../features/reservations/ReservationAccess'
import { isPast } from '../features/reservations/store'
export default function ReservationCompletePage() {
  const state = useReservations()
  const { id } = useParams()
  const item = state.query.data?.find((r) => String(r.id) === id)
  if (!reservationsReady(state))
    return (
      <section className="container page">
        <ReservationAccess state={state} />
      </section>
    )
  return (
    <section className="container page">
      <div className="panel completion">
        {item?.status === 'CONFIRMED' && <CheckCircle2 size={48} />}
        <p className="eyebrow">YOUR NEXT CHAPTER</p>
        <h1>
          {!item
            ? '예약을 찾을 수 없어요.'
            : item.status === 'CANCELLED'
              ? '취소된 예약입니다.'
              : isPast(item.reservationDate, item.endHour)
                ? '이용이 종료된 예약입니다.'
                : '예약이 확인되었습니다.'}
        </h1>
        {item && (
          <>
            <p>{item.roomName}</p>
            <p>
              {item.reservationDate} · {item.startHour}:00–{item.endHour}:00 · {item.people}명
            </p>
            <p className="demo-note">
              포트폴리오 시연용 서비스로 실제 공간 이용이나 결제는 제공하지 않습니다.
            </p>
          </>
        )}
        <Link className="button" to="/reservations">
          내 예약 확인
        </Link>
      </div>
    </section>
  )
}
