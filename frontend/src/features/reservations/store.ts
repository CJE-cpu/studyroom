import { z } from 'zod'
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T00:00:00+09:00')
  return Number.isFinite(date.getTime()) && koreanDate(date) === value
}
function koreanDate(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  return ['year', 'month', 'day'].map((type) => parts.find((p) => p.type === type)!.value).join('-')
}
const itemSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  date: z.string().refine(validDate),
  hour: z.number().int().min(9).max(21),
  people: z.number().int().positive().max(100),
  status: z.enum(['CONFIRMED', 'CANCELLED']),
})
export type Reservation = z.infer<typeof itemSchema>
const KEY = 'studyroom-demo-reservations-v1'
export function readReservations(): Reservation[] {
  let raw: string | null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    return []
  }
  if (!raw) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  return parsed.flatMap((item) => {
    const result = itemSchema.safeParse(item)
    return result.success ? [result.data] : []
  })
}
export function saveReservations(items: Reservation[]) {
  localStorage.setItem(KEY, JSON.stringify(z.array(itemSchema).parse(items)))
  window.dispatchEvent(new Event('studyroom-reservations-change'))
}
export function dateValue(offset = 0) {
  const today = koreanDate(new Date())
  const date = new Date(today + 'T00:00:00+09:00')
  date.setUTCDate(date.getUTCDate() + offset)
  return koreanDate(date)
}
export function isPast(date: string, hour: number) {
  if (!validDate(date) || !Number.isInteger(hour) || hour < 0 || hour > 23) return true
  return (
    new Date(date + 'T' + String(hour).padStart(2, '0') + ':00:00+09:00').getTime() <= Date.now()
  )
}
export function isBookableDate(date: string) {
  return validDate(date) && date >= dateValue() && date <= dateValue(30)
}
