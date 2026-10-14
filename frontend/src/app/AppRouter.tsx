import HomePage from '../pages/HomePage'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import RoomListPage from '../pages/RoomListPage'
import RoomDetailPage from '../pages/RoomDetailPage'
import MyReservationsPage from '../pages/MyReservationsPage'
import ReservationCompletePage from '../pages/ReservationCompletePage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
export default function AppRouter() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/rooms" element={<RoomListPage />} />
      <Route path="/rooms/:id" element={<RoomDetailPage />} />
      <Route path="/reservations" element={<MyReservationsPage />} />
      <Route path="/reservations/:id/complete" element={<ReservationCompletePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="*"
        element={
          <section className="container page empty">
            <h1>페이지를 찾을 수 없어요.</h1>
            <Link className="button" to="/rooms">
              공간 둘러보기
            </Link>
          </section>
        }
      />
    </Routes>
  )
}
