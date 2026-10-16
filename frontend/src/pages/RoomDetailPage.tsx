import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { currentMember } from '../features/auth/api'
import {
  createReservation,
  getAvailableHours,
  isUnauthorized,
  reservationError,
} from '../features/reservations/api'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useRooms } from '../features/rooms/useRooms'
import { dateValue, isBookableDate, isPast } from '../features/reservations/store'
export default function RoomDetailPage() {
  const { data: rooms = [], isPending, isError, refetch } = useRooms()
  const { id } = useParams()
  const room = rooms.find((r) => r.id === id)
  const navigate = useNavigate()
  const [date, setDate] = useState(dateValue())
  const [hour, setHour] = useState<number | null>(null)
  const [people, setPeople] = useState(1)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const client = useQueryClient()
  const submitting = useRef(false)
  const auth = useQuery({ queryKey: ['auth', 'me'], queryFn: currentMember, retry: false })
  const availability = useQuery({
    queryKey: ['availability', id, date],
    queryFn: ({ signal }) => getAvailableHours(id!, date, signal),
    enabled: !!room && isBookableDate(date),
    retry: false,
    refetchInterval: 30000,
  })
  if (isPending)
    return (
      <section className="container page" role="status">
        공간 정보를 불러오는 중입니다.
      </section>
    )
  if (isError)
    return (
      <section className="container page" role="alert">
        <p>공간 정보를 불러오지 못했습니다.</p>
        <button
          className="button"
          onClick={() => {
            void refetch()
          }}
        >
          다시 시도
        </button>
      </section>
    )
  if (!room)
    return (
      <section className="container page empty">
        <h1>공간을 찾을 수 없어요.</h1>
        <Link to="/rooms">목록으로 돌아가기</Link>
      </section>
    )

  const unavailable = (h: number) =>
    !isBookableDate(date) ||
    isPast(date, h) ||
    availability.isPending ||
    availability.isError ||
    !availability.data?.includes(h)
  const submit = async () => {
    if (submitting.current) return
    setError('')
    if (!auth.data) {
      navigate('/login')
      return
    }
    if (
      hour === null ||
      unavailable(hour) ||
      !Number.isInteger(people) ||
      people < 1 ||
      people > room.capacity
    )
      return
    submitting.current = true
    setBusy(true)
    try {
      const reservation = await createReservation({
        roomId: room.id,
        reservationDate: date,
        startHour: hour,
        people,
      })
      void client.invalidateQueries({ queryKey: ['reservations'] })
      void client.invalidateQueries({ queryKey: ['availability'] })
      navigate('/reservations/' + reservation.id + '/complete')
    } catch (error) {
      setError(reservationError(error))
      if (isUnauthorized(error)) {
        client.setQueryData(['auth', 'me'], null)
        void client.cancelQueries({ queryKey: ['reservations'] })
        client.removeQueries({ queryKey: ['reservations'] })
      }
      void availability.refetch()
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }
  return (
    <section className="container page">
      <Link className="back-link" to="/rooms">
        모든 공간
      </Link>
      <div className="detail-grid">
        <article>
          <img className="detail-photo" src={room.image} alt={room.name + ' 내부'} />
          <p className="eyebrow">YOUR FOCUS SPACE</p>
          <h1>{room.name}</h1>
          <p className="lead">{room.description}</p>
          <div className="tags">
            {room.amenities.map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
          <div className="rules">
            <h2>이용 안내</h2>
            <ul>
              <li>운영 시간: 09:00–22:00 · 최대 {room.capacity}명</li>
              <li>1시간 단위로 예약할 수 있습니다.</li>
              <li>이용 시작 전까지 내 예약에서 취소할 수 있습니다.</li>
              <li>다음 이용자를 위해 공간을 정돈해 주세요.</li>
            </ul>
          </div>
        </article>
        <aside className="booking panel">
          <p className="eyebrow">MAKE TIME FOR YOURSELF</p>
          <h2>시간 선택하기</h2>
          <p className="demo-note">
            로그인한 계정으로 예약이 저장됩니다. 포트폴리오 시연용이며 실제 공간 이용이나 결제는
            제공하지 않습니다.
          </p>
          <label>
            이용 날짜
            <input
              type="date"
              disabled={busy}
              min={dateValue()}
              max={dateValue(30)}
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                setHour(null)
              }}
            />
          </label>
          <label>
            이용 인원
            <select
              disabled={busy}
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
            >
              {Array.from({ length: room.capacity }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}명
                </option>
              ))}
            </select>
          </label>
          <fieldset disabled={busy}>
            {availability.isPending && isBookableDate(date) && (
              <p role="status">예약 가능한 시간을 확인하고 있습니다.</p>
            )}
            {availability.isError && (
              <div role="alert">
                <p>예약 가능 시간을 불러오지 못했습니다.</p>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => void availability.refetch()}
                >
                  다시 시도
                </button>
              </div>
            )}
            {auth.isError && (
              <div role="alert">
                <p>로그인 상태를 확인할 수 없습니다.</p>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => void auth.refetch()}
                >
                  로그인 상태 다시 확인
                </button>
              </div>
            )}
            <legend>시작 시간 · 1시간 이용</legend>
            <div className="time-grid">
              {Array.from({ length: 13 }, (_, i) => i + 9).map((h) => (
                <button
                  type="button"
                  key={h}
                  disabled={busy || !date || unavailable(h)}
                  aria-pressed={hour === h}
                  onClick={() => setHour(h)}
                >
                  {h}:00
                </button>
              ))}
            </div>
          </fieldset>
          <p className="muted">한국 시간 기준 · 회색 시간대는 이용할 수 없습니다.</p>
          {hour !== null && unavailable(hour) && (
            <p role="status">
              선택한 시간이 마감되었거나 예약할 수 없는 상태입니다. 다른 시간을 선택해 주세요.
            </p>
          )}
          {hour !== null && !unavailable(hour) && (
            <div className="demo-note" role="status">
              {room.name} · {date}
              <br />
              {hour}:00–{hour + 1}:00 · {people}명
            </div>
          )}
          {availability.isSuccess &&
            isBookableDate(date) &&
            Array.from({ length: 13 }, (_, i) => i + 9).every(unavailable) && (
              <p role="status">
                이 날짜에는 예약 가능한 시간이 없습니다. 다른 날짜를 선택해 주세요.
              </p>
            )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button
            className="button full"
            disabled={
              busy ||
              auth.isPending ||
              auth.isError ||
              (!!auth.data && (hour === null || unavailable(hour)))
            }
            onClick={submit}
          >
            {busy ? '예약 중…' : auth.data ? '예약하기' : '로그인하고 예약하기'}
          </button>
        </aside>
      </div>
    </section>
  )
}
