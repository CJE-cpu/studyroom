import { useState } from 'react'
import { Link } from 'react-router-dom'
import { rooms } from '../features/rooms/mockData'
import { isPast, readReservations, saveReservations } from '../features/reservations/store'
export default function MyReservationsPage() {
  const [items, setItems] = useState(readReservations)
  const [error, setError] = useState('')
  const cancel = (id: string) => {
    if (!window.confirm('예약을 취소할까요?')) return
    const latest = readReservations()
    const item = latest.find((r) => r.id === id)
    if (!item || isPast(item.date, item.hour)) {
      setError('이미 시작한 예약은 취소할 수 없습니다.')
      return
    }
    const next = latest.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' as const } : r))
    try {
      saveReservations(next)
      setItems(next)
      setError('')
    } catch {
      setError('변경 사항을 저장하지 못했습니다.')
    }
  }
  return (
    <section className="container page">
      <p className="eyebrow">MY RESERVATIONS</p>
      <h1>나의 집중 시간</h1>
      <p className="lead">이 브라우저에 저장된 데모 예약을 확인하세요.</p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!items.length ? (
        <div className="empty">
          <h2>아직 예약한 공간이 없어요.</h2>
          <p>나에게 맞는 공간부터 찾아볼까요?</p>
          <Link className="button" to="/rooms">
            공간 둘러보기
          </Link>
        </div>
      ) : (
        <div className="reservation-list">
          {[...items].reverse().map((r) => (
            <article className="panel reservation" key={r.id}>
              <div>
                <span className="status">
                  {r.status === 'CANCELLED'
                    ? '취소됨'
                    : isPast(r.date, r.hour + 1)
                      ? '이용 종료'
                      : '예약 완료'}
                </span>
                <h2>{rooms.find((room) => room.id === r.roomId)?.name || '공간'}</h2>
                <p>
                  {r.date} · {r.hour}:00–{r.hour + 1}:00 · {r.people}명
                </p>
              </div>
              <button
                className="button secondary"
                disabled={r.status === 'CANCELLED' || isPast(r.date, r.hour)}
                onClick={() => cancel(r.id)}
              >
                예약 취소
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
