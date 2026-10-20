import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAvailableHours, type Reservation, type ReservationInput } from './api'
import { dateValue, isBookableDate, isPast } from './store'
import { useRooms } from '../rooms/useRooms'

type Props = {
  reservation: Reservation
  busy: boolean
  onSave: (input: ReservationInput) => Promise<void>
  onClose: () => void
}

export function ReservationEditForm({ reservation, busy, onSave, onClose }: Props) {
  const [date, setDate] = useState(reservation.reservationDate)
  const [hour, setHour] = useState(reservation.startHour)
  const [people, setPeople] = useState(reservation.people)
  const rooms = useRooms()
  const room = rooms.data?.find((item) => item.id === reservation.roomId)
  const availability = useQuery({
    queryKey: ['availability', reservation.roomId, date],
    queryFn: ({ signal }) => getAvailableHours(reservation.roomId, date, signal),
    enabled: isBookableDate(date),
    refetchInterval: 30000,
  })
  const hours = [
    ...new Set([
      ...(availability.data ?? []),
      ...(date === reservation.reservationDate && !isPast(date, reservation.startHour)
        ? [reservation.startHour]
        : []),
    ]),
  ].sort((a, b) => a - b)
  const ready =
    isBookableDate(date) &&
    !availability.isPending &&
    !availability.isError &&
    !availability.isFetching &&
    !rooms.isError &&
    !!room &&
    hours.includes(hour) &&
    !isPast(date, hour) &&
    people >= 1 &&
    people <= room.capacity
  return (
    <form
      className="reservation-edit"
      aria-label="예약 수정"
      onSubmit={(event) => {
        event.preventDefault()
        if (ready && !busy)
          void onSave({
            roomId: reservation.roomId,
            reservationDate: date,
            startHour: hour,
            people,
          })
      }}
    >
      <h3>예약 수정</h3>
      <p className="muted">
        같은 공간의 날짜·시간·인원을 변경할 수 있습니다. 시간은 한국 시간 기준입니다.
      </p>
      <fieldset disabled={busy}>
        <label>
          날짜
          <input
            type="date"
            required
            min={dateValue()}
            max={dateValue(30)}
            value={date}
            onChange={(event) => {
              setDate(event.target.value)
              setHour(-1)
            }}
          />
        </label>
        <label>
          시작 시간
          <select value={hour} required onChange={(event) => setHour(Number(event.target.value))}>
            <option value={-1}>시간 선택</option>
            {hours.map((value) => (
              <option key={value} value={value}>
                {value}:00–{value + 1}:00
              </option>
            ))}
          </select>
        </label>
        <label>
          인원{room ? ` (최대 ${room.capacity}명)` : ''}
          <input
            type="number"
            min={1}
            max={room?.capacity}
            required
            value={people}
            onChange={(event) => setPeople(Number(event.target.value))}
          />
        </label>
      </fieldset>
      {availability.isFetching && <p role="status">예약 가능한 시간을 확인 중입니다.</p>}
      {availability.isError && (
        <p role="alert">
          시간을 불러오지 못했습니다.{' '}
          <button type="button" disabled={busy} onClick={() => void availability.refetch()}>
            다시 확인
          </button>
        </p>
      )}
      {rooms.isError && (
        <p role="alert">
          공간 정보를 불러오지 못했습니다.{' '}
          <button type="button" disabled={busy} onClick={() => void rooms.refetch()}>
            다시 확인
          </button>
        </p>
      )}
      {!availability.isPending &&
        !availability.isError &&
        isBookableDate(date) &&
        hours.length === 0 && <p>이 날짜에는 예약 가능한 시간이 없습니다.</p>}
      <div className="reservation-actions">
        <button className="button" disabled={!ready || busy} type="submit">
          {busy ? '저장 중…' : '변경 저장'}
        </button>
        <button className="button secondary" disabled={busy} type="button" onClick={onClose}>
          수정 닫기
        </button>
      </div>
    </form>
  )
}
