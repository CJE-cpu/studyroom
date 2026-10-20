import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useReservations, reservationsReady } from '../features/reservations/useReservations'
import { ReservationAccess } from '../features/reservations/ReservationAccess'
import { ReservationEditForm } from '../features/reservations/ReservationEditForm'
import {
  cancelReservation,
  deleteReservation,
  updateReservation,
  isUnauthorized,
  reservationError,
} from '../features/reservations/api'
import { isPast } from '../features/reservations/store'

export default function MyReservationsPage() {
  const state = useReservations()
  const client = useQueryClient()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const submitting = useRef(false)
  const perform = async (id: number, action: () => Promise<unknown>, success: string) => {
    if (submitting.current) return
    submitting.current = true
    setBusyId(id)
    setError('')
    setMessage('')
    try {
      await action()
      setEditingId(null)
      setMessage(success)
    } catch (error) {
      setError(reservationError(error))
      if (isUnauthorized(error)) void client.invalidateQueries({ queryKey: ['auth', 'me'] })
    } finally {
      try {
        await Promise.all([
          client.invalidateQueries({ queryKey: ['reservations'] }),
          client.invalidateQueries({ queryKey: ['availability'] }),
        ])
      } finally {
        submitting.current = false
        setBusyId(null)
      }
    }
  }
  return (
    <section className="container page">
      <p className="eyebrow">MY RESERVATIONS</p>
      <h1>나의 집중 시간</h1>
      <p className="lead">시작 전 예약은 수정·취소할 수 있고, 취소한 내역은 삭제할 수 있습니다.</p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {!reservationsReady(state) ? (
        <ReservationAccess state={state} />
      ) : !state.query.data?.length ? (
        <div className="empty">
          <h2>예약 내역이 없어요.</h2>
          <Link className="button" to="/rooms">
            공간 둘러보기
          </Link>
        </div>
      ) : (
        <div className="reservation-list">
          {state.query.data.map((r) => {
            const editable = r.status === 'CONFIRMED' && !isPast(r.reservationDate, r.startHour)
            return (
              <article className="panel reservation reservation-manage" key={r.id}>
                <div className="reservation-summary">
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
                  <div className="reservation-actions">
                    {editable && (
                      <>
                        <button
                          className="button secondary"
                          disabled={busyId !== null}
                          aria-expanded={editingId === r.id}
                          aria-controls={`reservation-edit-${r.id}`}
                          onClick={() => {
                            setEditingId(editingId === r.id ? null : r.id)
                            setError('')
                            setMessage('')
                          }}
                        >
                          예약 수정
                        </button>
                        <button
                          className="button secondary"
                          disabled={busyId !== null}
                          onClick={() => {
                            if (window.confirm('예약을 취소할까요?'))
                              void perform(
                                r.id,
                                () => cancelReservation(r.id),
                                '예약을 취소했습니다.',
                              )
                          }}
                        >
                          예약 취소
                        </button>
                      </>
                    )}
                    {r.status === 'CANCELLED' && (
                      <button
                        className="button secondary"
                        disabled={busyId !== null}
                        onClick={() => {
                          if (
                            window.confirm(
                              '취소한 예약 내역을 삭제할까요? 삭제 후 복구할 수 없습니다.',
                            )
                          )
                            void perform(
                              r.id,
                              () => deleteReservation(r.id),
                              '예약 내역을 삭제했습니다.',
                            )
                        }}
                      >
                        내역 삭제
                      </button>
                    )}
                    {busyId === r.id && <span role="status">처리 중…</span>}
                  </div>
                </div>
                {editingId === r.id && editable && (
                  <div id={`reservation-edit-${r.id}`}>
                    <ReservationEditForm
                      reservation={r}
                      busy={busyId !== null}
                      onClose={() => setEditingId(null)}
                      onSave={(input) =>
                        perform(r.id, () => updateReservation(r.id, input), '예약을 수정했습니다.')
                      }
                    />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
