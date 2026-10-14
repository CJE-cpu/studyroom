import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { rooms } from '../features/rooms/mockData'
import {
  dateValue,
  isPast,
  readReservations,
  saveReservations,
} from '../features/reservations/store'
export default function RoomDetailPage() {
  const { id } = useParams()
  const room = rooms.find((r) => r.id === id)
  const navigate = useNavigate()
  const [date, setDate] = useState(dateValue())
  const [hour, setHour] = useState<number | null>(null)
  const [people, setPeople] = useState(1)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!room)
    return (
      <section className="container page empty">
        <h1>공간을 찾을 수 없어요.</h1>
        <Link to="/rooms">목록으로 돌아가기</Link>
      </section>
    )
  const reservations = readReservations()
  const unavailable = (h: number) =>
    isPast(date, h) ||
    reservations.some(
      (r) => r.roomId === id && r.date === date && r.hour === h && r.status === 'CONFIRMED',
    )
  const submit = () => {
    setError('')
    if (
      !date ||
      date < dateValue() ||
      date > dateValue(30) ||
      hour === null ||
      unavailable(hour) ||
      people < 1 ||
      people > room.capacity
    ) {
      setError('예약 가능한 날짜·시간과 인원을 선택해 주세요.')
      return
    }
    setBusy(true)
    try {
      const latest = readReservations()
      if (
        latest.some(
          (r) => r.roomId === id && r.date === date && r.hour === hour && r.status === 'CONFIRMED',
        )
      )
        throw new Error('이미 선택된 시간입니다.')
      const reservation = {
        id: crypto.randomUUID(),
        roomId: room.id,
        date,
        hour,
        people,
        status: 'CONFIRMED' as const,
      }
      saveReservations([...latest, reservation])
      navigate('/reservations/' + reservation.id + '/complete')
    } catch {
      setError('예약을 저장하지 못했습니다. 저장 권한과 시간 선택을 확인해 주세요.')
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
            체험용 예약입니다. 실제 공간 예약이나 결제는 발생하지 않습니다.
          </p>
          <label>
            이용 날짜
            <input
              type="date"
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
            <select value={people} onChange={(e) => setPeople(Number(e.target.value))}>
              {Array.from({ length: room.capacity }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}명
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>시작 시간 · 1시간 이용</legend>
            <div className="time-grid">
              {Array.from({ length: 13 }, (_, i) => i + 9).map((h) => (
                <button
                  type="button"
                  key={h}
                  disabled={!date || unavailable(h)}
                  aria-pressed={hour === h}
                  onClick={() => setHour(h)}
                >
                  {h}:00
                </button>
              ))}
            </div>
          </fieldset>
          <p className="muted">회색 시간대는 이용할 수 없습니다.</p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button className="button full" disabled={busy || hour === null} onClick={submit}>
            데모 예약하기
          </button>
        </aside>
      </div>
    </section>
  )
}
