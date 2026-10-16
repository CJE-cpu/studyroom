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
