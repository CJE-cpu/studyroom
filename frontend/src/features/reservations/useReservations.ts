import { useEffect, useState } from 'react'
import { readReservations } from './store'

export function useReservations() {
  const [items, setItems] = useState(readReservations)
  useEffect(() => {
    const refresh = () => setItems(readReservations())
    window.addEventListener('storage', refresh)
    window.addEventListener('studyroom-reservations-change', refresh)
    window.addEventListener('focus', refresh)
    const timer = window.setInterval(refresh, 30000)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('studyroom-reservations-change', refresh)
      window.removeEventListener('focus', refresh)
      window.clearInterval(timer)
    }
  }, [])
  return items
}
