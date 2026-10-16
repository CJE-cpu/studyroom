import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useReservations } from '../features/reservations/useReservations'
import { useRooms } from '../features/rooms/useRooms'
export default function ReservationCompletePage() {
  const { data: rooms = [] } = useRooms()
  const { id } = useParams()
  const item = useReservations().find((r) => r.id === id)
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
              : '집중할 시간이 준비됐어요.'}
        </h1>
        {item && (
          <>
            <p>{rooms.find((r) => r.id === item.roomId)?.name || '공간 ' + item.roomId}</p>
            <p>
              {item.date} · {item.hour}:00–{item.hour + 1}:00 · {item.people}명
            </p>
            <p className="demo-note">이 브라우저에만 저장되는 데모 예약입니다.</p>
          </>
        )}
        <Link className="button" to="/reservations">
          내 예약 확인
        </Link>
      </div>
    </section>
  )
}
