import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useReservations, reservationsReady } from '../features/reservations/useReservations'
import { ReservationAccess } from '../features/reservations/ReservationAccess'
import { cancelReservation, isUnauthorized, reservationError } from '../features/reservations/api'
import { isPast } from '../features/reservations/store'

export default function MyReservationsPage() {
  const state = useReservations()
  const client = useQueryClient()
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const submitting = useRef(false)
  const cancel = async (id: number) => {
    if (submitting.current || !window.confirm('예약을 취소할까요?')) return
    submitting.current = true
    setBusyId(id)
    setError('')
    try {
      await cancelReservation(id)
    } catch (error) {
      setError(reservationError(error))
      if (isUnauthorized(error)) void client.invalidateQueries({ queryKey: ['auth', 'me'] })
    } finally {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['reservations'] }),
        client.invalidateQueries({ queryKey: ['availability'] }),
      ])
      submitting.current = false
      setBusyId(null)
    }
  }
  return (
    <section className="container page">
      <p className="eyebrow">MY RESERVATIONS</p>
      <h1>나의 집중 시간</h1>
      <p className="lead">로그인한 계정의 예약을 확인하고 관리하세요.</p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!reservationsReady(state) ? (
        <ReservationAccess state={state} />
      ) : !state.query.data?.length ? (
        <div className="empty">
          <h2>아직 예약한 공간이 없어요.</h2>
          <Link className="button" to="/rooms">
            공간 둘러보기
          </Link>
        </div>
      ) : (
        <div className="reservation-list">
          {state.query.data.map((r) => (
            <article className="panel reservation" key={r.id}>
              <div>
                <span className="status">
                  {r.status === 'CANCELLED'
                    ? '취소됨'
                    : isPast(r.reservationDate, r.endHour)
                      ? '이용 종료'
                      : isPast(r.reservationDate, r.startHour)
                        ? '이용 중'
                        : '예약 완료'}
                </span>
                <h2>{r.roomName}</h2>
                <p>
                  {r.reservationDate} · {r.startHour}:00–{r.endHour}:00 · {r.people}명
                </p>
              </div>
              <button
                className="button secondary"
                disabled={
                  busyId !== null ||
                  r.status === 'CANCELLED' ||
                  isPast(r.reservationDate, r.startHour)
                }
                onClick={() => void cancel(r.id)}
              >
                {busyId === r.id ? '취소 중…' : '예약 취소'}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
