import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { readReservations } from '../features/reservations/store'
import { rooms } from '../features/rooms/mockData'
export default function ReservationCompletePage() {
  const { id } = useParams()
  const item = readReservations().find((r) => r.id === id)
  return (
    <section className="container page">
      <div className="panel completion">
        <CheckCircle2 size={48} />
        <p className="eyebrow">YOUR NEXT CHAPTER</p>
        <h1>{item ? '집중할 시간이 준비됐어요.' : '예약을 찾을 수 없어요.'}</h1>
        {item && (
          <>
            <p>{rooms.find((r) => r.id === item.roomId)?.name}</p>
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
