import { z } from 'zod'
const schema = z.array(
  z.object({
    id: z.string(),
    roomId: z.string(),
    date: z.string(),
    hour: z.number().int().min(9).max(21),
    people: z.number().int().positive(),
    status: z.enum(['CONFIRMED', 'CANCELLED']),
  }),
)
export type Reservation = z.infer<typeof schema>[number]
const KEY = 'studyroom-demo-reservations-v1'
export function readReservations(): Reservation[] {
  try {
    return schema.parse(JSON.parse(localStorage.getItem(KEY) || '[]'))
  } catch {
    return []
  }
}
export function saveReservations(items: Reservation[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}
export function dateValue(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}
export function isPast(date: string, hour: number) {
  return new Date(date + 'T' + String(hour).padStart(2, '0') + ':00:00').getTime() <= Date.now()
}
