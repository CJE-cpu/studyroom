import axios from 'axios'
import { z } from 'zod'

const reservationSchema = z.object({
  id: z.number().int(),
  roomId: z.string(),
  roomName: z.string(),
  reservationDate: z.string(),
  startHour: z.number().int(),
  endHour: z.number().int(),
  people: z.number().int(),
  status: z.enum(['CONFIRMED', 'CANCELLED']),
  createdAt: z.string(),
  cancelledAt: z.string().nullable(),
})
export type Reservation = z.infer<typeof reservationSchema>
export type ReservationInput = {
  roomId: string
  reservationDate: string
  startHour: number
  people: number
}
export async function getReservations(signal: AbortSignal) {
  const response = await axios.get('/api/reservations/me', { signal, timeout: 10000 })
  return z.array(reservationSchema).parse(response.data)
}
export async function createReservation(input: ReservationInput) {
  const response = await axios.post('/api/reservations', input, { timeout: 15000 })
  return reservationSchema.parse(response.data)
}
export async function cancelReservation(id: number) {
  const response = await axios.patch('/api/reservations/' + id + '/cancel', {}, { timeout: 15000 })
  return reservationSchema.parse(response.data)
}
export async function getAvailableHours(roomId: string, date: string, signal: AbortSignal) {
  const response = await axios.get('/api/rooms/' + encodeURIComponent(roomId) + '/availability', {
    params: { date },
    signal,
    timeout: 10000,
  })
  return z.array(z.number().int().min(9).max(21)).parse(response.data)
}
export function reservationError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401)
      return '로그인이 만료되었거나 필요합니다. 다시 로그인해 주세요.'
    if (!error.response)
      return '서버 응답을 확인하지 못했습니다. 내 예약에서 처리 결과를 확인한 뒤 다시 시도해 주세요.'
    if (
      [400, 404, 409].includes(error.response.status) &&
      typeof error.response.data?.message === 'string'
    )
      return error.response.data.message
  }
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
export function isUnauthorized(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}
